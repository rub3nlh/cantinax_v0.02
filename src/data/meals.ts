import { Meal } from '../types';

export const meals: Meal[] = [
  {
    id: 'ropa-vieja',
    name: 'Ropa Vieja Tradicional',
    description: 'Carne de res deshebrada en salsa criolla con plátanos maduros y arroz blanco',
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🥩 Carne de res', '🧅 Cebolla', '🫑 Pimiento', '🧄 Ajo', '🍅 Tomate'],
    allergens: [],
    chefNote: 'Receta auténtica habanera con carne premium importada'
  },
  {
    id: 'arroz-pollo',
    name: 'Arroz con Pollo a la Cubana',
    description: 'Arroz amarillo con pollo tierno y vegetales, preparado al estilo tradicional',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🍗 Pollo', '🍚 Arroz', '🥕 Zanahoria', '🫑 Pimiento', '🧅 Cebolla'],
    allergens: [],
    chefNote: 'El arroz con pollo más solicitado por nuestros clientes'
  },
  {
    id: 'bistec',
    name: 'Bistec de Res Encebollado',
    description: 'Jugoso bistec de res con cebolla caramelizada y arroz moro',
    image: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🥩 Bistec de res', '🧅 Cebolla', '🍚 Arroz moro', '🫘 Frijoles negros'],
    allergens: [],
    chefNote: 'Preparado al punto que prefieras'
  },
  {
    id: 'pescado',
    name: 'Pescado a la Plancha',
    description: 'Filete de pescado fresco a la plancha con arroz y vegetales',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🐟 Pescado fresco', '🍚 Arroz', '🥦 Brócoli', '🥕 Zanahoria'],
    allergens: ['Pescado'],
    chefNote: 'Pescado local seleccionado diariamente'
  },
  {
    id: 'picadillo',
    name: 'Picadillo a la Habanera',
    description: 'Carne molida sazonada con especias cubanas, servida con arroz blanco y plátanos',
    image: 'https://images.unsplash.com/photo-1630698467933-60129917a2c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🥩 Carne molida', '🧅 Cebolla', '🫑 Pimiento', '🥔 Papa', '🍌 Plátano'],
    allergens: [],
    chefNote: 'Receta tradicional con un toque especial de la casa'
  },
  {
    id: 'pollo-asado',
    name: 'Pollo Asado al Mojo',
    description: 'Pollo entero marinado en mojo criollo y asado a la perfección',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🍗 Pollo entero', '🧄 Ajo', '🍊 Naranja agria', '🥔 Papas', '🥕 Zanahorias'],
    allergens: [],
    chefNote: 'Marinado por 24 horas para máximo sabor'
  },
  {
    id: 'costillas',
    name: 'Costillas en Salsa BBQ Criolla',
    description: 'Costillas de cerdo en salsa BBQ con un toque cubano',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🥩 Costillas', '🍯 Miel', '🧄 Ajo', '🌶️ Guindilla', '🍚 Arroz'],
    allergens: [],
    chefNote: 'Cocinadas a fuego lento durante 6 horas'
  },
  {
    id: 'camarones',
    name: 'Camarones al Ajillo',
    description: 'Camarones salteados en salsa de ajo y vino blanco',
    image: 'https://images.unsplash.com/photo-1625943553852-781c641d411e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ingredients: ['🦐 Camarones', '🧄 Ajo', '🍷 Vino blanco', '🌿 Perejil', '🍚 Arroz'],
    allergens: ['Mariscos'],
    chefNote: 'Camarones frescos seleccionados diariamente'
  }
];