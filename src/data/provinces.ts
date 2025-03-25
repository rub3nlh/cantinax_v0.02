export interface Province {
  id: string;
  name: string;
  municipalities: string[];
}

export const provinces: Province[] = [
  {
    id: 'habana',
    name: 'La Habana',
    municipalities: [
      'Playa',
      'Plaza de la Revolución',
      'Centro Habana',
      'Habana Vieja',
      'Regla',
      'Habana del Este',
      'Guanabacoa',
      'San Miguel del Padrón',
      'Diez de Octubre',
      'Cerro',
      'Marianao',
      'La Lisa',
      'Boyeros',
      'Arroyo Naranjo',
      'Cotorro'
    ]
  },
  {
    id: 'mayabeque',
    name: 'Mayabeque',
    municipalities: [
      'San José de las Lajas',
      'Santa Cruz del Norte',
      'Jaruco',
      'Madruga',
      'Nueva Paz',
      'San Nicolás',
      'Güines',
      'Melena del Sur',
      'Batabanó',
      'Quivicán',
      'Bejucal'
    ]
  },
  {
    id: 'artemisa',
    name: 'Artemisa',
    municipalities: [
      'Alquízar',
      'Artemisa',
      'Bauta',
      'Caimito',
      'Guanajay',
      'Güira de Melena',
      'Mariel',
      'San Antonio de los Baños',
      'Bahía Honda',
      'Candelaria',
      'San Cristóbal'
    ]
  }
];