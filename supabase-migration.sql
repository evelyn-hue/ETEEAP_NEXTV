-- Run this in Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/vtrwzdvgrffoazqgblox/sql/new

ALTER TABLE auth ADD COLUMN IF NOT EXISTS otp_code text;
ALTER TABLE auth ADD COLUMN IF NOT EXISTS otp_expires_at timestamptz;
ALTER TABLE auth ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE auth ADD COLUMN IF NOT EXISTS reset_token text;
ALTER TABLE auth ADD COLUMN IF NOT EXISTS reset_token_expires_at timestamptz;
ALTER TABLE auth ADD COLUMN IF NOT EXISTS google_id text;

-- Verify
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'auth' AND column_name IN ('otp_code', 'otp_expires_at', 'email_verified', 'reset_token', 'reset_token_expires_at', 'google_id');
