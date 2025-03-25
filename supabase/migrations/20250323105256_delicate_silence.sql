/*
  # Fix create_order_deliveries function

  1. Changes
    - Remove all references to delivery_groups
    - Update function to work with current schema
    - Maintain existing delivery scheduling logic
    - Fix meal tracking in deliveries

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
  delivery_meals jsonb[];
  meal_data jsonb;
BEGIN
  -- Get number of meals from the order
  remaining_meals := array_length(NEW.meals, 1);
  
  -- Set initial delivery date (5 hours from order creation)
  delivery_date := NEW.created_at + interval '5 hours';
  
  -- Process meals in groups of 2
  WHILE remaining_meals > 0 LOOP
    -- Get next 2 meals (or remaining if less than 2)
    delivery_meals := ARRAY[]::jsonb[];
    FOR i IN 1..LEAST(2, remaining_meals) LOOP
      meal_data := NEW.meals[array_length(NEW.meals, 1) - remaining_meals + i];
      delivery_meals := array_append(delivery_meals, meal_data);
    END LOOP;
    
    -- Create delivery record
    INSERT INTO order_deliveries (
      order_id,
      scheduled_date,
      meals_count,
      delivery_meals
    ) VALUES (
      NEW.id,
      delivery_date,
      array_length(delivery_meals, 1),
      delivery_meals
    );
    
    -- Update counters
    remaining_meals := remaining_meals - array_length(delivery_meals, 1);
    delivery_date := delivery_date + interval '2 days';
  END LOOP;
  
  -- Log the delivery creation
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Created deliveries for order %s with %s meals', 
           NEW.id, 
           array_length(NEW.meals, 1)),
    'INSERT',
    '/functions/create_order_deliveries'
  );
  
  RETURN NEW;
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
  'Updated create_order_deliveries function to remove delivery_groups references',
  'UPDATE',
  '/migrations/fix_order_deliveries'
);