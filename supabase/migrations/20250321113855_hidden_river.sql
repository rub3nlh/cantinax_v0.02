/*
  # Create payment orders table

  1. New Tables
    - `payment_orders`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `payment_method` (text) - 'card' or 'tropipay'
      - `amount` (numeric)
      - `currency` (text)
      - `description` (text)
      - `reference` (text)
      - `short_url` (text) - For TropiPay payment links
      - `status` (text) - 'pending', 'completed', 'failed'
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on payment_orders table
    - Add policies for:
      - Users can read their own payment orders
      - Users can create payment orders for their own orders
      - No update/delete allowed for data integrity

  3. Changes
    - Add foreign key constraint to orders table
    - Add status check constraint
*/

-- Create payment_orders table
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

-- Policies for payment_orders
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

-- Create index for faster lookups
CREATE INDEX payment_orders_order_id_idx ON payment_orders(order_id);
CREATE INDEX payment_orders_status_idx ON payment_orders(status);
CREATE INDEX payment_orders_created_at_idx ON payment_orders(created_at);