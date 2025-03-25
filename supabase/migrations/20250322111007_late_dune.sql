/*
  # Add initial admin user

  1. Changes
    - Add initial admin user with the correct user ID
    - Use the actual user ID from the authenticated user

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Insert the admin user with the correct user ID
INSERT INTO staff_members (user_id, role)
VALUES ('dcfb3883-b154-4f39-8272-b4745014a692', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin';

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);