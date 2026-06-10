/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  nameHy: string;
  nameEn: string;
  descriptionHy: string;
  descriptionEn: string;
  price: number; // in AMD (֏)
  rating: number;
  reviewsCount: number;
  image: string;
  category: 'cakes' | 'armenian_sweets' | 'pastries' | 'cupcakes';
  isCustomizable: boolean;
  preparationTimeHy: string;
  preparationTimeEn: string;
  popular?: boolean;
}

export interface CustomCakeOptions {
  weight: number; // e.g. 1.5kg, 3kg, 5kg
  sponge: string; // Chocolate, Red Velvet, Vanilla, Honey
  filling: string; // Strawberry, Caramel, Chocolate Ganache, Pistachio, Custard
  inscription: string; // Custom writing on cake
  candlesCount: number;
  creamColor: string; // Red, Pink, Pastel Blue, White, Chocolate
  topping?: string; // Berries, GoldFlakes, ChocolateShavings, Macarons, Flowers
  decorationStyle?: string; // Modern Minimalist, Whipped Borders, Sparkly Glaze, Royal Vintage
  frostingTexture?: string; // Smooth, Swirls, Naked
  sprinkles?: string; // None, Pearls, Confetti, Stars
  hasSparkler?: boolean;
}

export interface CartItem {
  id: string; // composite key if customized
  product: Product;
  quantity: number;
  customizations?: CustomCakeOptions;
  finalPrice: number; // based on customization multiplier & weight
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  status: 'placed' | 'baking' | 'delivering' | 'delivered';
  paymentMethod: 'card' | 'idram' | 'cash';
  paymentCardInfo?: {
    lastFour: string;
  };
  confirmedReceipt?: boolean;
  usedBonusPoints?: number;
  earnedBonusPoints?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  bonusBalance?: number; // accumulated bonus in AMD (֏) from purchases (0.3% accrual rate)
}

export type Language = 'hy' | 'en';
