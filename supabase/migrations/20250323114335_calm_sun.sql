/*
  # Create RPC function for delivery insertion

  1. New Functions
    - `insert_delivery`: RPC function to properly handle JSONB array insertion
    - Takes order_id, scheduled_date, meals_count, and delivery_meals as parameters
    - Properly converts delivery_meals to JSONB array

  2. Security
    - Function runs with invoker privileges
    - Uses existing RLS policies
*/

-- Create the RPC function
CREATE OR REPLACE FUNCTION insert_delivery(
  p_order_id uuid,
  p_scheduled_date timestamptz,
  p_meals_count integer,
  p_delivery_meals jsonb
) RETURNS void AS $$
BEGIN
  -- Insert the delivery with proper JSONB array conversion
  INSERT INTO order_deliveries(
    order_id,
    scheduled_date,
    meals_count,
    delivery_meals
  ) VALUES (
    p_order_id,
    p_scheduled_date,
    p_meals_count,
    array[p_delivery_meals]::jsonb[] -- Convert to jsonb array properly
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
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Error inserting delivery for order %s: %s', 
           p_order_id, 
           SQLERRM),
    'ERROR',
    '/functions/insert_delivery'
  );
  RAISE;
END;
$$ LANGUAGE plpgsql;

-- Log the function creation
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Created insert_delivery RPC function',
  'CREATE',
  '/migrations/create_delivery_rpc'
);