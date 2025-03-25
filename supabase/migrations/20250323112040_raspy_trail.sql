/*
  # Remove order deliveries trigger

  1. Changes
    - Drop the create_order_deliveries trigger function
    - Drop the trigger from orders table
    - Keep the tables and their structure intact

  2. Security
    - No changes to security model
    - Maintain existing RLS policies
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS create_deliveries_on_order ON orders;

-- Then drop the function
DROP FUNCTION IF EXISTS create_order_deliveries();

-- Log the removal
INSERT INTO debug_logs (
  message,
  method,
  path
) VALUES (
  'Removed create_order_deliveries trigger and function',
  'DROP',
  '/migrations/remove_trigger'
);