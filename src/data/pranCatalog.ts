import { SampleRackImage } from '../types';



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
