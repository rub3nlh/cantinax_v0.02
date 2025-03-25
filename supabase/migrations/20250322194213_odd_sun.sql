-- Add delivery groups to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_groups jsonb[] NOT NULL DEFAULT '{}';

-- Update create_order_deliveries function to handle meal groups
CREATE OR REPLACE FUNCTION create_order_deliveries()
RETURNS TRIGGER AS $$
DECLARE
  remaining_meals integer;
  delivery_date timestamptz;
  current_group jsonb;
  delivery_groups jsonb[];
BEGIN
  -- Get number of meals from package data
  remaining_meals := array_length(NEW.meals, 1);
  
  -- Set initial delivery date (5 hours from order creation)
  delivery_date := NEW.created_at + interval '5 hours';
  
  -- Initialize delivery groups array
  delivery_groups := ARRAY[]::jsonb[];
  
  -- Process meals in groups of 2
  WHILE remaining_meals > 0 LOOP
    -- Create a new delivery group
    current_group := jsonb_build_object(
      'delivery_date', delivery_date,
      'status', 'pending',
      'meals', jsonb_build_array(),
      'completed_meals', jsonb_build_array()
    );
    
    -- Add up to 2 meals to the current group
    FOR i IN 1..LEAST(2, remaining_meals) LOOP
      current_group := jsonb_set(
        current_group,
        '{meals}',
        (current_group->'meals') || NEW.meals[array_length(NEW.meals, 1) - remaining_meals + i]
      );
      remaining_meals := remaining_meals - 1;
    END LOOP;
    
    -- Add the group to delivery_groups array
    delivery_groups := array_append(delivery_groups, current_group);
    
    -- Update delivery date for next group
    delivery_date := delivery_date + interval '2 days';
  END LOOP;
  
  -- Update the order with delivery groups
  UPDATE orders 
  SET delivery_groups = delivery_groups
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update order status based on delivery groups
CREATE OR REPLACE FUNCTION update_order_status_from_groups()
RETURNS TRIGGER AS $$
DECLARE
  delivery_groups_count integer;
  completed_count integer;
  failed_count integer;
  delivery_status text;
  delivery_element jsonb;
BEGIN
  -- Initialize counters
  delivery_groups_count := jsonb_array_length(NEW.delivery_groups);
  completed_count := 0;
  failed_count := 0;
  
  -- Count completed and failed deliveries
  FOR delivery_element IN SELECT * FROM jsonb_array_elements(NEW.delivery_groups)
  LOOP
    delivery_status := delivery_element->>'status';
    IF delivery_status IN ('delivered', 'failed') THEN
      completed_count := completed_count + 1;
      IF delivery_status = 'failed' THEN
        failed_count := failed_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  -- Update order status based on delivery statuses
  IF delivery_groups_count > 0 AND delivery_groups_count = completed_count THEN
    IF failed_count > 0 THEN
      NEW.status := 'cancelled';
    ELSE
      NEW.status := 'completed';
    END IF;
  ELSIF EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(NEW.delivery_groups) AS d
    WHERE d->>'status' = 'in_progress'
  ) AND NEW.status = 'pending' THEN
    NEW.status := 'processing';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status updates
DROP TRIGGER IF EXISTS update_order_status_on_group_change ON orders;
CREATE TRIGGER update_order_status_on_group_change
  BEFORE UPDATE OF delivery_groups ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_from_groups();

-- Add function to mark meal as completed in a delivery group
CREATE OR REPLACE FUNCTION complete_meal_in_group(
  order_id uuid,
  group_index integer,
  meal_id text
)
RETURNS void AS $$
DECLARE
  delivery_groups jsonb[];
  current_group jsonb;
  meal_to_complete jsonb;
  completed_meals jsonb;
  meal_element jsonb;
BEGIN
  -- Get current delivery groups
  SELECT o.delivery_groups INTO delivery_groups
  FROM orders o
  WHERE o.id = order_id;
  
  -- Get the specific group
  current_group := delivery_groups[group_index];
  
  -- Find the meal to complete
  SELECT meal_element INTO meal_to_complete
  FROM jsonb_array_elements(current_group->'meals') AS meal_element
  WHERE meal_element->>'id' = meal_id;
  
  IF meal_to_complete IS NULL THEN
    RAISE EXCEPTION 'Meal not found in delivery group';
  END IF;
  
  -- Add to completed meals
  completed_meals := current_group->'completed_meals' || meal_to_complete;
  
  -- Update group status if all meals are completed
  IF jsonb_array_length(completed_meals) = jsonb_array_length(current_group->'meals') THEN
    current_group := jsonb_set(current_group, '{status}', '"ready"'::jsonb);
  ELSE
    current_group := jsonb_set(current_group, '{status}', '"in_progress"'::jsonb);
  END IF;
  
  -- Update completed meals in group
  current_group := jsonb_set(current_group, '{completed_meals}', completed_meals);
  
  -- Update the group in the array
  delivery_groups[group_index] := current_group;
  
  -- Update the order
  UPDATE orders
  SET delivery_groups = delivery_groups
  WHERE id = order_id;
END;
$$ LANGUAGE plpgsql;