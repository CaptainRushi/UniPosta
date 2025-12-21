import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// These should be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

if (supabaseUrl.includes('YOUR_PROJECT_ID') || supabaseKey === 'YOUR_ANON_KEY') {
    console.warn('WARNING: Supabase keys are using default placeholders. Check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
