const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables based on environment
dotenv.config({ path: '.env.local' });
dotenv.config();

// Ensure the variables you provided are loaded from the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gyijairxcbfmpgclsrey.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_-2HEzLDWv9tQU962MUcD6Q_LrhY2Rt0';

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY are set in .env.local!");
}

// Create and export the Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase JS Client Initialized');

module.exports = supabase;
