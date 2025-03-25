/*
  # Fix addresses table column names

  1. Changes
    - Rename columns to follow snake_case convention
    - Fix column name mismatches between code and database
  2. Security
    - No security changes needed
*/

DO $$ BEGIN
  -- Rename columns if they exist with camelCase names
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'recipientname'
  ) THEN
    ALTER TABLE addresses RENAME COLUMN recipientname TO recipient_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'createdat'
  ) THEN
    ALTER TABLE addresses RENAME COLUMN createdat TO created_at;
  END IF;

  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'recipient_name'
  ) THEN
    ALTER TABLE addresses ADD COLUMN recipient_name text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE addresses ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;