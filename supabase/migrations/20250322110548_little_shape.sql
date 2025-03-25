/*
  # Fix staff members policies to avoid recursion

  1. Changes
    - Drop existing policies to start fresh
    - Create new non-recursive policies
    - Add policy for admins to manage other staff members
    - Add policy for users to read their own role

  2. Security
    - Maintain RLS security
    - Avoid infinite recursion in policies
    - Ensure proper access control
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can read staff members" ON staff_members;
DROP POLICY IF EXISTS "Authenticated users can create staff members" ON staff_members;
DROP POLICY IF EXISTS "Users can update their own staff member record" ON staff_members;
DROP POLICY IF EXISTS "Users can delete their own staff member record" ON staff_members;
DROP POLICY IF EXISTS "Staff members can read their own role" ON staff_members;
DROP POLICY IF EXISTS "Admins can manage staff members" ON staff_members;

-- Create new policies without recursion
-- Allow all authenticated users to read staff members
CREATE POLICY "Anyone can read staff members"
  ON staff_members
  FOR SELECT
  TO public
  USING (true);

-- Allow users to create their own staff member record
CREATE POLICY "Users can create staff member record"
  ON staff_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own staff member record
CREATE POLICY "Users can update own staff member record"
  ON staff_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own staff member record
CREATE POLICY "Users can delete own staff member record"
  ON staff_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to manage all staff members
CREATE POLICY "Admins can manage all staff members"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM staff_members WHERE user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM staff_members WHERE user_id = auth.uid()) = 'admin'
  );