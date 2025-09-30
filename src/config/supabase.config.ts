/**
 * Supabase configuration helpers
 * Provides access to environment-backed configuration for the Supabase client
 */

export interface SupabaseEnvironmentConfig {
  url: string;
  anonKey: string;
  schema: string;
}

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

function getMetaEnv(): ImportMetaEnv | undefined {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as ImportMeta)?.env) {
      return (import.meta as ImportMeta).env;
    }
  } catch (_) {
    // Accessing import.meta can throw in certain SSR/test contexts - ignore here
  }
  return undefined;
}

export function getSupabaseConfig(): SupabaseEnvironmentConfig {
  const metaEnv = getMetaEnv();
  const processEnv = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : undefined;

  let url = metaEnv?.VITE_SUPABASE_URL ?? processEnv?.VITE_SUPABASE_URL;
  if (!url) {
    console.warn('[Supabase Config] Missing environment variable: VITE_SUPABASE_URL');
    url = '';
  }

  let anonKey = metaEnv?.VITE_SUPABASE_ANON_KEY ?? processEnv?.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.warn('[Supabase Config] Missing environment variable: VITE_SUPABASE_ANON_KEY');
    anonKey = '';
  }

  let schema = metaEnv?.VITE_SUPABASE_SCHEMA ?? processEnv?.VITE_SUPABASE_SCHEMA;
  if (!schema) {
    console.warn('[Supabase Config] Missing environment variable: VITE_SUPABASE_SCHEMA. Defaulting to "public".');
    schema = 'public';
  }

  return { url, anonKey, schema };
}

export function assertSupabaseConfig(config: SupabaseEnvironmentConfig): void {
  if (!config.url || !config.anonKey) {
    throw new SupabaseConfigurationError('Supabase environment variables are not configured.');
  }
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}
