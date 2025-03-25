export interface Package {
  id: string;
  name: string;
  meals: number;
  description: string;
  price: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  ingredients: string[];
  allergens: string[];
  chefNote: string;
  active: boolean;
}

export interface DeliveryAddress {
  id: string;
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  municipality: string;
}

export interface OrderSummary {
  package: Package;
  selectedMeals: Meal[];
  personalNote: string;
  deliveryAddress: DeliveryAddress;
}

export type PaymentMethod = 'card' | 'tropipay';

export interface CardPaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}