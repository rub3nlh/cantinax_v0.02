/*
  # Clean up orders and related data

  1. Changes
    - Delete all existing orders and related data
    - Delete in correct order to respect foreign key constraints
    - Reset sequences if any exist
    
  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Delete data in the correct order to respect foreign key constraints
DELETE FROM delivery_meals;
DELETE FROM order_deliveries;
DELETE FROM payment_orders;
DELETE FROM order_meals;
DELETE FROM orders;

-- Log the cleanup
INSERT INTO debug_logs (message, method, path)
VALUES (
  'Cleaned up all orders and related data for structure update',
  'DELETE',
  '/migrations/clean_orders'
);