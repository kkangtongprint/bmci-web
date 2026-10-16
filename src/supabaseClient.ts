import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvslsrifqdsiubmsapqy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zg-BKtmwC4uQo0KoAS1Qrg_50nQHM1U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
