/*
  # Update create_order_deliveries function with enhanced debugging

  1. Changes
    - Add extensive logging for meal data processing
    - Improve error handling and validation
    - Add detailed debugging information
    - Track array indices and data transformations

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- First drop the trigger to avoid dependency issues
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS create_order_deliveries();

-- Create enhanced function with robust error handling and debugging
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  delivery_id uuid;
  meal_data jsonb;
  meal_index integer;
BEGIN
  -- Log the entire meal array for debugging
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Full meals array for order %s: %s', NEW.id, jsonb_pretty(to_jsonb(NEW.meals))),
    'DEBUG',
    '/functions/create_order_deliveries'
  );

  -- Get total number of meals from the order
  total_meals := jsonb_array_length(to_jsonb(NEW.meals));
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
      
      -- Log every property of the meal object
      INSERT INTO debug_logs (
        message,
        method,
        path
      ) VALUES (
        format('Meal at index %s: Raw data = %s, Keys = %s, ID value = %s, ID type = %s', 
               meal_index, 
               jsonb_pretty(meal_data),
               (SELECT string_agg(key, ', ') FROM jsonb_object_keys(meal_data) key),
               meal_data->>'id',
               jsonb_typeof(meal_data->'id')),
        'DEBUG',
        '/functions/create_order_deliveries'
      );
      
      -- Create delivery_meal record with explicit meal_id check and additional logging
      IF (meal_data->>'id') IS NOT NULL THEN
        INSERT INTO debug_logs (
          message,
          method,
          path
        ) VALUES (
          format('Found valid ID "%s" for meal at index %s', meal_data->>'id', meal_index),
          'INFO',
          '/functions/create_order_deliveries'
        );
        
        INSERT INTO delivery_meals (
          delivery_id,
          meal_id,
          status
        ) VALUES (
          delivery_id,
          meal_data->>'id',
          'pending'
        );
      ELSE
        -- Log detailed error about the problematic meal
        INSERT INTO debug_logs (
          message,
          method,
          path
        ) VALUES (
          format('Invalid meal data at index %s: meal_id is null. Full meal data: %s', 
                 meal_index, 
                 jsonb_pretty(meal_data)),
          'ERROR',
          '/functions/create_order_deliveries'
        );
        
        -- Try to extract id from a nested property if it exists
        IF jsonb_typeof(meal_data->'meal') = 'object' AND (meal_data->'meal'->>'id') IS NOT NULL THEN
          INSERT INTO debug_logs (
            message,
            method,
            path
          ) VALUES (
            format('Found ID in nested meal object: %s', meal_data->'meal'->>'id'),
            'INFO',
            '/functions/create_order_deliveries'
          );
          
          INSERT INTO delivery_meals (
            delivery_id,
            meal_id,
            status
          ) VALUES (
            delivery_id,
            meal_data->'meal'->>'id',
            'pending'
          );
        ELSE
          RAISE EXCEPTION 'Invalid meal data at index %: meal_id cannot be null', meal_index;
        END IF;
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
  'Updated create_order_deliveries function with enhanced debugging and logging',
  'UPDATE',
  '/migrations/update_delivery_function'
);