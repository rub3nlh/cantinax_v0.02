import { Package } from '../types';

export const packages: Package[] = [
  {
    id: 'basic',
    name: 'Paquete Básico',
    meals: 3,
    description: 'Cubre 3 días de alimentación variada.',
    price: 29.99
  },
  {
    id: 'family',
    name: 'Paquete Familiar',
    meals: 5,
    description: 'Ideal para una semana de tranquilidad.',
    price: 44.99
  },
  {
    id: 'premium',
    name: 'Paquete Premium',
    meals: 7,
    description: 'Cobertura completa, sin preocupaciones.',
    price: 59.99
  }
];