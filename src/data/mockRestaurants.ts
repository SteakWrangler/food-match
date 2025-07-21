import { Restaurant } from './restaurants';

// TEMPORARY MOCK DATA - Replace API calls with this data
// TODO: Remove this file and restore API calls when ready to go back to live data

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'mock_1',
    name: 'The Grand Bistro',
    cuisine: 'French',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa48de?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop'
    ],
    rating: 4.6,
    priceRange: '$$$',
    distance: '0.3 mi',
    estimatedTime: '15-20 min',
    description: 'Elegant French bistro serving classic dishes with a modern twist. Known for their coq au vin and escargot.',
    tags: ['French', 'Fine Dining', 'Romantic', 'Wine Bar', 'Date Night'],
    address: '123 Main Street, Downtown',
    phone: '(555) 123-4567',
    website: 'https://grandbistro.example.com',
    openingHours: [
      'Monday: 5:00 PM - 10:00 PM',
      'Tuesday: 5:00 PM - 10:00 PM',
      'Wednesday: 5:00 PM - 10:00 PM',
      'Thursday: 5:00 PM - 11:00 PM',
      'Friday: 5:00 PM - 11:00 PM',
      'Saturday: 4:00 PM - 11:00 PM',
      'Sunday: 4:00 PM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 95,
    tagsWithConfidence: [
      { tag: 'French', confidence: 95 },
      { tag: 'Fine Dining', confidence: 90 },
      { tag: 'Romantic', confidence: 85 },
      { tag: 'Wine Bar', confidence: 80 },
      { tag: 'Date Night', confidence: 75 }
    ]
  },
  {
    id: 'mock_2',
    name: 'Sakura Sushi Bar',
    cuisine: 'Japanese',
    image: 'https://images.unsplash.com/photo-1579584425555-c3d17c4fca98?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579584425555-c3d17c4fca98?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563616626625-8e638d54f5b8?w=400&h=300&fit=crop'
    ],
    rating: 4.8,
    priceRange: '$$',
    distance: '0.7 mi',
    estimatedTime: '20-25 min',
    description: 'Authentic Japanese sushi bar with fresh fish flown in daily. Famous for their omakase experience.',
    tags: ['Japanese', 'Sushi', 'Fresh Fish', 'Omakase', 'Authentic'],
    address: '456 Oak Avenue, Midtown',
    phone: '(555) 234-5678',
    website: 'https://sakurasushi.example.com',
    openingHours: [
      'Monday: Closed',
      'Tuesday: 11:30 AM - 2:30 PM, 5:30 PM - 10:00 PM',
      'Wednesday: 11:30 AM - 2:30 PM, 5:30 PM - 10:00 PM',
      'Thursday: 11:30 AM - 2:30 PM, 5:30 PM - 10:00 PM',
      'Friday: 11:30 AM - 2:30 PM, 5:30 PM - 11:00 PM',
      'Saturday: 12:00 PM - 11:00 PM',
      'Sunday: 12:00 PM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 92,
    tagsWithConfidence: [
      { tag: 'Japanese', confidence: 92 },
      { tag: 'Sushi', confidence: 95 },
      { tag: 'Fresh Fish', confidence: 88 },
      { tag: 'Omakase', confidence: 85 },
      { tag: 'Authentic', confidence: 90 }
    ]
  },
  {
    id: 'mock_3',
    name: 'Taco Fiesta',
    cuisine: 'Mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&h=300&fit=crop'
    ],
    rating: 4.3,
    priceRange: '$',
    distance: '1.2 mi',
    estimatedTime: '10-15 min',
    description: 'Casual Mexican restaurant serving authentic tacos, burritos, and margaritas. Great for quick lunch or dinner.',
    tags: ['Mexican', 'Tacos', 'Casual', 'Quick Service', 'Margaritas'],
    address: '789 Pine Street, Westside',
    phone: '(555) 345-6789',
    website: 'https://tacofiesta.example.com',
    openingHours: [
      'Monday: 11:00 AM - 10:00 PM',
      'Tuesday: 11:00 AM - 10:00 PM',
      'Wednesday: 11:00 AM - 10:00 PM',
      'Thursday: 11:00 AM - 10:00 PM',
      'Friday: 11:00 AM - 11:00 PM',
      'Saturday: 11:00 AM - 11:00 PM',
      'Sunday: 11:00 AM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 88,
    tagsWithConfidence: [
      { tag: 'Mexican', confidence: 88 },
      { tag: 'Tacos', confidence: 92 },
      { tag: 'Casual', confidence: 85 },
      { tag: 'Quick Service', confidence: 80 },
      { tag: 'Margaritas', confidence: 75 }
    ]
  },
  {
    id: 'mock_4',
    name: 'Pizza Palace',
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
    ],
    rating: 4.5,
    priceRange: '$$',
    distance: '0.5 mi',
    estimatedTime: '25-30 min',
    description: 'Family-owned pizzeria serving New York style pizza with fresh ingredients and homemade sauce.',
    tags: ['Italian', 'Pizza', 'Family-Owned', 'Delivery', 'Takeout'],
    address: '321 Elm Street, Downtown',
    phone: '(555) 456-7890',
    website: 'https://pizzapalace.example.com',
    openingHours: [
      'Monday: 11:00 AM - 10:00 PM',
      'Tuesday: 11:00 AM - 10:00 PM',
      'Wednesday: 11:00 AM - 10:00 PM',
      'Thursday: 11:00 AM - 10:00 PM',
      'Friday: 11:00 AM - 11:00 PM',
      'Saturday: 11:00 AM - 11:00 PM',
      'Sunday: 12:00 PM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 85,
    tagsWithConfidence: [
      { tag: 'Italian', confidence: 85 },
      { tag: 'Pizza', confidence: 95 },
      { tag: 'Family-Owned', confidence: 80 },
      { tag: 'Delivery', confidence: 90 },
      { tag: 'Takeout', confidence: 85 }
    ]
  },
  {
    id: 'mock_5',
    name: 'Burger Joint',
    cuisine: 'American',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop'
    ],
    rating: 4.2,
    priceRange: '$$',
    distance: '0.8 mi',
    estimatedTime: '15-20 min',
    description: 'Gourmet burger restaurant with craft beer selection. Known for their signature truffle fries.',
    tags: ['American', 'Burgers', 'Craft Beer', 'Casual', 'Gourmet'],
    address: '654 Maple Drive, Eastside',
    phone: '(555) 567-8901',
    website: 'https://burgerjoint.example.com',
    openingHours: [
      'Monday: 11:00 AM - 10:00 PM',
      'Tuesday: 11:00 AM - 10:00 PM',
      'Wednesday: 11:00 AM - 10:00 PM',
      'Thursday: 11:00 AM - 10:00 PM',
      'Friday: 11:00 AM - 11:00 PM',
      'Saturday: 11:00 AM - 11:00 PM',
      'Sunday: 12:00 PM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 82,
    tagsWithConfidence: [
      { tag: 'American', confidence: 82 },
      { tag: 'Burgers', confidence: 95 },
      { tag: 'Craft Beer', confidence: 85 },
      { tag: 'Casual', confidence: 80 },
      { tag: 'Gourmet', confidence: 75 }
    ]
  },
  {
    id: 'mock_6',
    name: 'Thai Spice',
    cuisine: 'Thai',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
    ],
    rating: 4.7,
    priceRange: '$$',
    distance: '1.5 mi',
    estimatedTime: '30-35 min',
    description: 'Authentic Thai cuisine with spicy curries and fresh herbs. Family recipes passed down for generations.',
    tags: ['Thai', 'Spicy', 'Curry', 'Authentic', 'Family Recipes'],
    address: '987 Cedar Lane, Southside',
    phone: '(555) 678-9012',
    website: 'https://thaispice.example.com',
    openingHours: [
      'Monday: 11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM',
      'Tuesday: 11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM',
      'Wednesday: 11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM',
      'Thursday: 11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM',
      'Friday: 11:30 AM - 2:30 PM, 5:00 PM - 11:00 PM',
      'Saturday: 12:00 PM - 11:00 PM',
      'Sunday: 12:00 PM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 90,
    tagsWithConfidence: [
      { tag: 'Thai', confidence: 90 },
      { tag: 'Spicy', confidence: 85 },
      { tag: 'Curry', confidence: 88 },
      { tag: 'Authentic', confidence: 92 },
      { tag: 'Family Recipes', confidence: 80 }
    ]
  },
  {
    id: 'mock_7',
    name: 'Green Garden',
    cuisine: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop'
    ],
    rating: 4.4,
    priceRange: '$$',
    distance: '0.9 mi',
    estimatedTime: '20-25 min',
    description: 'Plant-based restaurant serving organic, locally-sourced ingredients. Vegan and gluten-free options available.',
    tags: ['Vegetarian', 'Vegan', 'Organic', 'Healthy', 'Gluten-Free'],
    address: '147 Birch Road, Northside',
    phone: '(555) 789-0123',
    website: 'https://greengarden.example.com',
    openingHours: [
      'Monday: 11:00 AM - 9:00 PM',
      'Tuesday: 11:00 AM - 9:00 PM',
      'Wednesday: 11:00 AM - 9:00 PM',
      'Thursday: 11:00 AM - 9:00 PM',
      'Friday: 11:00 AM - 10:00 PM',
      'Saturday: 10:00 AM - 10:00 PM',
      'Sunday: 10:00 AM - 8:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 87,
    tagsWithConfidence: [
      { tag: 'Vegetarian', confidence: 87 },
      { tag: 'Vegan', confidence: 85 },
      { tag: 'Organic', confidence: 90 },
      { tag: 'Healthy', confidence: 88 },
      { tag: 'Gluten-Free', confidence: 82 }
    ]
  },
  {
    id: 'mock_8',
    name: 'Ice Cream Delight',
    cuisine: 'Dessert',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
    ],
    rating: 4.6,
    priceRange: '$',
    distance: '0.4 mi',
    estimatedTime: '5-10 min',
    description: 'Artisanal ice cream shop with unique flavors and homemade waffle cones. Perfect for dessert or a sweet treat.',
    tags: ['Dessert', 'Ice Cream', 'Artisanal', 'Sweet Treat', 'Homemade'],
    address: '258 Walnut Street, Downtown',
    phone: '(555) 890-1234',
    website: 'https://icecreamdelight.example.com',
    openingHours: [
      'Monday: 12:00 PM - 10:00 PM',
      'Tuesday: 12:00 PM - 10:00 PM',
      'Wednesday: 12:00 PM - 10:00 PM',
      'Thursday: 12:00 PM - 10:00 PM',
      'Friday: 12:00 PM - 11:00 PM',
      'Saturday: 11:00 AM - 11:00 PM',
      'Sunday: 11:00 AM - 9:00 PM'
    ],
    googleTypes: ['restaurant', 'food', 'establishment'],
    processedByChatGPT: true,
    chatGPTConfidence: 85,
    tagsWithConfidence: [
      { tag: 'Dessert', confidence: 85 },
      { tag: 'Ice Cream', confidence: 95 },
      { tag: 'Artisanal', confidence: 80 },
      { tag: 'Sweet Treat', confidence: 88 },
      { tag: 'Homemade', confidence: 75 }
    ]
  }
];

// Helper function to get mock restaurants with optional filtering
export const getMockRestaurants = (params?: {
  location?: string;
  radius?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  limit?: number;
}): { restaurants: Restaurant[], nextPageToken?: string } => {
  console.log('🔧 Using MOCK RESTAURANT DATA instead of API calls');
  console.log('🔧 Mock parameters:', params);
  
  // For now, just return all mock restaurants
  // TODO: Implement filtering logic if needed for testing
  const limit = params?.limit || 20;
  const restaurants = MOCK_RESTAURANTS.slice(0, limit);
  
  return {
    restaurants,
    nextPageToken: undefined // No pagination for mock data
  };
}; 