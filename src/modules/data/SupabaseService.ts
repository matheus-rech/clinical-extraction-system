/**
 * Supabase data service
 * Handles persistence of form submissions and extraction coordinate data
 */

import { supabaseClientManager } from './SupabaseClient';
import { SupabaseConfigurationError, isSupabaseConfigured } from '@config/supabase.config';
import type { Extraction } from '@types/extraction.types';

export interface SaveExtractionPayload {
  documentName: string;
  formData: Record<string, string>;
  extractions: Extraction[];
  totalPages: number;
  metadata?: Record<string, unknown>;
}

export interface FormSubmissionRow {
  id: string;
  document_name: string;
  total_pages: number | null;
  extraction_count: number;
  form_payload: Record<string, string>;
  metadata: Record<string, unknown> | null;
  submitted_at: string;
}

export interface ExtractionCoordinateRow {
  id: string;
  submission_id: string;
  field_name: string;
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selection_method: string;
  document_name: string;
  created_at: string;
}

export class SupabaseService {
  private static instance: SupabaseService;

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  async saveExtractionSession(payload: SaveExtractionPayload): Promise<string> {
    if (!this.isConfigured()) {
      throw new SupabaseConfigurationError('Supabase configuration is missing');
    }

    const client = supabaseClientManager.getClient();

    const submissionInsert = {
      document_name: payload.documentName,
      total_pages: payload.totalPages || null,
      extraction_count: payload.extractions.length,
      form_payload: payload.formData,
      metadata: payload.metadata ?? null
    };

    const { data: submissionData, error: submissionError } = await client
      .from<FormSubmissionRow>('form_submissions')
      .insert(submissionInsert)
      .select('id')
      .single();

    if (submissionError || !submissionData) {
      throw new Error(`Failed to save form submission: ${submissionError?.message ?? 'Unknown error'}`);
    }

    const coordinateRows = payload.extractions.map(ext => ({
      submission_id: submissionData.id,
      field_name: ext.fieldName,
      page: ext.page,
      text: ext.text,
      x: ext.coordinates.x,
      y: ext.coordinates.y,
      width: ext.coordinates.width,
      height: ext.coordinates.height,
      selection_method: ext.method,
      document_name: payload.documentName
    }));

    if (coordinateRows.length > 0) {
      const { error: coordinatesError } = await client
        .from('extraction_coordinates')
        .insert(coordinateRows);

      if (coordinatesError) {
        throw new Error(`Failed to save coordinate data: ${coordinatesError.message}`);
      }
    }

    return submissionData.id;
  }

  async fetchSubmissionWithCoordinates(submissionId: string): Promise<{ submission: FormSubmissionRow; coordinates: ExtractionCoordinateRow[]; }> {
    if (!this.isConfigured()) {
      throw new SupabaseConfigurationError('Supabase configuration is missing');
    }

    const client = supabaseClientManager.getClient();

    const [{ data: submission, error: submissionError }, { data: coordinates, error: coordinatesError }] = await Promise.all([
      client.from<FormSubmissionRow>('form_submissions').select('*').eq('id', submissionId).single(),
      client.from<ExtractionCoordinateRow>('extraction_coordinates').select('*').eq('submission_id', submissionId)
    ]);

    if (submissionError || !submission) {
      throw new Error(`Failed to fetch submission: ${submissionError?.message ?? 'Unknown error'}`);
    }

    if (coordinatesError || !coordinates) {
      throw new Error(`Failed to fetch coordinates: ${coordinatesError?.message ?? 'Unknown error'}`);
    }

    return { submission, coordinates };
  }
}
