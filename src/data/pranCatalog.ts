import { SampleRackImage } from '../types';

export interface CatalogProduct {
  sku: string;
  name: string;
  category: 'Beverage & Juices' | 'Dairy & Drinks' | 'Snacks & Confectionery' | 'Culinary & Spices' | 'RFL Plastics & Houseware' | 'Bakery & Biscuits';
  description: string;
  unit: string;
  approx_price_bdt: number;
  popular: boolean;
  color: string;
}

export const PRAN_RFL_CATALOG: CatalogProduct[] = [
  {
    sku: 'PRAN-BEV-001',
    name: 'PRAN Mango Juice 250ml',
    category: 'Beverage & Juices',
    description: 'Iconic authentic Alphonso & Chaunsa mango pulp juice pack',
    unit: '250ml Tetra Pak / Bottle',
    approx_price_bdt: 25,
    popular: true,
    color: '#f59e0b'
  },
  {
    sku: 'PRAN-BEV-002',
    name: 'PRAN Frooto 250ml',
    category: 'Beverage & Juices',
    description: 'Refreshing fruit beverage with vibrant mango flavor',
    unit: '250ml Bottle',
    approx_price_bdt: 22,
    popular: true,
    color: '#f97316'
  },
  {
    sku: 'PRAN-DAI-003',
    name: 'PRAN Lassi 200ml',
    category: 'Dairy & Drinks',
    description: 'Traditional creamy fermented sweet probiotic yogurt drink',
    unit: '200ml UHT Pack',
    approx_price_bdt: 30,
    popular: true,
    color: '#06b6d4'
  },
  {
    sku: 'RFL-PLA-004',
    name: 'RFL Click Water Bottle 1L',
    category: 'RFL Plastics & Houseware',
    description: 'BPA-free durable sports and everyday reusable water bottle',
    unit: '1000ml Bottle',
    approx_price_bdt: 120,
    popular: true,
    color: '#3b82f6'
  },
  {
    sku: 'PRAN-SNK-005',
    name: 'PRAN Potato Crackers 25g',
    category: 'Snacks & Confectionery',
    description: 'Crispy salted potato chips with zesty Bangladeshi spices',
    unit: '25g Foil Pouch',
    approx_price_bdt: 15,
    popular: true,
    color: '#eab308'
  },
  {
    sku: 'PRAN-CUL-006',
    name: 'PRAN Mr. Noodles Magic Masala 62g',
    category: 'Culinary & Spices',
    description: 'Instant savory noodles with authentic spice mix blend',
    unit: '62g Packet',
    approx_price_bdt: 20,
    popular: true,
    color: '#ef4444'
  },
  {
    sku: 'PRAN-CUL-007',
    name: 'PRAN Turmeric Powder 200g',
    category: 'Culinary & Spices',
    description: '100% natural sun-dried pure turmeric ground powder',
    unit: '200g Pouch',
    approx_price_bdt: 85,
    popular: false,
    color: '#eab308'
  },
  {
    sku: 'PRAN-CUL-008',
    name: 'PRAN Mustard Oil (Radhuni) 500ml',
    category: 'Culinary & Spices',
    description: 'Pungent cold-pressed traditional cooking mustard oil',
    unit: '500ml Pet Bottle',
    approx_price_bdt: 165,
    popular: true,
    color: '#84cc16'
  },
  {
    sku: 'PRAN-BAK-009',
    name: 'PRAN Potata Spicy Biscuits 100g',
    category: 'Bakery & Biscuits',
    description: 'Ultra-thin crispy potato cracker biscuits with spicy flavor',
    unit: '100g Box',
    approx_price_bdt: 35,
    popular: true,
    color: '#f43f5e'
  },
  {
    sku: 'PRAN-DAI-010',
    name: 'PRAN UHT Premium Milk 1L',
    category: 'Dairy & Drinks',
    description: 'Pure homogenized sterilized cow milk',
    unit: '1000ml Tetra Brik',
    approx_price_bdt: 95,
    popular: true,
    color: '#38bdf8'
  },
  {
    sku: 'RFL-PLA-011',
    name: 'RFL Joy Tiffin Box 3-Layer',
    category: 'RFL Plastics & Houseware',
    description: 'Insulated food grade multi-tier lunch box',
    unit: '1 Unit',
    approx_price_bdt: 320,
    popular: false,
    color: '#10b981'
  },
  {
    sku: 'PRAN-BEV-012',
    name: 'PRAN Cheer Up Carbonated Drink 250ml',
    category: 'Beverage & Juices',
    description: 'Lemon-lime crisp sparkling soft drink',
    unit: '250ml Can',
    approx_price_bdt: 25,
    popular: true,
    color: '#22c55e'
  }
];

