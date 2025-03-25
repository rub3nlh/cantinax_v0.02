/*
  # Fix NULL meal_ids in delivery_meals and prevent future nulls

  1. Changes
    - Delete delivery_meals records with NULL meal_ids as they are invalid
    - Add NOT NULL constraint to meal_id column
    - Fix create_order_deliveries function to properly handle meal IDs

  2. Security
    - No changes to security model
    - Maintain existing RLS policies
*/

-- First, delete any invalid records with NULL meal_ids
DELETE FROM delivery_meals
WHERE meal_id IS NULL;

-- Add NOT NULL constraint to meal_id
ALTER TABLE delivery_meals 
ALTER COLUMN meal_id SET NOT NULL;

-- Update the create_order_deliveries function to ensure meal_id is always set
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  delivery_id uuid;
  meal_data jsonb;
BEGIN
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
      meal_data := to_jsonb(NEW.meals[total_meals - remaining_meals + i]);
      
      -- Create delivery_meal record with explicit meal_id check
      IF (meal_data->>'id') IS NOT NULL THEN
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
        RAISE EXCEPTION 'Invalid meal data: meal_id cannot be null';
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

-- Log the migration
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Fixed NULL meal_ids in delivery_meals and updated create_order_deliveries function',
  'UPDATE',
  '/migrations/fix_delivery_meals_null'
);