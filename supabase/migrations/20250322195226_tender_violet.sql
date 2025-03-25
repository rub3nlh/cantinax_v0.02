/*
  # Create delivery meals schema

  1. New Tables
    - `delivery_meals`
      - `id` (uuid, primary key)
      - `delivery_id` (uuid, references order_deliveries)
      - `meal_id` (text, references meals)
      - `status` (text) - 'pending', 'completed'
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on delivery_meals table
    - Add policies for:
      - Staff can manage delivery meals
      - Users can view their own delivery meals

  3. Changes
    - Add foreign key constraints
    - Add status check constraint
    - Add indexes for better performance
*/

-- Create delivery_meals table
CREATE TABLE IF NOT EXISTS delivery_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid REFERENCES order_deliveries(id) NOT NULL,
  meal_id text REFERENCES meals(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT status_check CHECK (status IN ('pending', 'completed')),
  CONSTRAINT unique_delivery_meal UNIQUE (delivery_id, meal_id)
);

-- Enable RLS
ALTER TABLE delivery_meals ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_delivery_meals_delivery_id ON delivery_meals(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_meals_meal_id ON delivery_meals(meal_id);
CREATE INDEX IF NOT EXISTS idx_delivery_meals_status ON delivery_meals(status);

-- Add policies
CREATE POLICY "Staff can manage delivery meals"
  ON delivery_meals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'chef')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'chef')
    )
  );

CREATE POLICY "Users can view their own delivery meals"
  ON delivery_meals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_deliveries d
      JOIN orders o ON o.id = d.order_id
      WHERE d.id = delivery_meals.delivery_id
      AND o.user_id = auth.uid()
    )
  );

-- Create function to update delivery status based on meal completion
CREATE OR REPLACE FUNCTION update_delivery_status()
RETURNS TRIGGER AS $$
DECLARE
  v_delivery_id uuid;
  v_all_completed boolean;
BEGIN
  -- Get the delivery ID
  v_delivery_id := NEW.delivery_id;

  -- Check if all meals are completed
  SELECT bool_and(status = 'completed') INTO v_all_completed
  FROM delivery_meals
  WHERE delivery_id = v_delivery_id;

  -- Update delivery status
  IF v_all_completed THEN
    UPDATE order_deliveries
    SET status = 'ready'
    WHERE id = v_delivery_id;
  ELSE
    UPDATE order_deliveries
    SET status = 'in_progress'
    WHERE id = v_delivery_id
    AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for delivery status updates
CREATE TRIGGER update_delivery_status_on_meal_complete
  AFTER UPDATE OF status ON delivery_meals
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_status();

-- Create function to automatically create delivery meals
CREATE OR REPLACE FUNCTION create_delivery_meals()
RETURNS TRIGGER AS $$
BEGIN
  -- Create delivery_meals records for each meal in the delivery
  INSERT INTO delivery_meals (delivery_id, meal_id)
  SELECT 
    NEW.id,
    (meal->>'id')::text
  FROM jsonb_array_elements(NEW.delivery_meals) AS meal;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic delivery meal creation
CREATE TRIGGER create_delivery_meals_on_delivery
  AFTER INSERT ON order_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_meals();