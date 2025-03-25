/*
  # Fix staff members policies and queries

  1. Changes
    - Drop existing policies
    - Create simplified policies without recursion
    - Add index on user_id for faster lookups
    - Add index on role for faster admin checks

  2. Security
    - Maintain RLS security
    - Ensure proper access control
    - Optimize query performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read staff members" ON staff_members;
DROP POLICY IF EXISTS "Users can manage own staff record" ON staff_members;
DROP POLICY IF EXISTS "Admins can manage all records" ON staff_members;
DROP FUNCTION IF EXISTS is_admin;

-- Create new policies
CREATE POLICY "Anyone can read staff members"
  ON staff_members
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own staff record"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);

-- Create helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin(user_uid uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM staff_members
  WHERE user_id = user_uid
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;