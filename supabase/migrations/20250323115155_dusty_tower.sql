/*
  # Recreate order_deliveries table

  1. Changes
    - Create new table with correct structure
    - Transfer existing data
    - Drop old table and rename new one
    - Recreate indexes and constraints

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- 1. Create new table with desired structure
CREATE TABLE order_deliveries_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  meals_count INTEGER NOT NULL,
  delivery_meals JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Copy data from old table to new table
INSERT INTO order_deliveries_new (
  id,
  order_id,
  scheduled_date,
  meals_count,
  delivery_meals,
  status,
  delivered_at,
  notes,
  created_at
)
SELECT 
  id,
  order_id,
  scheduled_date,
  meals_count,
  COALESCE(delivery_meals[1], '[]'::jsonb), -- Convert jsonb[] to jsonb
  status,
  delivered_at,
  notes,
  created_at
FROM order_deliveries;

-- 3. Drop old table and rename new one
DROP TABLE order_deliveries CASCADE;
ALTER TABLE order_deliveries_new RENAME TO order_deliveries;

-- 4. Add constraints
ALTER TABLE order_deliveries 
ADD CONSTRAINT status_check 
CHECK (status IN ('pending', 'in_progress', 'ready', 'delivered', 'failed'));

-- 5. Create indexes
CREATE INDEX idx_order_deliveries_order_id ON order_deliveries(order_id);
CREATE INDEX idx_order_deliveries_status ON order_deliveries(status);
CREATE INDEX idx_order_deliveries_scheduled_date ON order_deliveries(scheduled_date);

-- 6. Enable RLS
ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Staff can manage delivery meals"
  ON order_deliveries
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

-- 8. Create RPC function for inserting deliveries
CREATE OR REPLACE FUNCTION insert_delivery(
  p_order_id uuid,
  p_scheduled_date timestamptz,
  p_meals_count integer,
  p_delivery_meals jsonb
) RETURNS void AS $$
BEGIN
  -- Insert the delivery record
  INSERT INTO order_deliveries(
    order_id,
    scheduled_date,
    meals_count,
    delivery_meals
  ) VALUES (
    p_order_id,
    p_scheduled_date,
    p_meals_count,
    p_delivery_meals
  );

  -- Log successful insertion
  INSERT INTO debug_logs (
    message,
    method,
    path
  ) VALUES (
    format('Inserted delivery for order %s with %s meals', 
           p_order_id, 
           p_meals_count),
    'INSERT',
    '/functions/insert_delivery'
  );
END;
$$ LANGUAGE plpgsql;

-- Log the migration
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Recreated order_deliveries table with correct structure',
  'MIGRATION',
  '/migrations/recreate_order_deliveries'
);