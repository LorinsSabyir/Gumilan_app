import { supabase } from '@/lib/supabase';

/** Clears this device's session immediately and attempts server revocation. */
export async function signOutCurrentDevice() {
  return supabase.auth.signOut({ scope: 'local' });
}
