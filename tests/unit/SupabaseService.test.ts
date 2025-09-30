import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '@modules/data/SupabaseService';
import { supabaseClientManager } from '@modules/data/SupabaseClient';
import { SupabaseConfigurationError } from '@config/supabase.config';
import AppStateManager from '@core/AppState';
import { dataSyncService } from '@modules/data/DataSyncService';

const submissionResponse = { data: { id: 'submission-123' }, error: null };

const createMockClient = () => {
  const singleMock = vi.fn().mockResolvedValue(submissionResponse);
  const selectMock = vi.fn(() => ({ single: singleMock }));
  const insertSubmissionMock = vi.fn(() => ({ select: selectMock }));

  const insertCoordinatesMock = vi.fn().mockResolvedValue({ error: null });

  const fromMock = vi.fn((table: string) => {
    if (table === 'form_submissions') {
      return { insert: insertSubmissionMock } as unknown;
    }
    if (table === 'extraction_coordinates') {
      return { insert: insertCoordinatesMock } as unknown;
    }
    throw new Error(`Unexpected table access: ${table}`);
  });

  const client = {
    from: fromMock
  } as const;

  return {
    client,
    mocks: {
      insertSubmissionMock,
      insertCoordinatesMock,
      singleMock
    }
  };
};

describe('SupabaseService', () => {
  beforeEach(() => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key';
  });

  afterEach(() => {
    supabaseClientManager.setClientForTesting(null);
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    vi.restoreAllMocks();
  });

  it('saves form submissions and coordinates', async () => {
    const { client, mocks } = createMockClient();
    supabaseClientManager.setClientForTesting(client as unknown as SupabaseClient);

    const service = SupabaseService.getInstance();

    const payload = {
      documentName: 'Test Document',
      formData: { fieldA: 'Value', fieldB: 'Other' },
      extractions: [
        {
          id: 'ext-1',
          timestamp: new Date().toISOString(),
          fieldName: 'fieldA',
          text: 'Sample text',
          page: 2,
          coordinates: { x: 10, y: 20, width: 100, height: 30 },
          method: 'manual',
          documentName: 'Test Document'
        }
      ],
      totalPages: 12
    };

    const submissionId = await service.saveExtractionSession(payload);

    expect(submissionId).toBe('submission-123');

    expect(mocks.insertSubmissionMock).toHaveBeenCalledWith({
      document_name: 'Test Document',
      total_pages: 12,
      extraction_count: 1,
      form_payload: payload.formData,
      metadata: null
    });

    expect(mocks.insertCoordinatesMock).toHaveBeenCalledWith([
      expect.objectContaining({
        submission_id: 'submission-123',
        field_name: 'fieldA',
        page: 2,
        x: 10,
        y: 20,
        width: 100,
        height: 30,
        selection_method: 'manual'
      })
    ]);
  });

  it('throws when configuration is missing', async () => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const service = SupabaseService.getInstance();

    await expect(() => service.saveExtractionSession({
      documentName: 'Doc',
      formData: {},
      extractions: [],
      totalPages: 0
    })).rejects.toBeInstanceOf(SupabaseConfigurationError);
  });

  it('persists via DataSyncService and updates AppState', async () => {
    const { client } = createMockClient();
    supabaseClientManager.setClientForTesting(client as unknown as SupabaseClient);

    AppStateManager.setState({
      documentName: 'Doc 1',
      extractions: [
        {
          id: 'ext-1',
          timestamp: new Date().toISOString(),
          fieldName: 'fieldA',
          text: 'Sample text',
          page: 1,
          coordinates: { x: 5, y: 5, width: 10, height: 20 },
          method: 'manual',
          documentName: 'Doc 1'
        }
      ],
      totalPages: 6
    });

    const submissionId = await dataSyncService.persistCurrentSession({ fieldA: 'Value' });

    expect(submissionId).toBe('submission-123');

    const state = AppStateManager.getState();
    expect(state.lastSubmissionId).toBe('submission-123');

    AppStateManager.reset();
  });
});
