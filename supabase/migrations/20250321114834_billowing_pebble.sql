/*
  # Fix payment orders policies and add update policy

  1. Changes
    - Add policy for updating payment orders
    - Fix policy creation to avoid conflicts
    - Add policy for updating payment status and error messages

  2. Security
    - Maintain existing RLS policies
    - Ensure users can only update their own payment orders
*/

-- Add update policy for payment orders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_orders' 
    AND policyname = 'Users can update their own payment orders'
  ) THEN
    CREATE POLICY "Users can update their own payment orders"
      ON payment_orders
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = payment_orders.order_id
          AND orders.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = payment_orders.order_id
          AND orders.user_id = auth.uid()
        )
      );
  END IF;
END $$;