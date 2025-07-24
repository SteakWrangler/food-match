
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
    image: 'https://source.unsplash.com/600x400/?pizza',
    description: 'Delicious cheesy goodness with your favorite toppings on a crispy crust.'
  },
  { 
    id: 'burgers', 
    name: 'Burgers', 
    category: 'Popular', 
    emoji: '🍔',
    image: 'https://source.unsplash.com/600x400/?burger',
    description: 'Juicy beef patties with fresh toppings between soft buns.'
  },
  { 
    id: 'tacos', 
    name: 'Tacos', 
    category: 'Popular', 
    emoji: '🌮',
    image: 'https://source.unsplash.com/600x400/?tacos',
    description: 'Fresh Mexican tacos with flavorful fillings and authentic toppings.'
  },
  { 
    id: 'fried_chicken', 
    name: 'Fried Chicken', 
    category: 'Popular', 
    emoji: '🍗',
    image: 'https://source.unsplash.com/600x400/?friedchicken',
    description: 'Crispy, golden fried chicken with juicy meat and perfect seasoning.'
  },
  { 
    id: 'steak', 
    name: 'Steak / Steakhouse', 
    category: 'Popular', 
    emoji: '🥩',
    image: 'https://source.unsplash.com/600x400/?steak,dinner',
    description: 'Premium cuts of beef cooked to perfection with classic steakhouse sides.'
  },
  { 
    id: 'chicken_wings', 
    name: 'Chicken Wings', 
    category: 'Popular', 
    emoji: '🍗',
    image: 'https://source.unsplash.com/600x400/?chickenwings',
    description: 'Crispy wings tossed in your favorite sauce - perfect for game day.'
  },
  { 
    id: 'pasta', 
    name: 'Pasta', 
    category: 'Popular', 
    emoji: '🍝',
    image: 'https://source.unsplash.com/600x400/?pasta',
    description: 'Al dente pasta with rich sauces and fresh ingredients.'
  },
  { 
    id: 'sandwiches', 
    name: 'Sandwiches / Subs', 
    category: 'Popular', 
    emoji: '🥪',
    image: 'https://source.unsplash.com/600x400/?sandwich,sub',
    description: 'Fresh deli sandwiches and subs with quality ingredients and hearty portions.'
  },
  { 
    id: 'sushi', 
    name: 'Sushi', 
    category: 'Asian', 
    emoji: '🍣',
    image: 'https://source.unsplash.com/600x400/?sushi',
    description: 'Fresh Japanese sushi and sashimi with perfectly seasoned rice.'
  },
  { 
    id: 'bbq', 
    name: 'BBQ / Ribs', 
    category: 'American', 
    emoji: '🍖',
    image: 'https://source.unsplash.com/600x400/?bbq,ribs',
    description: 'Smoky grilled meats and barbecue favorites with tangy sauces.'
  },
  { 
    id: 'breakfast', 
    name: 'Breakfast / Brunch', 
    category: 'Casual', 
    emoji: '🍳',
    image: 'https://source.unsplash.com/600x400/?brunch,pancakes',
    description: 'Start your day right with hearty breakfast favorites and brunch classics.'
  },
  { 
    id: 'salad', 
    name: 'Salad / Bowls', 
    category: 'Health', 
    emoji: '🥗',
    image: 'https://source.unsplash.com/600x400/?salad,bowl',
    description: 'Fresh, healthy salads and grain bowls with crisp vegetables and flavorful dressings.'
  },
  { 
    id: 'ice_cream', 
    name: 'Ice Cream / Froyo', 
    category: 'Desserts', 
    emoji: '🍦',
    image: 'https://source.unsplash.com/600x400/?icecream,froyo',
    description: 'Cool treats and frozen desserts for any time of day.'
  },
  { 
    id: 'chinese', 
    name: 'Chinese', 
    category: 'Asian', 
    emoji: '🥢',
    image: 'https://source.unsplash.com/600x400/?chinese,food',
    description: 'Authentic Chinese dishes with bold flavors and fresh ingredients.'
  },
  { 
    id: 'mexican', 
    name: 'Mexican', 
    category: 'American', 
    emoji: '🌮',
    image: 'https://source.unsplash.com/600x400/?mexican,food',
    description: 'Tacos, burritos, quesadillas and other Mexican favorites.'
  },
  { 
    id: 'italian', 
    name: 'Italian', 
    category: 'European', 
    emoji: '🍝',
    image: 'https://source.unsplash.com/600x400/?italian,food',
    description: 'Pasta, risotto, and classic Italian comfort food.'
  },
  { 
    id: 'american', 
    name: 'American (General)', 
    category: 'American', 
    emoji: '🍔',
    image: 'https://source.unsplash.com/600x400/?american,diner',
    description: 'Classic American comfort food, from steaks to mac and cheese.'
  },
  { 
    id: 'fast_food', 
    name: 'Fast Food', 
    category: 'Quick Service', 
    emoji: '🍟',
    image: 'https://source.unsplash.com/600x400/?fastfood',
    description: 'Quick and convenient favorites for when you\'re on the go.'
  },
  { 
    id: 'comfort_food', 
    name: 'Comfort Food', 
    category: 'American', 
    emoji: '🍽️',
    image: 'https://source.unsplash.com/600x400/?comfortfood',
    description: 'Hearty, satisfying dishes that feel like a warm hug.'
  },
  { 
    id: 'casual_dining', 
    name: 'Casual Dining', 
    category: 'Casual', 
    emoji: '🍽️',
    image: 'https://source.unsplash.com/600x400/?casual,restaurant',
    description: 'Relaxed atmosphere with table service and moderate prices.'
  },
  { 
    id: 'japanese', 
    name: 'Japanese (Ramen, Sushi)', 
    category: 'Asian', 
    emoji: '🍱',
    image: 'https://source.unsplash.com/600x400/?ramen,sushi',
    description: 'Fresh Japanese cuisine including ramen, sushi, and traditional dishes.'
  },
  { 
    id: 'korean', 
    name: 'Korean (BBQ, Fried Chicken)', 
    category: 'Asian', 
    emoji: '🍚',
    image: 'https://source.unsplash.com/600x400/?korean,bbq',
    description: 'Spicy, fermented, and flavorful Korean dishes and BBQ.'
  },
  { 
    id: 'thai', 
    name: 'Thai (Curry, Noodles)', 
    category: 'Asian', 
    emoji: '🍜',
    image: 'https://source.unsplash.com/600x400/?thai,curry',
    description: 'Sweet, spicy, and savory Thai cuisine with fresh herbs and bold flavors.'
  },
  { 
    id: 'seafood', 
    name: 'Seafood', 
    category: 'Seafood', 
    emoji: '🐟',
    image: 'https://source.unsplash.com/600x400/?seafood',
    description: 'Fresh catch of the day and ocean delicacies.'
  },
  { 
    id: 'tex_mex', 
    name: 'Tex-Mex', 
    category: 'American', 
    emoji: '🌯',
    image: 'https://source.unsplash.com/600x400/?texmex,quesadilla',
    description: 'Texas-style Mexican cuisine with bold flavors and hearty portions.'
  },
  { 
    id: 'boba', 
    name: 'Boba / Milk Tea', 
    category: 'Drinks', 
    emoji: '🥤',
    image: 'https://source.unsplash.com/600x400/?boba,drink',
    description: 'Sweet bubble tea and milk tea drinks with chewy tapioca pearls.'
  },
  { 
    id: 'vegan', 
    name: 'Vegan / Vegetarian', 
    category: 'Health', 
    emoji: '🌱',
    image: 'https://source.unsplash.com/600x400/?vegan,plantbased',
    description: 'Plant-based cuisine that\'s both healthy and delicious.'
  },
  { 
    id: 'smoothies', 
    name: 'Smoothies / Juice', 
    category: 'Health', 
    emoji: '🥤',
    image: 'https://source.unsplash.com/600x400/?smoothie,juicebar',
    description: 'Fresh pressed juices, smoothies, and healthy drinks.'
  },
  { 
    id: 'noodles', 
    name: 'Noodles (Generic)', 
    category: 'Asian', 
    emoji: '🍜',
    image: 'https://source.unsplash.com/600x400/?noodles,asian',
    description: 'Various Asian noodle dishes from different culinary traditions.'
  },
  { 
    id: 'dessert', 
    name: 'Dessert / Pastries', 
    category: 'Desserts', 
    emoji: '🍰',
    image: 'https://source.unsplash.com/600x400/?dessert,pastry',
    description: 'Sweet treats and decadent desserts to satisfy your sweet tooth.'
  },
  { 
    id: 'indian', 
    name: 'Indian', 
    category: 'Asian', 
    emoji: '🍛',
    image: 'https://source.unsplash.com/600x400/?indian,curry',
    description: 'Aromatic curries and spiced dishes from the Indian subcontinent.'
  },
  { 
    id: 'vietnamese', 
    name: 'Vietnamese (Pho, Banh Mi)', 
    category: 'Asian', 
    emoji: '🍲',
    image: 'https://source.unsplash.com/600x400/?pho,vietnamese',
    description: 'Fresh Vietnamese cuisine with pho, banh mi, and spring rolls.'
  },
  { 
    id: 'mediterranean', 
    name: 'Mediterranean', 
    category: 'European', 
    emoji: '🫔',
    image: 'https://source.unsplash.com/600x400/?mediterranean,gyro',
    description: 'Healthy Mediterranean fare with olive oil, herbs, and fresh ingredients.'
  },
  { 
    id: 'middle_eastern', 
    name: 'Middle Eastern', 
    category: 'Other', 
    emoji: '🥙',
    image: 'https://source.unsplash.com/600x400/?shawarma,kebab',
    description: 'Hummus, kebabs, falafel and fresh Middle Eastern flavors.'
  },
  { 
    id: 'soul_food', 
    name: 'Soul Food', 
    category: 'American', 
    emoji: '🍗',
    image: 'https://source.unsplash.com/600x400/?soulfood',
    description: 'Comforting Southern cuisine with rich, hearty flavors.'
  },
  { 
    id: 'peruvian', 
    name: 'Peruvian', 
    category: 'Other', 
    emoji: '🍲',
    image: 'https://source.unsplash.com/600x400/?peruvian,ceviche',
    description: 'Fresh Peruvian cuisine with ceviche and Andean flavors.'
  },
  { 
    id: 'ethiopian', 
    name: 'Ethiopian', 
    category: 'Other', 
    emoji: '🍖',
    image: 'https://source.unsplash.com/600x400/?ethiopian,injera',
    description: 'Spiced stews and injera bread from East Africa.'
  },
  { 
    id: 'hawaiian', 
    name: 'Hawaiian / Poke', 
    category: 'Seafood', 
    emoji: '🐟',
    image: 'https://source.unsplash.com/600x400/?poke,bowl',
    description: 'Fresh Hawaiian poke bowls and tropical island flavors.'
  },
  { 
    id: 'hot_pot', 
    name: 'Hot Pot', 
    category: 'Asian', 
    emoji: '🍲',
    image: 'https://source.unsplash.com/600x400/?hotpot',
    description: 'Interactive dining experience with simmering broth and fresh ingredients.'
  },
  { 
    id: 'french', 
    name: 'French', 
    category: 'European', 
    emoji: '🥖',
    image: 'https://source.unsplash.com/600x400/?french,food',
    description: 'Elegant French cuisine with rich flavors and classic techniques.'
  },
  
  // Dining Style / Experience-Based (mixed throughout)
  { 
    id: 'takeout', 
    name: 'Takeout-Friendly', 
    category: 'Experience', 
    emoji: '📦',
    image: 'https://source.unsplash.com/600x400/?takeout,delivery',
    description: 'Perfect for when you want to enjoy restaurant-quality food at home.'
  },
  { 
    id: 'date_night', 
    name: 'Date Night', 
    category: 'Experience', 
    emoji: '💕',
    image: 'https://source.unsplash.com/600x400/?romantic,dinner',
    description: 'Romantic dining experiences perfect for special occasions.'
  },
  { 
    id: 'late_night', 
    name: 'Late Night Eats', 
    category: 'Experience', 
    emoji: '🌙',
    image: 'https://source.unsplash.com/600x400/?latenight,food',
    description: 'Delicious options for when the sun goes down and hunger strikes.'
  },
  { 
    id: 'family_friendly', 
    name: 'Family Friendly', 
    category: 'Experience', 
    emoji: '👨‍👩‍👧‍👦',
    image: 'https://source.unsplash.com/600x400/?family,restaurant',
    description: 'Welcoming atmosphere perfect for dining with the whole family.'
  },
  { 
    id: 'trendy', 
    name: 'Trendy / Instagrammable', 
    category: 'Experience', 
    emoji: '📸',
    image: 'https://source.unsplash.com/600x400/?trendy,food',
    description: 'Hip spots with photogenic dishes and modern vibes.'
  },
  { 
    id: 'buffet', 
    name: 'All You Can Eat / Buffet', 
    category: 'Experience', 
    emoji: '🍽️',
    image: 'https://source.unsplash.com/600x400/?buffet',
    description: 'Endless options for when you want to try a little bit of everything.'
  },
  { 
    id: 'guilty_pleasures', 
    name: 'Guilty Pleasures', 
    category: 'Experience', 
    emoji: '😋',
    image: 'https://source.unsplash.com/600x400/?cheesefries,milkshake',
    description: 'Indulgent treats that are worth every calorie.'
  },
  { 
    id: 'food_truck', 
    name: 'Food Truck', 
    category: 'Experience', 
    emoji: '🚚',
    image: 'https://source.unsplash.com/600x400/?foodtruck',
    description: 'Creative street food and mobile kitchen favorites.'
  },
  { 
    id: 'fusion', 
    name: 'Fusion / Ethnic Mix', 
    category: 'Experience', 
    emoji: '🥡',
    image: 'https://source.unsplash.com/600x400/?fusionfood',
    description: 'Creative combinations of different culinary traditions.'
  },
  { 
    id: 'build_your_own', 
    name: 'Build-Your-Own', 
    category: 'Experience', 
    emoji: '🥗',
    image: 'https://source.unsplash.com/600x400/?buildyourown,bowls',
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
  'Drinks',
  'Experience'
];

export const getFoodTypeById = (id: string): FoodType | undefined => {
  return foodTypes.find(type => type.id === id);
};

export const getFoodTypesByCategory = (category: string): FoodType[] => {
  return foodTypes.filter(type => type.category === category);
};
