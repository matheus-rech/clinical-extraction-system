import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '@modules/data/SupabaseService';
import { supabaseClientManager } from '@modules/data/SupabaseClient';
import { SupabaseConfigurationError } from '@config/supabase.config';
import AppStateManager from '@core/AppState';
import { dataSyncService } from '@modules/data/DataSyncService';

type RpcResponse = { data: string | null; error: { message: string; details?: string | null; hint?: string | null } | null };

const defaultRpcResponse: RpcResponse = { data: 'submission-123', error: null };

const createMockClient = (response: RpcResponse = defaultRpcResponse) => {
  const rpcMock = vi.fn().mockResolvedValue(response);
  const fromMock = vi.fn();

  const client = {
    rpc: rpcMock,
    from: fromMock
  } as unknown as SupabaseClient;

  return {
    client,
    mocks: {
      rpcMock
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
    AppStateManager.reset();
    vi.restoreAllMocks();
  });

  it('saves form submissions and coordinates through the transactional RPC', async () => {
    const { client, mocks } = createMockClient();
    supabaseClientManager.setClientForTesting(client);

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
    expect(mocks.rpcMock).toHaveBeenCalledWith('save_submission_with_coordinates', {
      document_name: 'Test Document',
      form_payload: payload.formData,
      total_pages: 12,
      metadata: null,
      coordinates: [
        expect.objectContaining({
          field_name: 'fieldA',
          page: 2,
          x: 10,
          y: 20,
          width: 100,
          height: 30,
          selection_method: 'manual',
          document_name: 'Test Document'
        })
      ]
    });
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

  it('surfaces RPC failures and avoids recording a submission id', async () => {
    const rpcError = {
      message: 'insert failed',
      details: 'coordinate insert violated constraint',
      hint: 'Check bounding box payload'
    };
    const { client } = createMockClient({ data: null, error: rpcError });
    supabaseClientManager.setClientForTesting(client);

    const service = SupabaseService.getInstance();

    await expect(service.saveExtractionSession({
      documentName: 'Doc',
      formData: {},
      extractions: [],
      totalPages: 1
    })).rejects.toThrow(
      'Failed to persist submission: insert failed | coordinate insert violated constraint | Check bounding box payload'
    );
  });

  it('persists via DataSyncService and updates AppState', async () => {
    const { client } = createMockClient();
    supabaseClientManager.setClientForTesting(client);

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
  });

  it('does not update AppState when the RPC fails', async () => {
    const rpcError = {
      message: 'insert failed',
      details: 'coordinate insert violated constraint',
      hint: null
    };
    const { client } = createMockClient({ data: null, error: rpcError });
    supabaseClientManager.setClientForTesting(client);

    AppStateManager.setState({
      documentName: 'Doc 2',
      extractions: [],
      totalPages: 3
    });

    await expect(dataSyncService.persistCurrentSession({})).rejects.toThrow('Failed to persist submission: insert failed | coordinate insert violated constraint');

    const state = AppStateManager.getState();
    expect(state.lastSubmissionId).toBeNull();
  });
});
