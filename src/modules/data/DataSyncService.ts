/**
 * Data synchronization service
 * Bridges form submission events with Supabase persistence
 */

import AppStateManager from '@core/AppState';
import type { Extraction } from '@types/extraction.types';
import { SupabaseService } from './SupabaseService';
import { SupabaseConfigurationError } from '@config/supabase.config';

export class DataSyncService {
  private supabase = SupabaseService.getInstance();

  async persistCurrentSession(formData: Record<string, string>): Promise<string | null> {
    const state = AppStateManager.getState();
    const extractions: Extraction[] = state.extractions;

    if (!this.supabase.isConfigured()) {
      throw new SupabaseConfigurationError('Supabase configuration is missing');
    }

    const submissionId = await this.supabase.saveExtractionSession({
      documentName: state.documentName || formData['study_id'] || 'unknown-document',
      formData,
      extractions,
      totalPages: state.totalPages,
      metadata: {
        extractionStepCount: state.totalSteps,
        activeField: state.activeField,
        extractionSource: 'pdfjs-manual-selection'
      }
    });

    AppStateManager.setState({ lastSubmissionId: submissionId });

    return submissionId;
  }
}

export const dataSyncService = new DataSyncService();
