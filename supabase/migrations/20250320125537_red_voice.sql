/*
  # Create order_meals junction table

  1. New Tables
    - `order_meals`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `meal_id` (text, foreign key to meals)
      - `quantity` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on order_meals table
    - Add policies for:
      - Users can read their own order meals
      - Users can create order meals when creating orders

  3. Changes
    - Add foreign key constraints to ensure data integrity
    - Update the increment_meal_orders function to use the junction table
*/

-- Create order_meals junction table
CREATE TABLE IF NOT EXISTS order_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  meal_id text REFERENCES meals(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),

  -- Ensure unique combinations of order and meal
  UNIQUE(order_id, meal_id)
);

-- Enable RLS
ALTER TABLE order_meals ENABLE ROW LEVEL SECURITY;

-- Policies for order_meals
CREATE POLICY "Users can view their own order meals"
  ON order_meals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_meals.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order meals"
  ON order_meals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_meals.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Drop the old trigger function
DROP TRIGGER IF EXISTS increment_meal_orders_on_order ON orders;
DROP FUNCTION IF EXISTS increment_meal_orders();

-- Create new function to handle meal orders through junction table
CREATE OR REPLACE FUNCTION create_order_meals()
RETURNS TRIGGER AS $$
DECLARE
  meal_data jsonb;
BEGIN
  -- For each meal in the order's meals array
  FOR meal_data IN SELECT * FROM jsonb_array_elements(to_jsonb(NEW.meals))
  LOOP
    -- Insert into order_meals junction table
    INSERT INTO order_meals (order_id, meal_id)
    VALUES (NEW.id, (meal_data->>'id'));
    
    -- Increment the times_ordered counter for this meal
    UPDATE meals
    SET times_ordered = times_ordered + 1
    WHERE id = (meal_data->>'id');
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger to handle meal orders
CREATE TRIGGER create_order_meals_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_meals();