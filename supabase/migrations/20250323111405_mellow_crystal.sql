/*
  # Fix JSONB array handling in create_order_deliveries function

  1. Changes
    - Fix array handling using proper type casting
    - Use array_to_json for proper conversion
    - Improve error handling and logging

  2. Security
    - No changes to security model
    - Maintain existing RLS policies
*/

-- Drop the old function and recreate it
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  delivery_date timestamptz;
  current_batch jsonb[];
  meal_json jsonb;
BEGIN
  -- Convert meals array to json first, then to jsonb array
  meal_json := array_to_json(NEW.meals)::jsonb;
  total_meals := jsonb_array_length(meal_json);
  
  -- Set initial delivery date (5 hours from order creation)
  delivery_date := NEW.created_at + interval '5 hours';
  
  -- Process meals in pairs
  FOR i IN 0..(total_meals-1) BY 2 LOOP
    -- Initialize empty array for current batch
    current_batch := ARRAY[]::jsonb[];
    
    -- Add first meal
    current_batch := array_append(current_batch, meal_json->i);
    
    -- Add second meal if available
    IF i + 1 < total_meals THEN
      current_batch := array_append(current_batch, meal_json->(i + 1));
    END IF;
    
    -- Create delivery record
    INSERT INTO order_deliveries (
      order_id,
      scheduled_date,
      meals_count,
      delivery_meals
    ) VALUES (
      NEW.id,
      delivery_date,
      array_length(current_batch, 1),
      current_batch
    );
    
    -- Update delivery date for next batch
    delivery_date := delivery_date + interval '2 days';
  END LOOP;
  
  -- Log successful creation
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Created deliveries for order %s with %s meals', 
           NEW.id, 
           total_meals),
    'INSERT',
    '/functions/create_order_deliveries'
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Error creating deliveries for order %s: %s', 
           NEW.id, 
           SQLERRM),
    'ERROR',
    '/functions/create_order_deliveries'
  );
  RAISE;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;
CREATE TRIGGER create_deliveries_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_deliveries();

-- Log the function update
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Updated create_order_deliveries function to fix JSONB array handling using array_to_json',
  'UPDATE',
  '/migrations/fix_jsonb_array_handling'
);