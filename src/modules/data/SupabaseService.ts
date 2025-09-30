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

    // Persisting through a Postgres RPC keeps the submission and coordinate rows in the same
    // transaction so a failure in either write path rolls everything back. This protects the
    // downstream review tooling from referencing orphaned submissions.
    const coordinatePayload = payload.extractions.map(ext => ({
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

    const { data, error } = await client.rpc<string>('save_submission_with_coordinates', {
      document_name: payload.documentName,
      form_payload: payload.formData,
      total_pages: payload.totalPages ?? null,
      metadata: payload.metadata ?? null,
      coordinates: coordinatePayload
    });

    if (error) {
      const details = [error.message, error.details, error.hint].filter(Boolean).join(' | ');
      throw new Error(`Failed to persist submission: ${details || 'Unknown error'}`);
    }

    if (!data) {
      throw new Error('Supabase did not return a submission ID after saving.');
    }

    return data;
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
