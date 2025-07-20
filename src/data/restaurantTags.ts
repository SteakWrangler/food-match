// Primary Cuisine Types (HIGHEST PRIORITY - Always select at least 1)
export const CUISINE_TAGS = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'American', 
  'French', 'Greek', 'Mediterranean', 'Korean', 'Vietnamese', 'Spanish', 
  'German', 'British', 'Irish', 'Caribbean', 'Middle Eastern', 'African',
  'Brazilian', 'Peruvian', 'Argentinian', 'Cuban', 'Puerto Rican', 'Fusion',
  'Pizza', 'Sushi', 'BBQ', 'Seafood', 'Steakhouse', 'Bakery', 'Desserts',
  // Specific Food Types
  'Burgers', 'Pasta', 'Tacos', 'Burritos', 'Ramen', 'Pho', 'Curry', 'Kebab',
  'Falafel', 'Gyros', 'Paella', 'Tapas', 'Schnitzel', 'Fish & Chips', 'Bangers & Mash',
  'Jerk Chicken', 'Ceviche', 'Asado', 'Ropa Vieja', 'Mofongo', 'Empanadas',
  'Sandwiches', 'Subs', 'Wings', 'Noodles', 'Sushi', 'Pizza', 'BBQ', 'Steak',
  'Seafood', 'Chicken', 'Burgers', 'Hot Dogs', 'Ice Cream', 'Coffee', 'Desserts'
];

// Service & Dining Style (HIGH PRIORITY - Select 1-2)
export const SERVICE_TAGS = [
  'Dine-in', 'Takeout', 'Delivery', 'Fast Food', 'Fast Casual', 'Fine Dining',
  'Casual Dining', 'Upscale Casual', 'Family Style', 'Buffet', 'Food Truck',
  'Bar', 'Sports Bar', 'Pub', 'Cafe', 'Coffee Shop'
];

// Dietary & Health (MEDIUM PRIORITY - Select 0-2, only if clearly applicable)
export const DIETARY_TAGS = [
  'Vegetarian Friendly', 'Vegan', 'Gluten Free', 'Healthy', 'Organic',
  'Low Carb', 'Keto Friendly', 'Dairy Free', 'Nut Free'
];

// Atmosphere & Experience (MEDIUM PRIORITY - Select 1-3)
export const ATMOSPHERE_TAGS = [
  'Romantic', 'Family Friendly', 'Date Night', 'Business Lunch', 'Group Dining',
  'Outdoor Seating', 'Live Music', 'Entertainment', 'Late Night', 'Breakfast', 
  'Brunch', 'Lunch', 'Dinner', 'Weekend Brunch', 'Trendy', 'Cozy', 'Lively'
];

// Price & Value (LOW PRIORITY - Select 0-1)
export const PRICE_TAGS = [
  'Budget Friendly', 'Mid Range', 'Upscale', 'Luxury', 'Value'
];

// Special Features (LOW PRIORITY - Select 0-2, only if clearly applicable)
export const FEATURE_TAGS = [
  'Wine List', 'Craft Beer', 'Cocktails', 'Coffee', 'Desserts', 'Bakery',
  'Fresh', 'Local', 'Seasonal', 'Farm to Table', 'Chef Driven',
  'Award Winning', 'Celebrity Chef', 'Historic', 'Trendy'
];

// All tags combined for validation
export const RESTAURANT_TAGS = [
  ...CUISINE_TAGS,
  ...SERVICE_TAGS,
  ...DIETARY_TAGS,
  ...ATMOSPHERE_TAGS,
  ...PRICE_TAGS,
  ...FEATURE_TAGS
];

export const validateTags = (tags: string[]): boolean => {
  return tags.every(tag => RESTAURANT_TAGS.includes(tag));
};

export const getTagCategories = () => {
  return {
    cuisine: CUISINE_TAGS,
    service: SERVICE_TAGS,
    dietary: DIETARY_TAGS,
    atmosphere: ATMOSPHERE_TAGS,
    price: PRICE_TAGS,
    features: FEATURE_TAGS
  };
};

