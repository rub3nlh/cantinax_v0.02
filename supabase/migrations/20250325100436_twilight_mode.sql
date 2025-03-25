-- First drop the trigger to avoid dependency issues
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS create_order_deliveries();

-- Create enhanced function with fixed meal assignment logic
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  delivery_id uuid;
  meal_data jsonb;
  meal_index integer;
  processed_index integer;
  meals_array jsonb;
BEGIN
  -- Log the entire meals array for debugging
  meals_array := to_jsonb(NEW.meals);
  
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Processing order %s with %s meals', NEW.id, jsonb_array_length(meals_array)),
    'INFO',
    '/functions/create_order_deliveries'
  );

  -- Get total number of meals
  total_meals := jsonb_array_length(meals_array);
  
  -- Validate total meals
  IF total_meals <= 0 THEN
    RAISE EXCEPTION 'Cannot create deliveries for order with no meals';
  END IF;
  
  -- Initialize remaining_meals and processed_index
  remaining_meals := total_meals;
  processed_index := 0;
  
  -- Set initial delivery date (same day as order)
  delivery_date := NEW.created_at;
  
  -- Log all meal IDs to track what we're processing
  FOR i IN 0..total_meals-1 LOOP
    meal_data := meals_array->i;
    
    -- Check for direct ID or nested ID
    IF (meal_data->>'id') IS NOT NULL THEN
      INSERT INTO debug_logs (
        message,
        method,
        path
      ) VALUES (
        format('Meal %s has direct ID: %s', i, meal_data->>'id'),
        'INFO',
        '/functions/create_order_deliveries'
      );
    ELSIF jsonb_typeof(meal_data->'meal') = 'object' AND (meal_data->'meal'->>'id') IS NOT NULL THEN
      INSERT INTO debug_logs (
        message,
        method,
        path
      ) VALUES (
        format('Meal %s has nested ID: %s', i, meal_data->'meal'->>'id'),
        'INFO',
        '/functions/create_order_deliveries'
      );
    ELSE
      INSERT INTO debug_logs (
        message,
        method,
        path
      ) VALUES (
        format('Meal %s has no valid ID. Raw data: %s', i, jsonb_pretty(meal_data)),
        'ERROR',
        '/functions/create_order_deliveries'
      );
    END IF;
  END LOOP;
  
  -- Create deliveries in sequence, processing meals from start to end
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
    
    -- Log the new delivery
    INSERT INTO debug_logs (
      message,
      method,
      path
    ) VALUES (
      format('Created delivery %s for order %s with up to %s meals', 
             delivery_id, 
             NEW.id, 
             LEAST(2, remaining_meals)),
      'INFO',
      '/functions/create_order_deliveries'
    );
    
    -- Add up to 2 meals to this delivery IN SEQUENCE (this is the key change)
    -- We'll iterate through the original array from the beginning to end
    FOR i IN 1..LEAST(2, remaining_meals) LOOP
      -- Calculate the index in the original array (0-based)
      meal_index := processed_index;
      
      -- Get the meal data
      meal_data := meals_array->meal_index;
      
      -- Log what we're processing
      INSERT INTO debug_logs (
        message,
        method,
        path
      ) VALUES (
        format('Processing meal at index %s for delivery %s', 
               meal_index, 
               delivery_id),
        'INFO',
        '/functions/create_order_deliveries'
      );
      
      -- CASE 1: Check if meal has direct ID
      IF (meal_data->>'id') IS NOT NULL THEN
        INSERT INTO debug_logs (
          message,
          method,
          path
        ) VALUES (
          format('Adding meal with direct ID %s to delivery %s', 
                 meal_data->>'id', 
                 delivery_id),
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
      -- CASE 2: Check if meal is nested inside a 'meal' property
      ELSIF jsonb_typeof(meal_data->'meal') = 'object' AND (meal_data->'meal'->>'id') IS NOT NULL THEN
        INSERT INTO debug_logs (
          message,
          method,
          path
        ) VALUES (
          format('Adding meal with nested ID %s to delivery %s', 
                 meal_data->'meal'->>'id', 
                 delivery_id),
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
        -- Log error and raise exception
        INSERT INTO debug_logs (
          message,
          method,
          path
        ) VALUES (
          format('Meal %s has no valid ID. Available keys: %s', 
                 meal_index, 
                 (SELECT string_agg(key, ', ') FROM jsonb_object_keys(meal_data) key)),
          'ERROR',
          '/functions/create_order_deliveries'
        );
        
        RAISE EXCEPTION 'Invalid meal data at index %: meal_id cannot be null', meal_index;
      END IF;
      
      -- Increment processed index and decrement remaining meals
      processed_index := processed_index + 1;
      remaining_meals := remaining_meals - 1;
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
    format('Successfully created all deliveries for order %s with %s meals', 
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

-- Re-create the trigger
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
  'Updated create_order_deliveries function with enhanced meal processing and logging',
  'UPDATE',
  '/migrations/update_delivery_function'
);