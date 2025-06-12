
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  priceRange: string;
  distance: string;
  estimatedTime: string;
  description: string;
  tags: string[];
}

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Vita',
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    rating: 4.8,
    priceRange: '$$$',
    distance: '0.3 mi',
    estimatedTime: '25 min',
    description: 'Authentic Italian cuisine with handmade pasta and traditional recipes passed down through generations.',
    tags: ['Romantic', 'Date Night', 'Wine Bar', 'Outdoor Seating']
  },
  {
    id: '2',
    name: 'Tokyo Ramen House',
    cuisine: 'Japanese',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    rating: 4.6,
    priceRange: '$$',
    distance: '0.7 mi',
    estimatedTime: '15 min',
    description: 'Steaming bowls of authentic ramen with rich broths and fresh noodles made daily.',
    tags: ['Quick Bite', 'Comfort Food', 'Casual', 'Vegetarian Options']
  },
  {
    id: '3',
    name: 'The Garden Bistro',
    cuisine: 'American',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    rating: 4.4,
    priceRange: '$$',
    distance: '1.2 mi',
    estimatedTime: '30 min',
    description: 'Farm-to-table dining with fresh, locally sourced ingredients and seasonal menu changes.',
    tags: ['Healthy', 'Organic', 'Brunch', 'Garden Dining']
  },
  {
    id: '4',
    name: 'Spice Route',
    cuisine: 'Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    rating: 4.7,
    priceRange: '$$',
    distance: '0.9 mi',
    estimatedTime: '20 min',
    description: 'Aromatic Indian dishes with authentic spices and traditional cooking methods.',
    tags: ['Spicy', 'Vegetarian Friendly', 'Family Style', 'Takeout']
  },
  {
    id: '5',
    name: 'Le Petit Café',
    cuisine: 'French',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    rating: 4.9,
    priceRange: '$$$$',
    distance: '1.5 mi',
    estimatedTime: '45 min',
    description: 'Elegant French dining with classic preparations and an extensive wine selection.',
    tags: ['Fine Dining', 'Wine Pairing', 'Special Occasion', 'Reservations Required']
  },
  {
    id: '6',
    name: 'Maria\'s Taqueria',
    cuisine: 'Mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
    rating: 4.5,
    priceRange: '$',
    distance: '0.5 mi',
    estimatedTime: '10 min',
    description: 'Authentic Mexican street food with fresh salsas and handmade tortillas.',
    tags: ['Casual', 'Quick Service', 'Authentic', 'Budget Friendly']
  },
  {
    id: '7',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    rating: 4.8,
    priceRange: '$$$',
    distance: '1.1 mi',
    estimatedTime: '35 min',
    description: 'Fresh sushi and sashimi with daily fish selections and traditional preparations.',
    tags: ['Fresh Fish', 'Omakase', 'Sake Bar', 'Counter Seating']
  },
  {
    id: '8',
    name: 'The Burger Joint',
    cuisine: 'American',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    rating: 4.3,
    priceRange: '$$',
    distance: '0.8 mi',
    estimatedTime: '20 min',
    description: 'Gourmet burgers with locally sourced beef and creative toppings.',
    tags: ['Burgers', 'Craft Beer', 'Casual', 'Groups']
  }
];
