/*
  # Add active field to meals table

  1. Changes
    - Add active boolean field to meals table
    - Set default value to true
    - Update existing meals to be active
    - Add index for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add active column to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Set all existing meals to active
UPDATE meals SET active = true WHERE active IS NULL;

-- Create index for active field
CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(active);