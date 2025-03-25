/*
  # Remove delivery_groups column from orders table

  1. Changes
    - Drop delivery_groups column from orders table
    - Drop related triggers and functions that are no longer needed
    - Clean up any orphaned functions

  2. Security
    - No security changes needed
*/

-- Drop triggers that use delivery_groups
DROP TRIGGER IF EXISTS update_order_status_on_group_change ON orders;

-- Drop functions that handle delivery_groups
DROP FUNCTION IF EXISTS update_order_status_from_groups();
DROP FUNCTION IF EXISTS complete_meal_in_group(uuid, integer, text);

-- Remove delivery_groups column
ALTER TABLE orders 
DROP COLUMN IF EXISTS delivery_groups;