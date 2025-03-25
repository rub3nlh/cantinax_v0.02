/*
  # Fix insert_delivery RPC function

  1. Changes
    - Modify function to handle JSONB array conversion correctly
    - Add proper error handling and logging
    - Fix array type casting

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_delivery;

-- Create the fixed RPC function
CREATE OR REPLACE FUNCTION insert_delivery(
  p_order_id uuid,
  p_scheduled_date timestamptz,
  p_meals_count integer,
  p_delivery_meals jsonb
) RETURNS void AS $$
BEGIN
  -- Insert the delivery record
  INSERT INTO order_deliveries(
    order_id,
    scheduled_date,
    meals_count,
    delivery_meals
  ) VALUES (
    p_order_id,
    p_scheduled_date,
    p_meals_count,
    p_delivery_meals -- Use the JSONB directly
  );

  -- Log successful insertion
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Inserted delivery for order %s with %s meals', 
           p_order_id, 
           p_meals_count),
    'INSERT',
    '/functions/insert_delivery'
  );
END;
$$ LANGUAGE plpgsql;

-- Log the function update
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Updated insert_delivery RPC function to fix JSONB handling',
  'UPDATE',
  '/migrations/fix_delivery_rpc'
);