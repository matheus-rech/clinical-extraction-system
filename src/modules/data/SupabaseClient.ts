/**
 * Supabase client singleton
 * Ensures the application only instantiates one Supabase client instance
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseConfig, getSupabaseConfig, SupabaseConfigurationError } from '@config/supabase.config';

class SupabaseClientManager {
  private client: SupabaseClient | null = null;

  getClient(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    const config = getSupabaseConfig();

    try {
      assertSupabaseConfig(config);
    } catch (error) {
      if (error instanceof SupabaseConfigurationError) {
        throw error;
      }
      throw new SupabaseConfigurationError('Failed to validate Supabase configuration.');
    }

    this.client = createClient(config.url, config.anonKey, {
      db: { schema: config.schema },
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (...args) => fetch(...args) }
    });

    return this.client;
  }

  setClientForTesting(client: SupabaseClient | null): void {
    this.client = client;
  }
}

export const supabaseClientManager = new SupabaseClientManager();
