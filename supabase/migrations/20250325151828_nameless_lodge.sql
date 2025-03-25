/*
  # Fix RLS policies for order_deliveries and delivery_meals tables

  1. Changes
    - Enable RLS on both tables
    - Add comprehensive policies for CRUD operations
    - Add policies for staff members
    - Add logging for policy creation

  2. Security
    - Ensure users can only access their own data
    - Allow staff to manage all records
    - Maintain proper access control
*/

-- Solución para tabla order_deliveries
-- 1. Verificar que RLS está habilitado
ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;

-- 2. Política para que los usuarios puedan VER sus propias entregas
DROP POLICY IF EXISTS "Users can view their own deliveries" ON order_deliveries;
CREATE POLICY "Users can view their own deliveries" 
ON order_deliveries 
FOR SELECT 
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- 3. Política para que los usuarios puedan CREAR entregas para sus propias órdenes
DROP POLICY IF EXISTS "Users can create deliveries for their orders" ON order_deliveries;
CREATE POLICY "Users can create deliveries for their orders" 
ON order_deliveries 
FOR INSERT 
WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- 4. Política para que los usuarios puedan ACTUALIZAR sus propias entregas
DROP POLICY IF EXISTS "Users can update their own deliveries" ON order_deliveries;
CREATE POLICY "Users can update their own deliveries" 
ON order_deliveries 
FOR UPDATE 
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- 5. Política para que el staff pueda hacer todo
DROP POLICY IF EXISTS "Staff can manage all deliveries" ON order_deliveries;
CREATE POLICY "Staff can manage all deliveries" 
ON order_deliveries 
USING (
  auth.uid() IN (SELECT user_id FROM staff_members WHERE role = 'admin')
);

-- Solución para tabla delivery_meals
-- 1. Verificar que RLS está habilitado
ALTER TABLE delivery_meals ENABLE ROW LEVEL SECURITY;

-- 2. Política para que los usuarios puedan VER sus propios meals de entrega
DROP POLICY IF EXISTS "Users can view their own delivery meals" ON delivery_meals;
CREATE POLICY "Users can view their own delivery meals" 
ON delivery_meals 
FOR SELECT 
USING (
  delivery_id IN (
    SELECT od.id FROM order_deliveries od
    JOIN orders o ON od.order_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- 3. Política para que los usuarios puedan CREAR meals para sus propias entregas
DROP POLICY IF EXISTS "Users can create meals for their deliveries" ON delivery_meals;
CREATE POLICY "Users can create meals for their deliveries" 
ON delivery_meals 
FOR INSERT 
WITH CHECK (
  delivery_id IN (
    SELECT od.id FROM order_deliveries od
    JOIN orders o ON od.order_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- 4. Política para que los usuarios puedan ACTUALIZAR sus propios meals de entrega
DROP POLICY IF EXISTS "Users can update their own delivery meals" ON delivery_meals;
CREATE POLICY "Users can update their own delivery meals" 
ON delivery_meals 
FOR UPDATE 
USING (
  delivery_id IN (
    SELECT od.id FROM order_deliveries od
    JOIN orders o ON od.order_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- 5. Política para que el staff pueda hacer todo
DROP POLICY IF EXISTS "Staff can manage all delivery meals" ON delivery_meals;
CREATE POLICY "Staff can manage all delivery meals" 
ON delivery_meals 
USING (
  auth.uid() IN (SELECT user_id FROM staff_members WHERE role = 'admin')
);

-- Log the migration
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Created comprehensive RLS policies for order_deliveries and delivery_meals tables',
  'CREATE',
  '/migrations/create_delivery_policies'
);