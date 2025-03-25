/*
  # Create orders and deliveries tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `package_id` (text)
      - `package_data` (jsonb) - Snapshot of package at time of purchase
      - `meals` (jsonb[]) - Array of selected meals
      - `delivery_address_id` (uuid, references addresses)
      - `delivery_address_data` (jsonb) - Snapshot of address at time of purchase
      - `personal_note` (text)
      - `total` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)

    - `order_deliveries`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `scheduled_date` (timestamptz)
      - `meals_count` (integer)
      - `status` (text)
      - `delivered_at` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Create orders
      - Read their own orders and deliveries
      - No update/delete allowed for data integrity

  3. Functions
    - create_order_deliveries(): Automatically creates delivery records when an order is created
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  package_id text NOT NULL,
  package_data jsonb NOT NULL,
  meals jsonb[] NOT NULL,
  delivery_address_id uuid REFERENCES addresses(id) NOT NULL,
  delivery_address_data jsonb NOT NULL,
  personal_note text,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),

  CONSTRAINT status_check CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

-- Create order_deliveries table
CREATE TABLE IF NOT EXISTS order_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  scheduled_date timestamptz NOT NULL,
  meals_count integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivered_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT status_check CHECK (status IN ('pending', 'in_transit', 'delivered', 'failed'))
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for order_deliveries
CREATE POLICY "Users can view their own order deliveries"
  ON order_deliveries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_deliveries.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Function to calculate and create delivery records
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  package_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  delivery_meals integer;
BEGIN
  -- Get number of meals from package data
  package_meals := (NEW.package_data->>'meals')::integer;
  remaining_meals := package_meals;
  
  -- Set initial delivery date (5 hours from order creation)
  delivery_date := NEW.created_at + interval '5 hours';
  
  -- Create first delivery (up to 2 meals)
  delivery_meals := LEAST(2, remaining_meals);
  INSERT INTO order_deliveries (
    order_id,
    scheduled_date,
    meals_count
  ) VALUES (
    NEW.id,
    delivery_date,
    delivery_meals
  );
  
  remaining_meals := remaining_meals - delivery_meals;
  
  -- Create subsequent deliveries every 2 days
  WHILE remaining_meals > 0 LOOP
    delivery_date := delivery_date + interval '2 days';
    delivery_meals := LEAST(2, remaining_meals);
    
    INSERT INTO order_deliveries (
      order_id,
      scheduled_date,
      meals_count
    ) VALUES (
      NEW.id,
      delivery_date,
      delivery_meals
    );
    
    remaining_meals := remaining_meals - delivery_meals;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create deliveries when an order is created
CREATE TRIGGER create_deliveries_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_deliveries();