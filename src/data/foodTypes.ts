
export interface FoodType {
  id: string;
  name: string;
  category: string;
  emoji: string;
  image: string;
  description: string;
}

export const foodTypes: FoodType[] = [
  // Asian Cuisines
  { 
    id: 'chinese', 
    name: 'Chinese', 
    category: 'Asian', 
    emoji: '🥢',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
    description: 'Authentic Chinese dishes with bold flavors and fresh ingredients.'
  },
  { 
    id: 'japanese', 
    name: 'Japanese', 
    category: 'Asian', 
    emoji: '🍱',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    description: 'Fresh Japanese sushi and sashimi with perfectly seasoned rice.'
  },
  { 
    id: 'thai', 
    name: 'Thai', 
    category: 'Asian', 
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop',
    description: 'Sweet, spicy, and savory Thai cuisine with fresh herbs and bold flavors.'
  },
  { 
    id: 'vietnamese', 
    name: 'Vietnamese', 
    category: 'Asian', 
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    description: 'Fresh Vietnamese cuisine with pho, banh mi, and spring rolls.'
  },
  { 
    id: 'korean', 
    name: 'Korean', 
    category: 'Asian', 
    emoji: '🍚',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
    description: 'Spicy, fermented, and flavorful Korean dishes and BBQ.'
  },
  { 
    id: 'indian', 
    name: 'Indian', 
    category: 'Asian', 
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    description: 'Aromatic curries and spiced dishes from the Indian subcontinent.'
  },
  { 
    id: 'sushi', 
    name: 'Sushi', 
    category: 'Asian', 
    emoji: '🍣',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    description: 'Fresh Japanese sushi and sashimi with perfectly seasoned rice.'
  },
  { 
    id: 'ramen', 
    name: 'Ramen', 
    category: 'Asian', 
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    description: 'Rich, flavorful Japanese noodle soups with various toppings.'
  },
  { 
    id: 'asian_fusion', 
    name: 'Asian Fusion', 
    category: 'Asian', 
    emoji: '🥡',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    description: 'Creative combinations of different Asian culinary traditions.'
  },
  
  // European Cuisines
  { 
    id: 'italian', 
    name: 'Italian', 
    category: 'European', 
    emoji: '🍝',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    description: 'Pasta, risotto, and classic Italian comfort food.'
  },
  { 
    id: 'french', 
    name: 'French', 
    category: 'European', 
    emoji: '🥖',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    description: 'Elegant French cuisine with rich flavors and classic techniques.'
  },
  { 
    id: 'spanish', 
    name: 'Spanish', 
    category: 'European', 
    emoji: '🥘',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    description: 'Spanish small plates perfect for sharing and wine pairing.'
  },
  { 
    id: 'greek', 
    name: 'Greek', 
    category: 'European', 
    emoji: '🥙',
    image: 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400&h=300&fit=crop',
    description: 'Traditional Greek dishes with feta, olives, and Mediterranean spices.'
  },
  { 
    id: 'mediterranean', 
    name: 'Mediterranean', 
    category: 'European', 
    emoji: '🫔',
    image: 'https://images.unsplash.com/photo-1544510529-efec0c8c725d?w=400&h=300&fit=crop',
    description: 'Healthy Mediterranean fare with olive oil, herbs, and fresh ingredients.'
  },
  { 
    id: 'german', 
    name: 'German', 
    category: 'European', 
    emoji: '🍖',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    description: 'Hearty German fare with sausages, pretzels, and beer.'
  },
  { 
    id: 'british', 
    name: 'British', 
    category: 'European', 
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    description: 'Classic British comfort food and traditional pub fare.'
  },
  
  // American Cuisines
  { 
    id: 'american', 
    name: 'American', 
    category: 'American', 
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    description: 'Classic American comfort food, from steaks to mac and cheese.'
  },
  { 
    id: 'mexican', 
    name: 'Mexican', 
    category: 'American', 
    emoji: '🌮',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    description: 'Tacos, burritos, quesadillas and other Mexican favorites.'
  },
  { 
    id: 'tex_mex', 
    name: 'Tex-Mex', 
    category: 'American', 
    emoji: '🌯',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    description: 'Texas-style Mexican cuisine with bold flavors and hearty portions.'
  },
  { 
    id: 'southern', 
    name: 'Southern', 
    category: 'American', 
    emoji: '🍗',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    description: 'Comforting Southern cuisine with rich, hearty flavors.'
  },
  { 
    id: 'bbq', 
    name: 'BBQ', 
    category: 'American', 
    emoji: '🍖',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    description: 'Smoky grilled meats and barbecue favorites with tangy sauces.'
  },
  { 
    id: 'cajun', 
    name: 'Cajun', 
    category: 'American', 
    emoji: '🦐',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
    description: 'Spicy Louisiana-style cuisine with bold Creole flavors.'
  },
  { 
    id: 'creole', 
    name: 'Creole', 
    category: 'American', 
    emoji: '🍤',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
    description: 'New Orleans-style cuisine with French, Spanish, and African influences.'
  },
  
  // Fast Food & Quick Service
  { 
    id: 'fast_food', 
    name: 'Fast Food', 
    category: 'Quick Service', 
    emoji: '🍟',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    description: 'Quick and convenient favorites for when you\'re on the go.'
  },
  { 
    id: 'pizza', 
    name: 'Pizza', 
    category: 'Quick Service', 
    emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    description: 'Delicious cheesy goodness with your favorite toppings on a crispy crust.'
  },
  { 
    id: 'burger', 
    name: 'Burgers', 
    category: 'Quick Service', 
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    description: 'Juicy beef patties with fresh toppings between soft buns.'
  },
  { 
    id: 'sandwich', 
    name: 'Sandwiches', 
    category: 'Quick Service', 
    emoji: '🥪',
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop',
    description: 'Fresh deli sandwiches and subs with quality ingredients.'
  },
  { 
    id: 'deli', 
    name: 'Deli', 
    category: 'Quick Service', 
    emoji: '🥪',
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop',
    description: 'Classic deli meats, cheese, and fresh sandwiches.'
  },
  { 
    id: 'subway', 
    name: 'Subs', 
    category: 'Quick Service', 
    emoji: '🥖',
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop',
    description: 'Fresh submarine sandwiches with your choice of toppings.'
  },
  
  // Seafood
  { 
    id: 'seafood', 
    name: 'Seafood', 
    category: 'Seafood', 
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop',
    description: 'Fresh catch of the day and ocean delicacies.'
  },
  { 
    id: 'sushi_bar', 
    name: 'Sushi Bar', 
    category: 'Seafood', 
    emoji: '🍣',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    description: 'Fresh Japanese sushi and sashimi with perfectly seasoned rice.'
  },
  { 
    id: 'oyster_bar', 
    name: 'Oyster Bar', 
    category: 'Seafood', 
    emoji: '🦪',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop',
    description: 'Fresh oysters and premium seafood selections.'
  },
  
  // Desserts & Sweets
  { 
    id: 'ice_cream', 
    name: 'Ice Cream', 
    category: 'Desserts', 
    emoji: '🍦',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    description: 'Cool treats and frozen desserts for any time of day.'
  },
  { 
    id: 'bakery', 
    name: 'Bakery', 
    category: 'Desserts', 
    emoji: '🥐',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    description: 'Fresh baked goods, pastries, and artisanal breads.'
  },
  { 
    id: 'dessert', 
    name: 'Desserts', 
    category: 'Desserts', 
    emoji: '🍰',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    description: 'Sweet treats and decadent desserts to satisfy your sweet tooth.'
  },
  { 
    id: 'cafe', 
    name: 'Cafe', 
    category: 'Desserts', 
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    description: 'Artisan coffee, pastries, and cozy café atmosphere.'
  },
  { 
    id: 'coffee_shop', 
    name: 'Coffee Shop', 
    category: 'Desserts', 
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    description: 'Specialty coffee drinks and light fare in a relaxed setting.'
  },
  
  // Vegetarian & Health
  { 
    id: 'vegetarian', 
    name: 'Vegetarian', 
    category: 'Health', 
    emoji: '🥬',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Plant-based cuisine that\'s both healthy and delicious.'
  },
  { 
    id: 'vegan', 
    name: 'Vegan', 
    category: 'Health', 
    emoji: '🌱',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Plant-based cuisine that\'s both healthy and delicious.'
  },
  { 
    id: 'healthy', 
    name: 'Healthy', 
    category: 'Health', 
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Nutritious and wholesome meals that make you feel good.'
  },
  { 
    id: 'salad', 
    name: 'Salads', 
    category: 'Health', 
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Fresh, healthy salads with crisp vegetables and flavorful dressings.'
  },
  { 
    id: 'smoothie', 
    name: 'Smoothies', 
    category: 'Health', 
    emoji: '🥤',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    description: 'Fresh pressed juices, smoothies, and healthy drinks.'
  },
  
  // Other Cuisines
  { 
    id: 'middle_eastern', 
    name: 'Middle Eastern', 
    category: 'Other', 
    emoji: '🥙',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    description: 'Hummus, kebabs, falafel and fresh Middle Eastern flavors.'
  },
  { 
    id: 'african', 
    name: 'African', 
    category: 'Other', 
    emoji: '🍖',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop',
    description: 'Spiced stews and injera bread from East Africa.'
  },
  { 
    id: 'caribbean', 
    name: 'Caribbean', 
    category: 'Other', 
    emoji: '🍹',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
    description: 'Spicy Caribbean cuisine with jerk seasonings and tropical flavors.'
  },
  { 
    id: 'latin_american', 
    name: 'Latin American', 
    category: 'Other', 
    emoji: '🌮',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    description: 'Vibrant Latin American flavors with tropical fruits and spices.'
  },
  { 
    id: 'brazilian', 
    name: 'Brazilian', 
    category: 'Other', 
    emoji: '🍖',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
    description: 'Vibrant Brazilian flavors with grilled meats and tropical fruits.'
  },
  { 
    id: 'peruvian', 
    name: 'Peruvian', 
    category: 'Other', 
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    description: 'Fresh Peruvian cuisine with ceviche and Andean flavors.'
  },
  { 
    id: 'argentine', 
    name: 'Argentine', 
    category: 'Other', 
    emoji: '🥩',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
    description: 'Grilled meats and empanadas from South America.'
  },
  
  // Steakhouse & Fine Dining
  { 
    id: 'steakhouse', 
    name: 'Steakhouse', 
    category: 'Fine Dining', 
    emoji: '🥩',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    description: 'Premium cuts of beef cooked to perfection.'
  },
  { 
    id: 'fine_dining', 
    name: 'Fine Dining', 
    category: 'Fine Dining', 
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    description: 'Upscale restaurant experience with expertly crafted dishes.'
  },
  { 
    id: 'wine_bar', 
    name: 'Wine Bar', 
    category: 'Fine Dining', 
    emoji: '🍷',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    description: 'Curated wine selections with small plates and elegant atmosphere.'
  },
  { 
    id: 'cocktail_bar', 
    name: 'Cocktail Bar', 
    category: 'Fine Dining', 
    emoji: '🍸',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    description: 'Craft cocktails and sophisticated bar fare.'
  },
  
  // Casual & Family
  { 
    id: 'casual_dining', 
    name: 'Casual Dining', 
    category: 'Casual', 
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    description: 'Relaxed atmosphere with table service and moderate prices.'
  },
  { 
    id: 'family_style', 
    name: 'Family Style', 
    category: 'Casual', 
    emoji: '👨‍👩‍👧‍👦',
    image: 'https://images.unsplash.com/photo-1574163164894-75e5ba4c5739?w=400&h=300&fit=crop',
    description: 'Large portions meant for sharing with the whole family.'
  },
  { 
    id: 'diner', 
    name: 'Diner', 
    category: 'Casual', 
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    description: 'Classic American diner fare with all-day breakfast options.'
  },
  { 
    id: 'breakfast', 
    name: 'Breakfast', 
    category: 'Casual', 
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
    description: 'Start your day right with hearty breakfast favorites.'
  },
  { 
    id: 'brunch', 
    name: 'Brunch', 
    category: 'Casual', 
    emoji: '🥞',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    description: 'Late morning favorites combining breakfast and lunch items.'
  },
  
  // Bars & Pubs
  { 
    id: 'bar', 
    name: 'Bar', 
    category: 'Bars', 
    emoji: '🍺',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    description: 'Pub grub and bar snacks perfect for casual dining and drinks.'
  },
  { 
    id: 'pub', 
    name: 'Pub', 
    category: 'Bars', 
    emoji: '🍺',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    description: 'Traditional pub atmosphere with hearty British and Irish fare.'
  },
  { 
    id: 'brewery', 
    name: 'Brewery', 
    category: 'Bars', 
    emoji: '🍺',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    description: 'Craft beer and brewery fare in a relaxed setting.'
  },
  { 
    id: 'sports_bar', 
    name: 'Sports Bar', 
    category: 'Bars', 
    emoji: '🏈',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    description: 'Game day favorites with big screens and cold drinks.'
  },
  
  // Specialized
  { 
    id: 'food_truck', 
    name: 'Food Truck', 
    category: 'Specialized', 
    emoji: '🚚',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    description: 'Creative street food and mobile kitchen favorites.'
  },
  { 
    id: 'farm_to_table', 
    name: 'Farm to Table', 
    category: 'Specialized', 
    emoji: '🌾',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Fresh, locally sourced ingredients and seasonal menus.'
  },
  { 
    id: 'organic', 
    name: 'Organic', 
    category: 'Specialized', 
    emoji: '🌱',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Certified organic ingredients and sustainable dining options.'
  },
  { 
    id: 'gluten_free', 
    name: 'Gluten Free', 
    category: 'Specialized', 
    emoji: '🌾',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Gluten-free options for those with dietary restrictions.'
  },
  { 
    id: 'halal', 
    name: 'Halal', 
    category: 'Specialized', 
    emoji: '🕌',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    description: 'Halal-certified cuisine following Islamic dietary guidelines.'
  },
  { 
    id: 'kosher', 
    name: 'Kosher', 
    category: 'Specialized', 
    emoji: '✡️',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop',
    description: 'Kosher-certified cuisine following Jewish dietary laws.'
  },
];

export const foodTypeCategories = [
  'Asian',
  'European', 
  'American',
  'Quick Service',
  'Seafood',
  'Desserts',
  'Health',
  'Other',
  'Fine Dining',
  'Casual',
  'Bars',
  'Specialized'
];

export const getFoodTypeById = (id: string): FoodType | undefined => {
  return foodTypes.find(type => type.id === id);
};

export const getFoodTypesByCategory = (category: string): FoodType[] => {
  return foodTypes.filter(type => type.category === category);
};
