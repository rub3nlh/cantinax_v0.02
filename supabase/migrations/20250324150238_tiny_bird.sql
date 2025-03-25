/*
  # Fix order_deliveries table schema

  1. Changes
    - Add missing meals_count column to order_deliveries table
    - Ensure proper column type and constraints
    - Maintain existing data if any

  2. Security
    - No changes to security model
    - Maintain existing RLS policies
*/

-- Add meals_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_deliveries' 
    AND column_name = 'meals_count'
  ) THEN
    ALTER TABLE order_deliveries 
    ADD COLUMN meals_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Log the migration
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Added missing meals_count column to order_deliveries table',
  'ALTER',
  '/migrations/fix_order_deliveries_schema'
);