/*
  # Add policy for users to create their own deliveries

  1. Changes
    - Add policy allowing users to create deliveries for their own orders
    - Maintain existing RLS policies
    - Add logging for policy creation

  2. Security
    - Ensure users can only create deliveries for orders they own
    - Maintain existing security model
*/

-- Create policy for users to create their own deliveries
CREATE POLICY "Allow users to create their own deliveries" 
ON order_deliveries
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Log the policy creation
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Created policy allowing users to create deliveries for their own orders',
  'CREATE',
  '/migrations/add_user_delivery_policy'
);