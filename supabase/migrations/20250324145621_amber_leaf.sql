/*
  # Clean up orders and related data

  1. Changes
    - Delete all existing orders and related data
    - Delete in correct order to respect foreign key constraints
    - Only delete from existing tables
    
  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

DO $$ 
BEGIN
  -- Delete from delivery_meals if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'delivery_meals') THEN
    DELETE FROM delivery_meals;
  END IF;

  -- Delete from order_deliveries if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_deliveries') THEN
    DELETE FROM order_deliveries;
  END IF;

  -- Delete from payment_orders if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_orders') THEN
    DELETE FROM payment_orders;
  END IF;

  -- Delete from orders if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DELETE FROM orders;
  END IF;

  -- Log the cleanup
  INSERT INTO debug_logs (message, method, path)
  VALUES (
    'Cleaned up all orders and related data for structure update',
    'DELETE',
    '/migrations/clean_orders'
  );
END $$;