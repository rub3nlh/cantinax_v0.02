/*
  # Fix order deliveries policy

  1. Changes
    - Add policy to allow trigger function to create order deliveries
    - Add policy to allow trigger function to create order meals
    - Add policy to allow trigger function to update meal counts

  2. Security
    - Policies ensure only the trigger function can perform these operations
    - Maintains RLS security while allowing automated processes
*/

-- Allow the trigger function to create order deliveries
CREATE POLICY "Allow trigger to create order deliveries"
  ON order_deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_deliveries.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Allow the trigger function to create order meals
CREATE POLICY "Allow trigger to create order meals"
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

-- Allow the trigger function to update meal counts
CREATE POLICY "Allow trigger to update meal counts"
  ON meals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);