/*
  # Fix create_order_deliveries function array handling

  1. Changes
    - Fix jsonb_array_elements usage
    - Properly handle meal array iteration
    - Maintain existing delivery scheduling logic
    - Add better error handling and logging

  2. Security
    - No changes to security model
    - Maintain existing RLS policies
*/

-- Drop the old function and recreate it
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  remaining_meals integer;
  delivery_date timestamptz;
  current_meals jsonb;
  meal_batch jsonb[];
  meal_count integer := 0;
BEGIN
  -- Get number of meals from the order
  remaining_meals := array_length(NEW.meals, 1);
  
  -- Set initial delivery date (5 hours from order creation)
  delivery_date := NEW.created_at + interval '5 hours';
  
  -- Initialize meal batch
  meal_batch := ARRAY[]::jsonb[];
  
  -- Process all meals
  FOR i IN 1..remaining_meals LOOP
    -- Add current meal to batch
    meal_batch := array_append(meal_batch, NEW.meals[i]);
    meal_count := meal_count + 1;
    
    -- When we have 2 meals or it's the last meal, create a delivery
    IF meal_count = 2 OR i = remaining_meals THEN
      -- Create delivery record
      INSERT INTO order_deliveries (
        order_id,
        scheduled_date,
        meals_count,
        delivery_meals
      ) VALUES (
        NEW.id,
        delivery_date,
        meal_count,
        meal_batch
      );
      
      -- Reset batch and counter
      meal_batch := ARRAY[]::jsonb[];
      meal_count := 0;
      
      -- Update delivery date for next batch
      delivery_date := delivery_date + interval '2 days';
    END IF;
  END LOOP;
  
  -- Log the delivery creation
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Created deliveries for order %s with %s meals', 
           NEW.id, 
           remaining_meals),
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

-- Ensure the trigger exists
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
  'Updated create_order_deliveries function to fix array handling',
  'UPDATE',
  '/migrations/fix_array_function'
);