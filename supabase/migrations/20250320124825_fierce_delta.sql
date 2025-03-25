/*
  # Create meals table and track meal sales

  1. New Tables
    - `meals`
      - `id` (text, primary key) - matches the static IDs we use in the frontend
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `ingredients` (text[])
      - `allergens` (text[])
      - `chef_note` (text)
      - `times_ordered` (integer) - Counter for how many times this meal has been ordered
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on meals table
    - Add policies for:
      - Anyone can read meals
      - Only authenticated users can create/update meals (in case we add admin functionality later)

  3. Changes
    - Add function to increment meal order count when an order is created
*/

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  ingredients text[] NOT NULL DEFAULT '{}',
  allergens text[] NOT NULL DEFAULT '{}',
  chef_note text,
  times_ordered integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Anyone can read meals"
  ON meals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert meals"
  ON meals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update meals"
  ON meals
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to increment meal order count
CREATE OR REPLACE FUNCTION increment_meal_orders()
RETURNS TRIGGER AS $$
DECLARE
  meal_data jsonb;
BEGIN
  -- For each meal in the order's meals array
  FOR meal_data IN SELECT * FROM jsonb_array_elements(to_jsonb(NEW.meals))
  LOOP
    -- Increment the times_ordered counter for this meal
    UPDATE meals
    SET times_ordered = times_ordered + 1
    WHERE id = (meal_data->>'id');
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment meal counts when an order is created
CREATE TRIGGER increment_meal_orders_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_meal_orders();

-- Insert initial meals data
INSERT INTO meals (id, name, description, image_url, ingredients, allergens, chef_note) VALUES
  (
    'ropa-vieja',
    'Ropa Vieja Tradicional',
    'Carne de res deshebrada en salsa criolla con plátanos maduros y arroz blanco',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🥩 Carne de res', '🧅 Cebolla', '🫑 Pimiento', '🧄 Ajo', '🍅 Tomate'],
    ARRAY[]::text[],
    'Receta auténtica habanera con carne premium importada'
  ),
  (
    'arroz-pollo',
    'Arroz con Pollo a la Cubana',
    'Arroz amarillo con pollo tierno y vegetales, preparado al estilo tradicional',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🍗 Pollo', '🍚 Arroz', '🥕 Zanahoria', '🫑 Pimiento', '🧅 Cebolla'],
    ARRAY[]::text[],
    'El arroz con pollo más solicitado por nuestros clientes'
  ),
  (
    'bistec',
    'Bistec de Res Encebollado',
    'Jugoso bistec de res con cebolla caramelizada y arroz moro',
    'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🥩 Bistec de res', '🧅 Cebolla', '🍚 Arroz moro', '🫘 Frijoles negros'],
    ARRAY[]::text[],
    'Preparado al punto que prefieras'
  ),
  (
    'pescado',
    'Pescado a la Plancha',
    'Filete de pescado fresco a la plancha con arroz y vegetales',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🐟 Pescado fresco', '🍚 Arroz', '🥦 Brócoli', '🥕 Zanahoria'],
    ARRAY['Pescado'],
    'Pescado local seleccionado diariamente'
  ),
  (
    'picadillo',
    'Picadillo a la Habanera',
    'Carne molida sazonada con especias cubanas, servida con arroz blanco y plátanos',
    'https://images.unsplash.com/photo-1630698467933-60129917a2c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🥩 Carne molida', '🧅 Cebolla', '🫑 Pimiento', '🥔 Papa', '🍌 Plátano'],
    ARRAY[]::text[],
    'Receta tradicional con un toque especial de la casa'
  ),
  (
    'pollo-asado',
    'Pollo Asado al Mojo',
    'Pollo entero marinado en mojo criollo y asado a la perfección',
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🍗 Pollo entero', '🧄 Ajo', '🍊 Naranja agria', '🥔 Papas', '🥕 Zanahorias'],
    ARRAY[]::text[],
    'Marinado por 24 horas para máximo sabor'
  ),
  (
    'costillas',
    'Costillas en Salsa BBQ Criolla',
    'Costillas de cerdo en salsa BBQ con un toque cubano',
    'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🥩 Costillas', '🍯 Miel', '🧄 Ajo', '🌶️ Guindilla', '🍚 Arroz'],
    ARRAY[]::text[],
    'Cocinadas a fuego lento durante 6 horas'
  ),
  (
    'camarones',
    'Camarones al Ajillo',
    'Camarones salteados en salsa de ajo y vino blanco',
    'https://images.unsplash.com/photo-1625943553852-781c641d411e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ARRAY['🦐 Camarones', '🧄 Ajo', '🍷 Vino blanco', '🌿 Perejil', '🍚 Arroz'],
    ARRAY['Mariscos'],
    'Camarones frescos seleccionados diariamente'
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  ingredients = EXCLUDED.ingredients,
  allergens = EXCLUDED.allergens,
  chef_note = EXCLUDED.chef_note;