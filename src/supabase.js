// Supabase connection (login, database, file storage, realtime).
// Configure with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (the *publishable* key, never the secret key)
// in .env.local for development, or in Vercel → Project → Settings → Environment Variables.
import { createClient } from '@supabase/supabase-js';

const URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Turn on only after supabase/schema.sql has been run: VITE_USE_SUPABASE=true
const ENABLED = String(import.meta.env.VITE_USE_SUPABASE || '').trim().toLowerCase() === 'true';
export const supaMode = ENABLED && !!(URL && KEY);
export const SUPA_URL = URL;

export const supabase = supaMode
  ? createClient(URL, KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // e-mail links come back as ?code=…, which works with the app's #/ routes
      storageKey: 'sb-upskillr-auth',
    },
  })
  : null;

// Public link of a stored file. `id` is "<bucket>/<path>".
export function publicFileUrl(id, { download = false, name = '' } = {}) {
  if (!supaMode || !id) return '';
  const path = String(id).split('/').map(encodeURIComponent).join('/');
  return `${URL}/storage/v1/object/public/${path}${download ? `?download=${encodeURIComponent(name || '')}` : ''}`;
}
