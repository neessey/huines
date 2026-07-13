import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // CATEGORY: Pizzas Classiques
  {
    id: 'p1',
    name: 'Pizza Viande Haché',
    category: 'Pizzas Classiques',
    price: 4500,
    description: "Une recette gourmande alliant une viande hachée de bœuf savoureusement assaisonnée, une sauce tomate maison mijotée, une généreuse couche de mozzarella fondante et des herbes aromatiques sélectionnées pour un équilibre parfait des saveurs.",

ingredients: [
  'Sauce tomate maison',
  'Viande hachée de bœuf assaisonnée',
  'Mozzarella',
  'Oignons frais',
  'Origan',
  'Huile d’olive extra-vierge'
],
image: '/assets/viande.png',
    calories: 680,
    prepTime: 8,
    popular: true
  },
  {
  id: 'p2',
  name: 'Pizza Royale',
  category: 'Pizzas Classiques',
  price: 7000,
  description: 'Une pizza généreuse composée d’une sauce tomate maison, de mozzarella fondante, de jambon de dinde, de viande hachée de bœuf savoureusement assaisonnée, de champignons frais et d’olives noires.',
  ingredients: [
    'Sauce tomate maison',
    'Mozzarella',
    'Jambon de dinde',
    'Viande hachée de bœuf',
    'Champignons frais',
    'Olives noires'
  ],
  image: '/assets/royal.png',
  calories: 920,
  prepTime: 12,
  popular: true
},
  {
    id: 'p3',
    name: 'Quatre Fromages',
    category: 'Pizzas Classiques',
    price: 6500,
    description: 'Un paradis pour les amoureux de fromage. Mélange onctueux de Mozzarella fior di latte, Chèvre de caractère, Gorgonzola DOP et éclats de Parmesan affiné 24 mois.',
    ingredients: ['Mozzarella', 'Chèvre', 'Gorgonzola', 'Parmesan', 'Sauce Tomate ou Crème'],
    image: '/assets/fromage.png',
    calories: 920,
    prepTime: 10,
    popular: false
  },
{
  id: 'p4',
  name: 'Pizza Champignon',
  category: 'Pizzas Classiques',
  price: 6000,
  description: 'Une recette gourmande mettant à l’honneur des champignons frais, une sauce tomate maison, une généreuse couche de mozzarella fondante et une touche d’origan pour une saveur authentique.',
  ingredients: [
    'Sauce tomate maison',
    'Mozzarella',
    'Champignons frais',
    'Origan',
    'Huile d’olive extra-vierge'
  ],
  image: '/assets/champignon.png',
  calories: 780,
  prepTime: 10,
  popular: false
},

  // CATEGORY: Accompagnements
{
  id: 'a1',
  name: 'Frites Croustillantes',
  category: 'Accompagnements',
  price: 2000,
  description: 'De délicieuses frites dorées et croustillantes, préparées à la commande et servies bien chaudes.',
  ingredients: [
    'Pommes de terre',
    'Huile végétale',
    'Sel'
  ],
  image: '/assets/frite.png',
  calories: 420,
  prepTime: 5,
  popular: true
},
{
  id: 'a2',
  name: 'Alloco',
  category: 'Accompagnements',
  price: 2000,
  description: 'Des bananes plantains mûres soigneusement frites jusqu\'à obtenir une texture fondante à l\'intérieur et légèrement caramélisée à l\'extérieur.',
  ingredients: [
    'Bananes plantains mûres',
    'Huile végétale'
  ],
  image: '/assets/alloco.jpg',
  calories: 390,
  prepTime: 6,
  popular: true
},
  // CATEGORY: Boissons
  {
    id: 'd1',
    name: 'Jus de Bissap ',
    category: 'Boissons',
    price: 1500,
    description: 'Infusion  de fleurs d\'hibiscus séchées, menthe fraîche d\'Abidjan, gingembre et une pointe de citron vert pressé.',
    ingredients: ['Fleurs d\'hibiscus', 'Menthe fraîche', 'Gingembre', 'Citron vert'],
    image: '/assets/bissap.jpg',
    calories: 120,
    prepTime: 2,
    popular: true
  },
  {
    id: 'd2',
    name: 'Coca-Cola',
    category: 'Boissons',
    price: 1200,
    description: 'Servie ultra-fraîche avec des glaçons.',
    ingredients: ['Coca-Cola 33cl', 'Glace'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
    calories: 140,
    prepTime: 1,
    popular: false
  },

 
];
