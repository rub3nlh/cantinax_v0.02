/*
  # Fix order meals duplicate entries

  1. Changes
    - Update create_order_meals function to handle duplicates
    - Add quantity handling for meals
    - Improve error handling

  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS create_order_meals_on_order ON orders;
DROP FUNCTION IF EXISTS create_order_meals();

-- Create improved function to handle meal orders
CREATE OR REPLACE FUNCTION create_order_meals()
RETURNS TRIGGER AS $$
BEGIN
  -- For each meal in the order's meals array, try to insert or update quantity
  FOR i IN 1..array_length(NEW.meals, 1)
  LOOP
    -- Insert into order_meals junction table, increment quantity on conflict
    INSERT INTO order_meals (
      order_id,
      meal_id,
      quantity
    )
    VALUES (
      NEW.id,
      (NEW.meals[i]->>'id'),
      1
    )
    ON CONFLICT (order_id, meal_id) 
    DO UPDATE SET quantity = order_meals.quantity + 1;
    
    -- Increment the times_ordered counter for this meal
    UPDATE meals
    SET times_ordered = times_ordered + 1
    WHERE id = (NEW.meals[i]->>'id');
  END LOOP;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error details
  RAISE NOTICE 'Error in create_order_meals: %', SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_order_meals_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_meals();