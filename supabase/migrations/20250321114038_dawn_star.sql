/*
  # Create payment orders table with safe policy creation

  1. New Tables
    - `payment_orders`
      - Tracks payment attempts and results
      - Links to orders table
      - Stores payment method, amount, and status
      - Includes URLs and references for external payment providers

  2. Security
    - Enable RLS
    - Safe policy creation with existence checks
    - Proper indexing for performance

  3. Changes
    - Add IF NOT EXISTS checks for policies
    - Maintain existing table structure
*/

-- Create payment_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  payment_method text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  description text,
  reference text,
  short_url text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,

  -- Add constraints
  CONSTRAINT payment_method_check CHECK (payment_method IN ('card', 'tropipay')),
  CONSTRAINT status_check CHECK (status IN ('pending', 'completed', 'failed')),
  CONSTRAINT currency_check CHECK (currency IN ('EUR', 'USD'))
);

-- Enable RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Safely create policies using DO block
DO $$ 
BEGIN
  -- Only create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_orders' 
    AND policyname = 'Users can view their own payment orders'
  ) THEN
    CREATE POLICY "Users can view their own payment orders"
      ON payment_orders
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = payment_orders.order_id
          AND orders.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_orders' 
    AND policyname = 'Users can create payment orders'
  ) THEN
    CREATE POLICY "Users can create payment orders"
      ON payment_orders
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = payment_orders.order_id
          AND orders.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payment_orders' 
    AND indexname = 'payment_orders_order_id_idx'
  ) THEN
    CREATE INDEX payment_orders_order_id_idx ON payment_orders(order_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payment_orders' 
    AND indexname = 'payment_orders_status_idx'
  ) THEN
    CREATE INDEX payment_orders_status_idx ON payment_orders(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payment_orders' 
    AND indexname = 'payment_orders_created_at_idx'
  ) THEN
    CREATE INDEX payment_orders_created_at_idx ON payment_orders(created_at);
  END IF;
END $$;