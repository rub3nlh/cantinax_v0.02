/*
  # Create addresses table

  1. New Tables
    - `addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `recipient_name` (text)
      - `phone` (text)
      - `address` (text)
      - `province` (text)
      - `municipality` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `addresses` table
    - Add policies for authenticated users to:
      - Read their own addresses
      - Create new addresses
      - Delete their own addresses
*/

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  province text NOT NULL,
  municipality text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);