export const SAMPLE_RACKS: SampleRackImage[] = [
  {
    id: 'sample-gulshan-juice-102',
    title: 'PRAN Juice & Beverage Display — Gulshan-2 Superstore',
    shop_id: 'SHOP-Gulshan-102',
    merchandiser_id: 'MER-Rahim-45',
    category: 'Beverage & Juices',
    description: 'Standard 4-tier retail cooler rack stocked with PRAN Mango Juice, Frooto, and Cheer Up bottles in Dhaka Gulshan hub.',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    detectedHint: [
      { product_name: 'PRAN Mango Juice 250ml', quantity_visible: 8 },
      { product_name: 'PRAN Frooto 250ml', quantity_visible: 6 },
      { product_name: 'PRAN Lassi 200ml', quantity_visible: 4 },
      { product_name: 'PRAN Cheer Up Carbonated Drink 250ml', quantity_visible: 5 }
    ]
  },
  {
    id: 'sample-dhanmondi-snacks-204',
    title: 'PRAN Confectionery & Noodles Endcap — Dhanmondi Mart',
    shop_id: 'SHOP-Dhanmondi-204',
    merchandiser_id: 'MER-Hasan-12',
    category: 'Snacks & Confectionery',
    description: 'Eye-level retail rack featuring PRAN Potato Crackers, Mr. Noodles Magic Masala packets, and Potata biscuits.',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80',
    detectedHint: [
      { product_name: 'PRAN Potato Crackers 25g', quantity_visible: 12 },
      { product_name: 'PRAN Mr. Noodles Magic Masala 62g', quantity_visible: 10 },
      { product_name: 'PRAN Potata Spicy Biscuits 100g', quantity_visible: 7 }
    ]
  },
  {
    id: 'sample-uttara-rfl-305',
    title: 'RFL Plastics & Water Bottle Stand — Uttara Sector 7',
    shop_id: 'SHOP-Uttara-305',
    merchandiser_id: 'MER-Farhana-88',
    category: 'RFL Plastics & Houseware',
    description: 'Promotional display rack of RFL Click sports bottles, Joy food containers, and household essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80',
    detectedHint: [
      { product_name: 'RFL Click Water Bottle 1L', quantity_visible: 9 },
      { product_name: 'RFL Joy Tiffin Box 3-Layer', quantity_visible: 4 }
    ]
  },
  {
    id: 'sample-chittagong-spice-401',
    title: 'PRAN Culinary & Spices Wall — Agrabad Chittagong',
    shop_id: 'SHOP-Agrabad-401',
    merchandiser_id: 'MER-Karim-99',
    category: 'Culinary & Spices',
    description: 'Spices display holding PRAN Turmeric Powder, Radhuni Mustard Oil, and chili seasoning pouches.',
    imageUrl: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80',
    detectedHint: [
      { product_name: 'PRAN Mustard Oil (Radhuni) 500ml', quantity_visible: 6 },
      { product_name: 'PRAN Turmeric Powder 200g', quantity_visible: 8 },
      { product_name: 'PRAN Mr. Noodles Magic Masala 62g', quantity_visible: 5 }
    ]
  }
];
