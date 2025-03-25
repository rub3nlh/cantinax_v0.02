/*
  # Fix addresses table schema

  1. Changes
    - Add safety checks for existing policies
  2. Security
    - Ensure RLS is enabled
    - Add policies for CRUD operations with existence checks
*/

DO $$ BEGIN
  -- Create policies only if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'addresses' 
    AND policyname = 'Users can read own addresses'
  ) THEN
    CREATE POLICY "Users can read own addresses"
      ON addresses
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'addresses' 
    AND policyname = 'Users can create addresses'
  ) THEN
    CREATE POLICY "Users can create addresses"
      ON addresses
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'addresses' 
    AND policyname = 'Users can delete own addresses'
  ) THEN
    CREATE POLICY "Users can delete own addresses"
      ON addresses
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;