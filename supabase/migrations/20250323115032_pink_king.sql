/*
  # Change delivery_meals column type

  1. Changes
    - Drop default value from delivery_meals column
    - Change column type from jsonb[] to jsonb
    - Set new default value for jsonb type
    - Update create_order_deliveries function to handle new type

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- First, drop the default value
ALTER TABLE order_deliveries 
ALTER COLUMN delivery_meals DROP DEFAULT;

-- Then change the column type
ALTER TABLE order_deliveries 
ALTER COLUMN delivery_meals TYPE jsonb 
USING COALESCE(delivery_meals[1], '[]'::jsonb);

-- Set new default value
ALTER TABLE order_deliveries 
ALTER COLUMN delivery_meals SET DEFAULT '[]'::jsonb;

-- Update the create_order_deliveries function
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  delivery_date timestamptz;
  current_batch jsonb;
  meal_json jsonb;
  i integer;
BEGIN
  -- Convert meals array to jsonb
  meal_json := to_jsonb(NEW.meals);
  total_meals := jsonb_array_length(meal_json);
  
  -- Set initial delivery date (5 hours from order creation)
  delivery_date := NEW.created_at + interval '5 hours';
  
  -- Process meals in pairs
  i := 0;
  WHILE i < total_meals LOOP
    -- Initialize empty array for current batch
    current_batch := jsonb_build_array();
    
    -- Add first meal
    current_batch := current_batch || jsonb_build_array(meal_json->i);
    
    -- Add second meal if available
    IF i + 1 < total_meals THEN
      current_batch := current_batch || jsonb_build_array(meal_json->(i + 1));
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
      jsonb_array_length(current_batch),
      current_batch
    );
    
    -- Update delivery date for next batch
    delivery_date := delivery_date + interval '2 days';
    
    -- Move to next pair
    i := i + 2;
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

-- Log the migration
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Changed delivery_meals column from jsonb[] to jsonb with proper default value handling',
  'MIGRATION',
  '/migrations/fix_delivery_meals_type'
);