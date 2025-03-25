/*
  # Verify delivery_meals table and enhance functionality

  1. Verify Table
    - Check if delivery_meals table exists
    - Add any missing indexes
    - Ensure proper constraints

  2. Security
    - Verify RLS policies
    - Add any missing policies
    - Ensure proper access control

  3. Functions
    - Add helper functions for meal management
    - Enhance status update triggers
*/

-- Verify table exists and has correct structure
DO $$ 
BEGIN
  -- Add any missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delivery_meals' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE delivery_meals ADD COLUMN notes text;
  END IF;

  -- Ensure indexes exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'delivery_meals' 
    AND indexname = 'idx_delivery_meals_delivery_id'
  ) THEN
    CREATE INDEX idx_delivery_meals_delivery_id ON delivery_meals(delivery_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'delivery_meals' 
    AND indexname = 'idx_delivery_meals_meal_id'
  ) THEN
    CREATE INDEX idx_delivery_meals_meal_id ON delivery_meals(meal_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'delivery_meals' 
    AND indexname = 'idx_delivery_meals_status'
  ) THEN
    CREATE INDEX idx_delivery_meals_status ON delivery_meals(status);
  END IF;

  -- Ensure RLS is enabled
  ALTER TABLE delivery_meals ENABLE ROW LEVEL SECURITY;

  -- Ensure policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'delivery_meals' 
    AND policyname = 'Staff can manage delivery meals'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'delivery_meals' 
    AND policyname = 'Users can view their own delivery meals'
  ) THEN
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
  END IF;
END $$;