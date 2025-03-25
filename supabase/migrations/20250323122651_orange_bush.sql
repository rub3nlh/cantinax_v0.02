/*
  # Fix create_order_deliveries function

  1. Changes
    - Fix delivery creation logic to properly handle meal packages
    - Create correct number of deliveries based on meal count
    - Schedule deliveries every 2 days
    - First delivery contains up to 2 meals
    - Remaining meals go in subsequent deliveries

  2. Security
    - No changes to security model
    - Maintain existing RLS policies
*/

-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS create_order_deliveries();

CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  current_batch jsonb;
  meal_index integer;
BEGIN
  -- Get total number of meals from the order
  total_meals := jsonb_array_length(to_jsonb(NEW.meals));
  remaining_meals := total_meals;
  meal_index := 0;
  
  -- Set initial delivery date (same day as order)
  delivery_date := NEW.created_at;
  
  -- Process meals until none remain
  WHILE remaining_meals > 0 LOOP
    -- Initialize empty array for current batch
    current_batch := '[]'::jsonb;
    
    -- For each delivery, take up to 2 meals
    FOR i IN 1..LEAST(2, remaining_meals) LOOP
      -- Add meal to current batch
      current_batch := current_batch || jsonb_build_array(to_jsonb(NEW.meals[meal_index]));
      meal_index := meal_index + 1;
      remaining_meals := remaining_meals - 1;
    END LOOP;
    
    -- Create delivery record
    INSERT INTO order_deliveries (
      order_id,
      scheduled_date,
      meals_count,
      delivery_meals,
      status
    ) VALUES (
      NEW.id,
      delivery_date,
      jsonb_array_length(current_batch),
      current_batch,
      'pending'
    );
    
    -- Next delivery in 2 days
    delivery_date := delivery_date + interval '2 days';
  END LOOP;
  
  -- Log successful creation
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Created %s deliveries for order %s with %s meals', 
           CEIL(total_meals::numeric / 2), 
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
CREATE TRIGGER create_deliveries_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_deliveries();

-- Log the migration
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Fixed create_order_deliveries function to properly handle meal packages and delivery scheduling',
  'UPDATE',
  '/migrations/fix_delivery_creation'
);