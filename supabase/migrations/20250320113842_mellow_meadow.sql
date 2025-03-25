/*
  # Fix column names and data handling

  1. Changes
    - Ensure consistent column naming between code and database
    - Add missing columns if needed
    - Fix data types and constraints

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Ensure all columns exist with correct names and types
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'recipient_name'
  ) THEN
    ALTER TABLE addresses ADD COLUMN recipient_name text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'phone'
  ) THEN
    ALTER TABLE addresses ADD COLUMN phone text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'address'
  ) THEN
    ALTER TABLE addresses ADD COLUMN address text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'province'
  ) THEN
    ALTER TABLE addresses ADD COLUMN province text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'municipality'
  ) THEN
    ALTER TABLE addresses ADD COLUMN municipality text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE addresses ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Fix any camelCase column names if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'recipientName'
  ) THEN
    ALTER TABLE addresses RENAME COLUMN "recipientName" TO recipient_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE addresses RENAME COLUMN "createdAt" TO created_at;
  END IF;
END $$;