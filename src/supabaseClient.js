import { createClient } from '@supabase/supabase-js';

// You will get these URLs and Keys from your Supabase Project Settings > API
const supabaseUrl = 'https://dpspitlnkzsbfexmeizf.supabase.co';
const supabaseKey = 'sb_publishable_2KgIoQKai4fz8LcOn7nGDQ_4f2v3hEE';

export const supabase = createClient(supabaseUrl, supabaseKey);