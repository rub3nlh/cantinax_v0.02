/*
  # Add logging function for debugging

  1. New Functions
    - http_request_log: Stores debug logs in a table
    - Allows tracking API calls and their results
    
  2. New Tables
    - debug_logs: Stores application logs
    - Helps track admin status checks
*/

-- Create debug logs table
CREATE TABLE IF NOT EXISTS debug_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  message text,
  method text,
  path text,
  user_id uuid DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE debug_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create logs
CREATE POLICY "Users can create logs"
  ON debug_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create logging function
CREATE OR REPLACE FUNCTION http_request_log(
  message text,
  method text DEFAULT 'GET',
  path text DEFAULT '/'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO debug_logs (message, method, path, user_id)
  VALUES (message, method, path, auth.uid());
END;
$$;