import { Restaurant } from '@/data/restaurants';
import { getMockRestaurants } from '@/data/mockRestaurants';

// Mock API Service that provides realistic restaurant data
// This service returns hard-coded data in the same format as the real API endpoints
export class MockApiService {
  private mockGooglePlacesData: any[] = [];
  private mockChatGPTData: any[] = [];

  constructor() {
    // Initialize mock data that simulates API responses
    this.initializeMockData();
  }

  private initializeMockData() {
    // Simulate Google Places API response format with more restaurants
    this.mockGooglePlacesData = [
      {
        id: 'mock_google_1',
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
        description: 'Elegant French bistro serving classic dishes with a modern twist.',
        tags: ['French', 'Fine Dining', 'Romantic'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_2',
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
        description: 'Authentic Japanese sushi bar with fresh fish flown in daily.',
        tags: ['Japanese', 'Sushi', 'Fresh Fish'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_3',
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
        description: 'Casual Mexican restaurant serving authentic tacos and burritos.',
        tags: ['Mexican', 'Tacos', 'Casual'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_4',
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
        description: 'Family-owned pizzeria serving New York style pizza with fresh ingredients.',
        tags: ['Italian', 'Pizza', 'Family-Owned'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_5',
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
        description: 'Gourmet burger restaurant with craft beer selection.',
        tags: ['American', 'Burgers', 'Craft Beer'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_6',
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
        description: 'Authentic Thai cuisine with spicy curries and fresh herbs.',
        tags: ['Thai', 'Spicy', 'Curry'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_7',
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
        description: 'Plant-based restaurant serving organic, locally-sourced ingredients.',
        tags: ['Vegetarian', 'Vegan', 'Organic'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_8',
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
        description: 'Artisanal ice cream shop with unique flavors and homemade waffle cones.',
        tags: ['Dessert', 'Ice Cream', 'Artisanal'],
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_9',
        name: 'Pho House',
        cuisine: 'Vietnamese',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&h=300&fit=crop'
        ],
        rating: 4.5,
        priceRange: '$',
        distance: '1.1 mi',
        estimatedTime: '15-20 min',
        description: 'Authentic Vietnamese pho and noodle dishes with fresh herbs.',
        tags: ['Vietnamese', 'Pho', 'Noodles'],
        address: '369 Oak Street, Midtown',
        phone: '(555) 901-2345',
        website: 'https://phohouse.example.com',
        openingHours: [
          'Monday: 11:00 AM - 9:00 PM',
          'Tuesday: 11:00 AM - 9:00 PM',
          'Wednesday: 11:00 AM - 9:00 PM',
          'Thursday: 11:00 AM - 9:00 PM',
          'Friday: 11:00 AM - 10:00 PM',
          'Saturday: 11:00 AM - 10:00 PM',
          'Sunday: 11:00 AM - 8:00 PM'
        ],
        googleTypes: ['restaurant', 'food', 'establishment'],
        processedByChatGPT: false,
        chatGPTConfidence: 0
      },
      {
        id: 'mock_google_10',
        name: 'Mediterranean Grill',
        cuisine: 'Mediterranean',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
        ],
        rating: 4.3,
        priceRange: '$$',
        distance: '0.6 mi',
        estimatedTime: '20-25 min',
        description: 'Fresh Mediterranean cuisine with grilled meats and healthy sides.',
        tags: ['Mediterranean', 'Grilled', 'Healthy'],
        address: '741 Pine Avenue, Downtown',
        phone: '(555) 012-3456',
        website: 'https://medgrill.example.com',
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
        processedByChatGPT: false,
        chatGPTConfidence: 0
      }
    ];

    // Simulate ChatGPT processed data (enhanced version of Google Places data)
    this.mockChatGPTData = this.mockGooglePlacesData.map(restaurant => ({
      ...restaurant,
      processedByChatGPT: true,
      chatGPTConfidence: Math.floor(Math.random() * 20) + 80, // 80-99 confidence
      tagsWithConfidence: [
        { tag: restaurant.tags[0], confidence: Math.floor(Math.random() * 20) + 80 },
        { tag: restaurant.tags[1], confidence: Math.floor(Math.random() * 20) + 75 },
        { tag: restaurant.tags[2], confidence: Math.floor(Math.random() * 20) + 70 }
      ],
      description: restaurant.description + ' Enhanced with AI analysis for better recommendations.'
    }));
  }

  // Simulate Google Places API call
  async simulateGooglePlacesAPI(params: any): Promise<{ data: any, error: any }> {
    console.log('🔧 MOCK API: Simulating Google Places API call with params:', params);
    
    // Simulate pagination by returning different data based on pageToken
    let restaurants: any[];
    let nextPageToken: string | undefined;
    
    if (params.pageToken) {
      // This is a subsequent page request
      // For mock data, we'll simulate having more data for a few pages, then return empty
      const pageNumber = parseInt(params.pageToken.split('_')[1]) || 1;
      
      if (pageNumber <= 3) {
        // Return different mock data for subsequent pages
        restaurants = this.mockGooglePlacesData.slice((pageNumber * (params.limit || 20)), (pageNumber + 1) * (params.limit || 20));
        nextPageToken = `mock_next_page_token_${pageNumber + 1}`;
      } else {
        // No more data available
        restaurants = [];
        nextPageToken = undefined;
      }
    } else {
      // First page request
      restaurants = this.mockGooglePlacesData.slice(0, params.limit || 20);
      nextPageToken = 'mock_next_page_token_1';
    }
    
    return {
      data: {
        restaurants,
        nextPageToken,
        cache_hits: 5,
        cache_misses: 3
      },
      error: null
    };
  }

  // Simulate ChatGPT Processor API call
  async simulateChatGPTAPI(params: any): Promise<{ data: any, error: any }> {
    console.log('🔧 MOCK API: Simulating ChatGPT Processor API call with params:', params);
    
    return {
      data: {
        restaurants: this.mockChatGPTData.slice(0, params.restaurants?.length || 20),
        processed_count: this.mockChatGPTData.length,
        cache_hits: 3,
        cache_misses: 2
      },
      error: null
    };
  }

  // Simulate Cache Manager API call
  async simulateCacheManagerAPI(params: any): Promise<{ data: any, error: any }> {
    console.log('🔧 MOCK API: Simulating Cache Manager API call with action:', params.action);
    
    switch (params.action) {
      case 'get-stats':
        return {
          data: {
            total_entries: 150,
            cache_hits: 120,
            cache_misses: 30,
            hit_rate: 0.8,
            total_size_mb: 2.5
          },
          error: null
        };
      case 'cleanup-expired':
        return {
          data: {
            cleaned_entries: 12,
            remaining_entries: 138
          },
          error: null
        };
      default:
        return {
          data: null,
          error: { message: 'Invalid cache manager action' }
        };
    }
  }

  // Get mock restaurants with full API simulation
  async getMockRestaurantsWithAPISimulation(params: any): Promise<{ restaurants: Restaurant[], nextPageToken?: string }> {
    console.log('🔧 MOCK API: Starting full API simulation for restaurant search');
    console.log('🔧 Mock parameters:', params);
    
    try {
      // Step 1: Simulate Google Places API call
      const googlePlacesResult = await this.simulateGooglePlacesAPI(params);
      
      if (googlePlacesResult.error) {
        throw new Error(`Mock Google Places API error: ${googlePlacesResult.error.message}`);
      }

      if (!googlePlacesResult.data || !googlePlacesResult.data.restaurants) {
        throw new Error('No restaurants returned from mock Google Places API');
      }

      console.log(`🔧 MOCK API: Found ${googlePlacesResult.data.restaurants.length} restaurants from Google Places`);
      console.log('🔧 MOCK API: Sample restaurant data:', googlePlacesResult.data.restaurants[0]);

      // Step 2: Simulate ChatGPT processing
      const chatGPTResult = await this.simulateChatGPTAPI({
        restaurants: googlePlacesResult.data.restaurants,
        google_place_id: params.location
      });

      if (chatGPTResult.error) {
        console.warn('🔧 MOCK API: ChatGPT processing failed, using Google Places data only:', chatGPTResult.error.message);
        return this.transformGooglePlacesData(googlePlacesResult.data.restaurants);
      }

      if (!chatGPTResult.data || !chatGPTResult.data.restaurants) {
        console.warn('🔧 MOCK API: No ChatGPT data returned, using Google Places data only');
        return this.transformGooglePlacesData(googlePlacesResult.data.restaurants);
      }

      console.log(`🔧 MOCK API: Processed ${chatGPTResult.data.processed_count} restaurants with ChatGPT`);
      console.log('🔧 MOCK API: Sample ChatGPT processed data:', chatGPTResult.data.restaurants[0]);

      // Step 3: Transform and return final data
      const transformedData = this.transformHybridData(chatGPTResult.data.restaurants);
      return {
        restaurants: transformedData.restaurants,
        nextPageToken: googlePlacesResult.data.nextPageToken
      };

    } catch (error) {
      console.error('🔧 MOCK API: Error in mock API simulation:', error);
      throw error;
    }
  }

  private transformGooglePlacesData(restaurants: any[]): { restaurants: Restaurant[], nextPageToken?: string } {
    return {
      restaurants: restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine || 'Unknown',
        image: restaurant.image || '',
        images: restaurant.images || [],
        rating: restaurant.rating || 0,
        priceRange: restaurant.priceRange || '',
        distance: restaurant.distance || '',
        estimatedTime: restaurant.estimatedTime || '',
        description: restaurant.description || '',
        tags: restaurant.tags || [],
        tagsWithConfidence: [], // Empty array when ChatGPT fails
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        googleTypes: restaurant.googleTypes,
        processedByChatGPT: false,
        chatGPTConfidence: 0
      })),
      nextPageToken: undefined
    };
  }

  private transformHybridData(restaurants: any[]): { restaurants: Restaurant[], nextPageToken?: string } {
    return {
      restaurants: restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine || 'Unknown',
        image: restaurant.image || '',
        images: restaurant.images || [],
        rating: restaurant.rating || 0,
        priceRange: restaurant.priceRange || '',
        distance: restaurant.distance || '',
        estimatedTime: restaurant.estimatedTime || '',
        description: restaurant.description || '',
        tags: restaurant.tags || [],
        tagsWithConfidence: restaurant.tagsWithConfidence || [],
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        googleTypes: restaurant.googleTypes,
        processedByChatGPT: restaurant.processedByChatGPT || false,
        chatGPTConfidence: restaurant.chatGPTConfidence || 0
      })),
      nextPageToken: undefined
    };
  }
}

export const getMockApiService = () => new MockApiService(); 