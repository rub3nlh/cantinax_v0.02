/*
  # Fix staff members policies to prevent recursion

  1. Changes
    - Drop existing policies
    - Create new non-recursive policies
    - Add separate policies for admins and regular users
    - Use direct user_id checks instead of recursive queries

  2. Security
    - Maintain RLS security
    - Prevent infinite recursion
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read staff members" ON staff_members;
DROP POLICY IF EXISTS "Users can create staff member record" ON staff_members;
DROP POLICY IF EXISTS "Users can update own staff member record" ON staff_members;
DROP POLICY IF EXISTS "Users can delete own staff member record" ON staff_members;
DROP POLICY IF EXISTS "Admins can manage all staff members" ON staff_members;

-- Create new policies
-- Basic read access for role checking
CREATE POLICY "Anyone can read staff members"
  ON staff_members
  FOR SELECT
  TO public
  USING (true);

-- Users can manage their own records
CREATE POLICY "Users can manage own staff record"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin(user_uid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM staff_members
    WHERE user_id = user_uid
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policy using the helper function
CREATE POLICY "Admins can manage all records"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));