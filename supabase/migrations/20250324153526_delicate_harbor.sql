/*
  # Update create_order_deliveries function with enhanced error handling

  1. Changes
    - Drop trigger first to avoid dependency issues
    - Drop and recreate function with enhanced error handling
    - Recreate trigger with new function

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- First drop the trigger to avoid dependency issues
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS create_order_deliveries();

-- Create enhanced function with robust error handling
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  delivery_id uuid;
  meal_data jsonb;
  meal_index integer;
  meal_id text;
BEGIN
  -- Log start of function execution
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Starting creation of deliveries for order %s', NEW.id),
    'INSERT',
    '/functions/create_order_deliveries'
  );

  -- Get total number of meals from the order
  total_meals := jsonb_array_length(to_jsonb(NEW.meals));
  
  -- Log total number of meals
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Processing %s meals for order %s', total_meals, NEW.id),
    'INFO',
    '/functions/create_order_deliveries'
  );
  
  remaining_meals := total_meals;
  
  -- Set initial delivery date (same day as order)
  delivery_date := NEW.created_at;
  
  -- Process meals until none remain
  WHILE remaining_meals > 0 LOOP
    -- Create delivery record
    INSERT INTO order_deliveries (
      order_id,
      scheduled_date,
      status,
      meals_count
    ) VALUES (
      NEW.id,
      delivery_date,
      'pending',
      LEAST(2, remaining_meals)
    ) RETURNING id INTO delivery_id;
    
    -- Add up to 2 meals to this delivery
    FOR i IN 0..LEAST(1, remaining_meals - 1) LOOP
      meal_index := total_meals - remaining_meals + i;
      meal_data := to_jsonb(NEW.meals[meal_index]);
      
      -- Log the meal data for debugging
      INSERT INTO debug_logs (
        message,
        method,
        path
      ) VALUES (
        format('Processing meal at index %s: %s', meal_index, jsonb_pretty(meal_data)),
        'INFO',
        '/functions/create_order_deliveries'
      );
      
      -- Extract meal_id with detailed validation
      meal_id := NULLIF(TRIM(meal_data->>'id'), '');
      
      -- Create delivery_meal record with improved error handling
      IF meal_id IS NOT NULL THEN
        INSERT INTO delivery_meals (
          delivery_id,
          meal_id,
          status
        ) VALUES (
          delivery_id,
          meal_id,
          'pending'
        );
      ELSE
        -- Log detailed error about which meal is problematic
        INSERT INTO debug_logs (
          message,
          method,
          path
        ) VALUES (
          format('Invalid meal data at index %s: meal_id is null or empty. Full meal data: %s', 
                meal_index, 
                jsonb_pretty(meal_data)),
          'ERROR',
          '/functions/create_order_deliveries'
        );
        
        RAISE EXCEPTION 'Invalid meal data at index %: meal_id cannot be null', meal_index;
      END IF;
      
      remaining_meals := remaining_meals - 1;
      EXIT WHEN remaining_meals = 0;
    END LOOP;
    
    -- Next delivery in 2 days
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
    'SUCCESS',
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

-- Recreate the trigger with the updated function
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
  'Updated create_order_deliveries function with enhanced error handling',
  'UPDATE',
  '/migrations/update_delivery_function'
);