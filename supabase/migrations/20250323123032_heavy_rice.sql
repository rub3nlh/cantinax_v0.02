-- First drop existing tables and dependencies
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;
DROP FUNCTION IF EXISTS create_order_deliveries();
DROP TABLE IF EXISTS delivery_meals CASCADE;
DROP TABLE IF EXISTS order_deliveries CASCADE;
DROP TABLE IF EXISTS order_meals CASCADE;

-- Create new order_deliveries table without the delivery_meals jsonb
CREATE TABLE order_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivered_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'in_progress', 'ready', 'delivered', 'failed'))
);

-- Create delivery_meals junction table
CREATE TABLE delivery_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid REFERENCES order_deliveries(id) ON DELETE CASCADE,
  meal_id text REFERENCES meals(id),
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'completed')),
  
  -- Ensure unique meal per delivery
  UNIQUE (delivery_id, meal_id)
);

-- Create function to enforce max 2 meals per delivery
CREATE OR REPLACE FUNCTION check_delivery_meals_limit()
RETURNS TRIGGER AS $$
DECLARE
  meal_count integer;
BEGIN
  SELECT COUNT(*) INTO meal_count
  FROM delivery_meals
  WHERE delivery_id = NEW.delivery_id;
  
  IF meal_count >= 2 THEN
    RAISE EXCEPTION 'Cannot add more than 2 meals to a delivery';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce meal limit
CREATE TRIGGER enforce_delivery_meals_limit
  BEFORE INSERT ON delivery_meals
  FOR EACH ROW
  EXECUTE FUNCTION check_delivery_meals_limit();

-- Create indexes
CREATE INDEX idx_order_deliveries_order_id ON order_deliveries(order_id);
CREATE INDEX idx_order_deliveries_status ON order_deliveries(status);
CREATE INDEX idx_order_deliveries_scheduled_date ON order_deliveries(scheduled_date);
CREATE INDEX idx_delivery_meals_delivery_id ON delivery_meals(delivery_id);
CREATE INDEX idx_delivery_meals_meal_id ON delivery_meals(meal_id);
CREATE INDEX idx_delivery_meals_status ON delivery_meals(status);

-- Enable RLS
ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_meals ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Staff can manage deliveries"
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

CREATE POLICY "Users can view their own deliveries"
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

-- Create function to create deliveries and assign meals
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  total_meals integer;
  remaining_meals integer;
  delivery_date timestamptz;
  delivery_id uuid;
  meal_data jsonb;
BEGIN
  -- Get total number of meals from the order
  total_meals := jsonb_array_length(to_jsonb(NEW.meals));
  remaining_meals := total_meals;
  
  -- Set initial delivery date (same day as order)
  delivery_date := NEW.created_at;
  
  -- Process meals until none remain
  WHILE remaining_meals > 0 LOOP
    -- Create delivery record
    INSERT INTO order_deliveries (
      order_id,
      scheduled_date,
      status
    ) VALUES (
      NEW.id,
      delivery_date,
      'pending'
    ) RETURNING id INTO delivery_id;
    
    -- Add up to 2 meals to this delivery
    FOR i IN 0..LEAST(1, remaining_meals - 1) LOOP
      meal_data := to_jsonb(NEW.meals[total_meals - remaining_meals + i]);
      
      -- Create delivery_meal record
      INSERT INTO delivery_meals (
        delivery_id,
        meal_id,
        status
      ) VALUES (
        delivery_id,
        meal_data->>'id',
        'pending'
      );
      
      remaining_meals := remaining_meals - 1;
      EXIT WHEN remaining_meals = 0;
    END LOOP;
    
    -- Next delivery in 2 days
    delivery_date := delivery_date + interval '2 days';
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

-- Create trigger for automatic delivery creation
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
  'Restructured orders and deliveries relationship with new delivery_meals table',
  'MIGRATION',
  '/migrations/restructure_orders_deliveries'
);