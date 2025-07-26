
export interface FoodType {
  id: string;
  name: string;
  category: string;
  emoji: string;
  image: string;
  description: string;
}

export const foodTypes: FoodType[] = [
  // Most Popular Food Types (ordered by likelihood to swipe right)
  { 
    id: 'pizza', 
    name: 'Pizza', 
    category: 'Popular', 
    emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    description: 'Delicious cheesy goodness with your favorite toppings on a crispy crust.'
  },
  { 
    id: 'burgers', 
    name: 'Burgers', 
    category: 'Popular', 
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    description: 'Juicy beef patties with fresh toppings between soft buns.'
  },
  { 
    id: 'tacos', 
    name: 'Tacos', 
    category: 'Popular', 
    emoji: '🌮',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    description: 'Fresh Mexican tacos with flavorful fillings and authentic toppings.'
  },
  { 
    id: 'fried_chicken', 
    name: 'Fried Chicken', 
    category: 'Popular', 
    emoji: '🍗',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58',
    description: 'Crispy, golden fried chicken with juicy meat and perfect seasoning.'
  },
  { 
    id: 'steak', 
    name: 'Steak / Steakhouse', 
    category: 'Popular', 
    emoji: '🥩',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462',
    description: 'Premium cuts of beef cooked to perfection with classic steakhouse sides.'
  },
  { 
    id: 'chicken_wings', 
    name: 'Chicken Wings', 
    category: 'Popular', 
    emoji: '🍗',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2',
    description: 'Crispy wings tossed in your favorite sauce - perfect for game day.'
  },
  { 
    id: 'pasta', 
    name: 'Pasta', 
    category: 'Popular', 
    emoji: '🍝',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    description: 'Al dente pasta with rich sauces and fresh ingredients.'
  },
  { 
    id: 'sandwiches', 
    name: 'Sandwiches / Subs', 
    category: 'Popular', 
    emoji: '🥪',
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586',
    description: 'Fresh deli sandwiches and subs with quality ingredients and hearty portions.'
  },
  { 
    id: 'sushi', 
    name: 'Sushi', 
    category: 'Asian', 
    emoji: '🍣',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    description: 'Fresh Japanese sushi and sashimi with perfectly seasoned rice.'
  },
  { 
    id: 'bbq', 
    name: 'BBQ / Ribs', 
    category: 'American', 
    emoji: '🍖',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
    description: 'Smoky grilled meats and barbecue favorites with tangy sauces.'
  },
  { 
    id: 'breakfast', 
    name: 'Breakfast / Brunch', 
    category: 'Casual', 
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666',
    description: 'Start your day right with hearty breakfast favorites and brunch classics.'
  },
  { 
    id: 'salad', 
    name: 'Salad / Bowls', 
    category: 'Health', 
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    description: 'Fresh, healthy salads and grain bowls with crisp vegetables and flavorful dressings.'
  },
  { 
    id: 'ice_cream', 
    name: 'Ice Cream / Froyo', 
    category: 'Desserts', 
    emoji: '🍦',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307',
    description: 'Cool treats and frozen desserts for any time of day.'
  },
  { 
    id: 'chinese', 
    name: 'Chinese', 
    category: 'Asian', 
    emoji: '🥢',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c',
    description: 'Authentic Chinese dishes with bold flavors and fresh ingredients.'
  },
  { 
    id: 'mexican', 
    name: 'Mexican', 
    category: 'American', 
    emoji: '🌮',
    image: 'https://images.unsplash.com/photo-1565299585323-38174c26a33b',
    description: 'Tacos, burritos, quesadillas and other Mexican favorites.'
  },
  { 
    id: 'italian', 
    name: 'Italian', 
    category: 'European', 
    emoji: '🍝',
    image: 'https://images.unsplash.com/photo-1498579397066-22750a3cb424',
    description: 'Pasta, risotto, and classic Italian comfort food.'
  },
  { 
    id: 'american', 
    name: 'American (General)', 
    category: 'American', 
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    description: 'Classic American comfort food, from steaks to mac and cheese.'
  },
  { 
    id: 'fast_food', 
    name: 'Fast Food', 
    category: 'Quick Service', 
    emoji: '🍟',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
    description: 'Quick and convenient favorites for when you\'re on the go.'
  },
  { 
    id: 'comfort_food', 
    name: 'Comfort Food', 
    category: 'American', 
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3',
    description: 'Hearty, satisfying dishes that feel like a warm hug.'
  },
  { 
    id: 'casual_dining', 
    name: 'Casual Dining', 
    category: 'Casual', 
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de',
    description: 'Relaxed atmosphere with table service and moderate prices.'
  },
  { 
    id: 'japanese', 
    name: 'Japanese (Ramen, Sushi)', 
    category: 'Asian', 
    emoji: '🍱',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
    description: 'Fresh Japanese cuisine including ramen, sushi, and traditional dishes.'
  },
  { 
    id: 'korean', 
    name: 'Korean', 
    category: 'Asian', 
    emoji: '🍚',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9',
    description: 'Spicy, fermented, and flavorful Korean dishes and BBQ.'
  },
  { 
    id: 'thai', 
    name: 'Thai (Curry, Noodles)', 
    category: 'Asian', 
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd',
    description: 'Sweet, spicy, and savory Thai cuisine with fresh herbs and bold flavors.'
  },
  { 
    id: 'seafood', 
    name: 'Seafood', 
    category: 'Seafood', 
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62',
    description: 'Fresh catch of the day and ocean delicacies.'
  },
  { 
    id: 'tex_mex', 
    name: 'Tex-Mex', 
    category: 'American', 
    emoji: '🌯',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
    description: 'Texas-style Mexican cuisine with bold flavors and hearty portions.'
  },
  { 
    id: 'vegan', 
    name: 'Vegan / Vegetarian', 
    category: 'Health', 
    emoji: '🌱',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999',
    description: 'Plant-based cuisine that\'s both healthy and delicious.'
  },
  { 
    id: 'noodles', 
    name: 'Noodles (Generic)', 
    category: 'Asian', 
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
    description: 'Various Asian noodle dishes from different culinary traditions.'
  },
  { 
    id: 'dessert', 
    name: 'Dessert / Pastries', 
    category: 'Desserts', 
    emoji: '🍰',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
    description: 'Sweet treats and decadent desserts to satisfy your sweet tooth.'
  },
  { 
    id: 'indian', 
    name: 'Indian', 
    category: 'Asian', 
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
    description: 'Aromatic curries and spiced dishes from the Indian subcontinent.'
  },
  { 
    id: 'vietnamese', 
    name: 'Vietnamese (Pho, Banh Mi)', 
    category: 'Asian', 
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae',
    description: 'Fresh Vietnamese cuisine with pho, banh mi, and spring rolls.'
  },
  { 
    id: 'mediterranean', 
    name: 'Mediterranean', 
    category: 'European', 
    emoji: '🫔',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
    description: 'Healthy Mediterranean fare with olive oil, herbs, and fresh ingredients.'
  },
  { 
    id: 'middle_eastern', 
    name: 'Middle Eastern', 
    category: 'Other', 
    emoji: '🥙',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
    description: 'Hummus, kebabs, falafel and fresh Middle Eastern flavors.'
  },
  { 
    id: 'soul_food', 
    name: 'Soul Food', 
    category: 'American', 
    emoji: '🍗',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975',
    description: 'Comforting Southern cuisine with rich, hearty flavors.'
  },
  { 
    id: 'peruvian', 
    name: 'Peruvian', 
    category: 'Other', 
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    description: 'Fresh Peruvian cuisine with ceviche and Andean flavors.'
  },
  { 
    id: 'ethiopian', 
    name: 'Ethiopian', 
    category: 'Other', 
    emoji: '🍖',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    description: 'Spiced stews and injera bread from East Africa.'
  },
  { 
    id: 'hawaiian', 
    name: 'Hawaiian / Poke', 
    category: 'Seafood', 
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1546069901-eacef0df6022',
    description: 'Fresh Hawaiian poke bowls and tropical island flavors.'
  },
  { 
    id: 'french', 
    name: 'French', 
    category: 'European', 
    emoji: '🥖',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    description: 'Elegant French cuisine with rich flavors and classic techniques.'
  },
  
  // Dining Style / Experience-Based (mixed throughout)
  { 
    id: 'takeout', 
    name: 'Takeout-Friendly', 
    category: 'Experience', 
    emoji: '📦',
    image: 'https://images.unsplash.com/photo-1593504049359-74330189a345',
    description: 'Perfect for when you want to enjoy restaurant-quality food at home.'
  },
  { 
    id: 'date_night', 
    name: 'Date Night', 
    category: 'Experience', 
    emoji: '💕',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    description: 'Romantic dining experiences perfect for special occasions.'
  },
  { 
    id: 'late_night', 
    name: 'Late Night Eats', 
    category: 'Experience', 
    emoji: '🌙',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
    description: 'Delicious options for when the sun goes down and hunger strikes.'
  },
  { 
    id: 'family_friendly', 
    name: 'Family Friendly', 
    category: 'Experience', 
    emoji: '👨‍👩‍👧‍👦',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
    description: 'Welcoming atmosphere perfect for dining with the whole family.'
  },
  { 
    id: 'trendy', 
    name: 'Trendy / Instagrammable', 
    category: 'Experience', 
    emoji: '📸',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
    description: 'Hip spots with photogenic dishes and modern vibes.'
  },
  { 
    id: 'buffet', 
    name: 'All You Can Eat / Buffet', 
    category: 'Experience', 
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    description: 'Endless options for when you want to try a little bit of everything.'
  },
  { 
    id: 'guilty_pleasures', 
    name: 'Guilty Pleasures', 
    category: 'Experience', 
    emoji: '😋',
    image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8',
    description: 'Indulgent treats that are worth every calorie.'
  },
  { 
    id: 'food_truck', 
    name: 'Food Truck', 
    category: 'Experience', 
    emoji: '🚚',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    description: 'Creative street food and mobile kitchen favorites.'
  },
  { 
    id: 'fusion', 
    name: 'Fusion / Ethnic Mix', 
    category: 'Experience', 
    emoji: '🥡',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
    description: 'Creative combinations of different culinary traditions.'
  },
  { 
    id: 'build_your_own', 
    name: 'Build-Your-Own', 
    category: 'Experience', 
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554',
    description: 'Customizable meals where you choose your own ingredients and combinations.'
  },
];

export const foodTypeCategories = [
  'Popular',
  'Asian',
  'American', 
  'European', 
  'Quick Service',
  'Seafood',
  'Desserts',
  'Health',
  'Other',
  'Casual',
  'Experience'
];

export const getFoodTypeById = (id: string): FoodType | undefined => {
  return foodTypes.find(type => type.id === id);
};

export const getFoodTypesByCategory = (category: string): FoodType[] => {
  return foodTypes.filter(type => type.category === category);
};
