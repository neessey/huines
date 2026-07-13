export type ProductCategory = 'Pizzas Classiques' | 'Accompagnements' | 'Boissons' ;

export interface PizzaCustomization {
  pate: 'Classique' | 'Fine' | 'Épaisse';
  taille: 'Moyenne' | 'Grande' | 'Géante';
  fromages: string[]; // e.g. 'Mozzarella', 'Chèvre', 'Gorgonzola', 'Parmesan'
  supplements: string[]; // e.g. 'Pepperoni', 'Champignons', 'Olives', 'Oignons', 'Jambon', 'Viande Hachée'
  accompagnements: string[]; // e.g. 'Sauce Tomate', 'Crème Fraîche', 'Sauce Piquante', 'Miel'
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in FCFA
  description: string;
  ingredients: string[];
  image: string;
  calories?: number;
  prepTime: number; // in minutes
  popular?: boolean;
}

export interface CartItem {
  id: string; // unique for this cart line (contains hash of customization)
  product: Product;
  quantity: number;
  customization?: PizzaCustomization;
  finalPrice: number; // price per unit with customizations
}

export type OrderStatus = 'paid' | 'received' | 'preparing' | 'ready' | 'delivering' | 'delivered';

export type PaymentMethod = 'orange_money' | 'mtn_money' | 'wave' | 'card';

export interface Order {
  id: string; // e.g. "258"
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  phone: string;
  address: string;
  clientName: string;
  notes?: string;
  pointsEarned: number;
  timestamp: string; // ISO string
  courierName?: string;
  courierPhone?: string;
  deliveryTimeEst: number; // in minutes remaining
}

export interface RestaurantMetrics {
  totalRevenue: number;
  averagePrepTime: number; // in minutes
  orderCount: number;
  topProducts: { name: string; salesCount: number; image: string; revenue: number }[];
  hourlyRevenue: { hour: string; amount: number; count: number }[];
  categorySales: { category: string; value: number }[];
}

export interface Promotion {
  code: string;
  discountPercent: number;
  description: string;
}
