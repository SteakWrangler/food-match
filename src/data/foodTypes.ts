

export interface FoodType {
  id: string;
  name: string;
  description: string;
  image: string;
  emoji: string;
}

export const foodTypes: FoodType[] = [
  // Most Popular/Common Categories (1-15)
  {
    id: '1',
    name: 'Pizza',
    description: 'Delicious cheesy goodness with your favorite toppings on a crispy crust.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    emoji: '🍕'
  },
  {
    id: '2',
    name: 'Burgers',
    description: 'Juicy beef patties with fresh toppings between soft buns.',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    emoji: '🍔'
  },
  {
    id: '3',
    name: 'Pasta',
    description: 'Comforting Italian pasta dishes with rich sauces and fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    emoji: '🍝'
  },
  {
    id: '4',
    name: 'Tacos',
    description: 'Fresh Mexican flavors wrapped in soft or crispy tortillas.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
    emoji: '🌮'
  },
  {
    id: '5',
    name: 'Sushi',
    description: 'Fresh Japanese sushi and sashimi with perfectly seasoned rice.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    emoji: '🍣'
  },
  {
    id: '6',
    name: 'Chinese',
    description: 'Authentic Chinese dishes with bold flavors and fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
    emoji: '🥡'
  },
  {
    id: '7',
    name: 'Indian',
    description: 'Aromatic curries and spiced dishes from the Indian subcontinent.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    emoji: '🍛'
  },
  {
    id: '8',
    name: 'Thai',
    description: 'Sweet, spicy, and savory Thai cuisine with fresh herbs and bold flavors.',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop',
    emoji: '🍜'
  },
  {
    id: '9',
    name: 'Salads',
    description: 'Fresh, healthy salads with crisp vegetables and flavorful dressings.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    emoji: '🥗'
  },
  {
    id: '10',
    name: 'BBQ',
    description: 'Smoky grilled meats and barbecue favorites with tangy sauces.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    emoji: '🍖'
  },
  {
    id: '11',
    name: 'Sandwiches',
    description: 'Fresh deli sandwiches and subs with quality ingredients.',
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop',
    emoji: '🥪'
  },
  {
    id: '12',
    name: 'Breakfast',
    description: 'Start your day right with hearty breakfast favorites.',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
    emoji: '🥞'
  },
  {
    id: '13',
    name: 'Coffee & Cafés',
    description: 'Artisan coffee, pastries, and cozy café atmosphere.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    emoji: '☕'
  },
  {
    id: '14',
    name: 'Seafood',
    description: 'Fresh catch of the day and ocean delicacies.',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop',
    emoji: '🦐'
  },
  {
    id: '15',
    name: 'Desserts',
    description: 'Sweet treats and decadent desserts to satisfy your sweet tooth.',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    emoji: '🍰'
  },

  // Popular International & Comfort Food (16-30)
  {
    id: '16',
    name: 'Mexican',
    description: 'Authentic Mexican cuisine beyond tacos - enchiladas, quesadillas, and more.',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    emoji: '🌯'
  },
  {
    id: '17',
    name: 'French',
    description: 'Elegant French cuisine with rich flavors and classic techniques.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    emoji: '🥖'
  },
  {
    id: '18',
    name: 'Korean',
    description: 'Spicy, fermented, and flavorful Korean dishes and BBQ.',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
    emoji: '🍲'
  },
  {
    id: '19',
    name: 'Fried Chicken',
    description: 'Crispy, juicy fried chicken in all its delicious forms.',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop',
    emoji: '🍗'
  },
  {
    id: '20',
    name: 'Steakhouse',
    description: 'Premium cuts of beef cooked to perfection.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    emoji: '🥩'
  },
  {
    id: '21',
    name: 'Wings',
    description: 'Chicken wings with various sauces and seasonings.',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop',
    emoji: '🔥'
  },
  {
    id: '22',
    name: 'Ramen',
    description: 'Rich, flavorful Japanese noodle soups with various toppings.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    emoji: '🍜'
  },
  {
    id: '23',
    name: 'Vietnamese',
    description: 'Fresh Vietnamese cuisine with pho, banh mi, and spring rolls.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    emoji: '🥢'
  },
  {
    id: '24',
    name: 'Mediterranean',
    description: 'Healthy Mediterranean fare with olive oil, herbs, and fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1544510529-efec0c8c725d?w=400&h=300&fit=crop',
    emoji: '🫒'
  },
  {
    id: '25',
    name: 'Poke',
    description: 'Fresh Hawaiian poke bowls with raw fish and tropical flavors.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    emoji: '🐟'
  },
  {
    id: '26',
    name: 'Greek',
    description: 'Traditional Greek dishes with feta, olives, and Mediterranean spices.',
    image: 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400&h=300&fit=crop',
    emoji: '🥙'
  },
  {
    id: '27',
    name: 'Bakery',
    description: 'Fresh baked goods, pastries, and artisanal breads.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    emoji: '🥐'
  },
  {
    id: '28',
    name: 'Soul Food',
    description: 'Comforting Southern cuisine with rich, hearty flavors.',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    emoji: '🍠'
  },
  {
    id: '29',
    name: 'Hot Dogs',
    description: 'Classic American hot dogs with creative toppings and sides.',
    image: 'https://images.unsplash.com/photo-1612392061787-2c3fc049ca72?w=400&h=300&fit=crop',
    emoji: '🌭'
  },
  {
    id: '30',
    name: 'Brunch',
    description: 'Late morning favorites combining breakfast and lunch items.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    emoji: '🧇'
  },

  // Moderately Popular/Specialty (31-45)
  {
    id: '31',
    name: 'Lebanese',
    description: 'Middle Eastern cuisine with hummus, kebabs, and fresh vegetables.',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    emoji: '🧆'
  },
  {
    id: '32',
    name: 'German',
    description: 'Hearty German fare with sausages, pretzels, and beer.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    emoji: '🥨'
  },
  {
    id: '33',
    name: 'Argentinian',
    description: 'Grilled meats and empanadas from South America.',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
    emoji: '🥟'
  },
  {
    id: '34',
    name: 'Peruvian',
    description: 'Fresh ceviches and unique Andean flavors.',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
    emoji: '🐠'
  },
  {
    id: '35',
    name: 'Turkish',
    description: 'Rich Turkish cuisine with kebabs, baklava, and Turkish coffee.',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    emoji: '🥙'
  },
  {
    id: '36',
    name: 'Brazilian',
    description: 'Vibrant Brazilian flavors with grilled meats and tropical fruits.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
    emoji: '🥭'
  },
  {
    id: '37',
    name: 'Jamaican',
    description: 'Spicy Caribbean cuisine with jerk seasonings and tropical flavors.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
    emoji: '🌶️'
  },
  {
    id: '38',
    name: 'Moroccan',
    description: 'Exotic North African spices, tagines, and couscous dishes.',
    image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&h=300&fit=crop',
    emoji: '🍯'
  },
  {
    id: '39',
    name: 'Russian',
    description: 'Hearty Eastern European cuisine with borscht and dumplings.',
    image: 'https://images.unsplash.com/photo-1559737558-2be83c316183?w=400&h=300&fit=crop',
    emoji: '🥟'
  },
  {
    id: '40',
    name: 'Vegan',
    description: 'Plant-based cuisine that\'s both healthy and delicious.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    emoji: '🌱'
  },
  {
    id: '41',
    name: 'Ethiopian',
    description: 'Spiced stews and injera bread from East Africa.',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop',
    emoji: '🫓'
  },
  {
    id: '42',
    name: 'Tapas',
    description: 'Spanish small plates perfect for sharing and wine pairing.',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    emoji: '🍷'
  },
  {
    id: '43',
    name: 'Cuban',
    description: 'Caribbean-influenced Cuban sandwiches and tropical flavors.',
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop',
    emoji: '🥪'
  },
  {
    id: '44',
    name: 'Afghan',
    description: 'Central Asian cuisine with rice dishes and grilled meats.',
    image: 'https://images.unsplash.com/photo-1574163164894-75e5ba4c5739?w=400&h=300&fit=crop',
    emoji: '🍚'
  },
  {
    id: '45',
    name: 'Polish',
    description: 'Comforting Polish dishes with pierogi and hearty stews.',
    image: 'https://images.unsplash.com/photo-1625395005224-0e67cbb47b59?w=400&h=300&fit=crop',
    emoji: '🥟'
  },

  // Niche/Specialty Categories (46-60)
  {
    id: '46',
    name: 'Mongolian',
    description: 'Traditional Mongolian BBQ and nomadic-inspired dishes.',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop',
    emoji: '🍖'
  },
  {
    id: '47',
    name: 'Georgian',
    description: 'Caucasian cuisine with khachapuri and wine culture.',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    emoji: '🧀'
  },
  {
    id: '48',
    name: 'Nepalese',
    description: 'Mountain cuisine with momos and dal bhat.',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop',
    emoji: '🏔️'
  },
  {
    id: '49',
    name: 'Burmese',
    description: 'Southeast Asian fusion with unique noodle and curry dishes.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    emoji: '🍜'
  },
  {
    id: '50',
    name: 'Sri Lankan',
    description: 'Island spices and coconut-based curries.',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    emoji: '🥥'
  },
  {
    id: '51',
    name: 'Tibetan',
    description: 'High-altitude cuisine with yak butter tea and hearty stews.',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop',
    emoji: '🫖'
  },
  {
    id: '52',
    name: 'Indonesian',
    description: 'Island flavors with satay, rendang, and spicy sambals.',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    emoji: '🌶️'
  },
  {
    id: '53',
    name: 'Malaysian',
    description: 'Multi-cultural Southeast Asian fusion cuisine.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    emoji: '🍛'
  },
  {
    id: '54',
    name: 'Laotian',
    description: 'Fresh herbs and sticky rice with Southeast Asian flavors.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    emoji: '🌿'
  },
  {
    id: '55',
    name: 'Cambodian',
    description: 'Khmer cuisine with fish amok and fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    emoji: '🐠'
  },
  {
    id: '56',
    name: 'Uzbek',
    description: 'Central Asian plov and silk road spices.',
    image: 'https://images.unsplash.com/photo-1574163164894-75e5ba4c5739?w=400&h=300&fit=crop',
    emoji: '🍚'
  },
  {
    id: '57',
    name: 'Armenian',
    description: 'Ancient cuisine with lavash bread and grilled meats.',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    emoji: '🍞'
  },
  {
    id: '58',
    name: 'Eritrean',
    description: 'East African injera-based cuisine with berbere spices.',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop',
    emoji: '🫓'
  },
  {
    id: '59',
    name: 'Basque',
    description: 'Unique cuisine from the Pyrenees with pintxos and seafood.',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    emoji: '🐟'
  },
  {
    id: '60',
    name: 'Molecular Gastronomy',
    description: 'Scientific cooking techniques creating unique dining experiences.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    emoji: '⚗️'
  }
];

