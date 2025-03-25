/*
  # Create staff members table with fixed policies

  1. New Tables
    - `staff_members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - 'admin', 'chef', or 'delivery'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on staff_members table
    - Add policies for:
      - Anyone can read staff members (needed to check roles)
      - Only authenticated users can create/update/delete staff members
*/

-- Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT role_check CHECK (role IN ('admin', 'chef', 'delivery')),
  CONSTRAINT user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read staff members (needed for role checks)
CREATE POLICY "Anyone can read staff members"
  ON staff_members
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create staff members
CREATE POLICY "Authenticated users can create staff members"
  ON staff_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own staff member record
CREATE POLICY "Users can update their own staff member record"
  ON staff_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own staff member record
CREATE POLICY "Users can delete their own staff member record"
  ON staff_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);