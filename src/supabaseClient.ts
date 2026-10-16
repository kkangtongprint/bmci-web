import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvslsrifqdsiubmsapqy.supabase.co';
// 아까 Supabase 설정에서 확인하신 sb_publishable_... 키를 여기에 넣습니다.
const SUPABASE_ANON_KEY = 'sb_publishable_zg-BKtmwC4uQo0KoAS1Qrg_50nQHM1U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