// Helper function to get the primary cuisine tag for display
export const getPrimaryCuisineTag = (tags: string[], restaurantName?: string): string => {
  // First, look for cuisine tags in the provided tags
  const cuisineTag = tags.find(tag => CUISINE_TAGS.includes(tag));
  if (cuisineTag) return cuisineTag;
  
  // If no cuisine tag found, try to infer from restaurant name
  if (restaurantName) {
    const lowerName = restaurantName.toLowerCase();
    
    // Direct cuisine name matches
    const cuisineMatches = [
      { keywords: ['mexican', 'guacamole', 'taco', 'burrito'], cuisine: 'Mexican' },
      { keywords: ['italian', 'pizza', 'pasta', 'olive garden'], cuisine: 'Italian' },
      { keywords: ['chinese', 'peking', 'mandarin'], cuisine: 'Chinese' },
      { keywords: ['japanese', 'sushi', 'ramen', 'hibachi'], cuisine: 'Japanese' },
      { keywords: ['thai', 'pad thai'], cuisine: 'Thai' },
      { keywords: ['indian', 'curry', 'tandoor'], cuisine: 'Indian' },
      { keywords: ['american', 'bbq', 'barbecue', 'smokey', 'grill'], cuisine: 'American' },
      { keywords: ['french', 'bistro', 'cafe'], cuisine: 'French' },
      { keywords: ['greek', 'mediterranean', 'mejana'], cuisine: 'Mediterranean' },
      { keywords: ['korean', 'bibimbap'], cuisine: 'Korean' },
      { keywords: ['vietnamese', 'pho'], cuisine: 'Vietnamese' },
      { keywords: ['spanish', 'tapas'], cuisine: 'Spanish' },
      { keywords: ['german', 'bier', 'wurst'], cuisine: 'German' },
      { keywords: ['british', 'pub', 'fish and chips'], cuisine: 'British' },
      { keywords: ['irish', 'guinness'], cuisine: 'Irish' },
      { keywords: ['caribbean', 'jamaican'], cuisine: 'Caribbean' },
      { keywords: ['middle eastern', 'kebab', 'falafel'], cuisine: 'Middle Eastern' },
      { keywords: ['african', 'ethiopian'], cuisine: 'African' },
      { keywords: ['brazilian', 'churrasco'], cuisine: 'Brazilian' },
      { keywords: ['peruvian', 'ceviche'], cuisine: 'Peruvian' },
      { keywords: ['argentinian', 'asado'], cuisine: 'Argentinian' },
      { keywords: ['cuban', 'cubano'], cuisine: 'Cuban' },
      { keywords: ['puerto rican', 'mofongo'], cuisine: 'Puerto Rican' },
      { keywords: ['fusion', 'asian fusion'], cuisine: 'Fusion' },
      { keywords: ['seafood', 'fish', 'oyster'], cuisine: 'Seafood' },
      { keywords: ['steakhouse', 'steak'], cuisine: 'Steakhouse' },
      { keywords: ['bakery', 'pastry', 'bread'], cuisine: 'Bakery' },
      { keywords: ['desserts', 'ice cream', 'gelato'], cuisine: 'Desserts' }
    ];
    
    for (const match of cuisineMatches) {
      if (match.keywords.some(keyword => lowerName.includes(keyword))) {
        return match.cuisine;
      }
    }
  }
  
  // If no cuisine tag found, try to infer from other tags
  if (tags.length > 0) {
    // Check if any tag might be cuisine-related (case-insensitive)
    const lowerTags = tags.map(tag => tag.toLowerCase());
    const cuisineKeywords = [
      'italian', 'mexican', 'chinese', 'japanese', 'thai', 'indian', 'american',
      'french', 'greek', 'mediterranean', 'korean', 'vietnamese', 'spanish',
      'german', 'british', 'irish', 'caribbean', 'middle eastern', 'african',
      'brazilian', 'peruvian', 'argentinian', 'cuban', 'puerto rican', 'fusion',
      'pizza', 'sushi', 'bbq', 'seafood', 'steakhouse', 'bakery', 'desserts'
    ];
    
    for (const keyword of cuisineKeywords) {
      const matchingTag = lowerTags.find(tag => tag.includes(keyword));
      if (matchingTag) {
        // Return the original tag (preserving case)
        return tags[lowerTags.indexOf(matchingTag)];
      }
    }
  }
  
  // If still no cuisine tag found, return a default
  return 'Restaurant';
};

// Helper function to categorize tags properly
export const categorizeTags = (tags: string[]) => {
  const categorized = {
    cuisine: [] as string[],
    service: [] as string[],
    dietary: [] as string[],
    atmosphere: [] as string[],
    price: [] as string[],
    features: [] as string[]
  };

  const seenTags = new Set<string>();

  tags.forEach(tag => {
    if (seenTags.has(tag)) return;
    seenTags.add(tag);
    
    if (CUISINE_TAGS.includes(tag)) {
      categorized.cuisine.push(tag);
    } else if (SERVICE_TAGS.includes(tag)) {
      categorized.service.push(tag);
    } else if (DIETARY_TAGS.includes(tag)) {
      categorized.dietary.push(tag);
    } else if (ATMOSPHERE_TAGS.includes(tag)) {
      categorized.atmosphere.push(tag);
    } else if (PRICE_TAGS.includes(tag)) {
      categorized.price.push(tag);
    } else if (FEATURE_TAGS.includes(tag)) {
      categorized.features.push(tag);
    }
  });

  return categorized;
}; 