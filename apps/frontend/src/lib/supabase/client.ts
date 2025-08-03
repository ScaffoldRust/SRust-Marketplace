import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables')
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl!,
  supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

export const adminClient: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl!,
  supabaseServiceRoleKey!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

export { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey }

export type SupabaseAdmin = typeof adminClient
export type SupabasePublic = typeof supabase
