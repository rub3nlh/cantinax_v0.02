/*
  # Create staff members table

  1. New Tables
    - `staff_members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - 'admin', 'chef', or 'delivery'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on staff_members table
    - Add policies for:
      - Staff members can read their own role
      - Only admins can manage other staff members

  3. Changes
    - Remove initial admin user insertion to avoid foreign key constraint error
    - Admin users will be added manually through the Supabase dashboard
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

-- Policies for staff_members
CREATE POLICY "Staff members can read their own role"
  ON staff_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage staff members"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );