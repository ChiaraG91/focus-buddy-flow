import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hibraipjmoxujjarlhyo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bD8rN7rw0wna8f87wKFwyg_9fMli1eK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
