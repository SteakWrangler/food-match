// TEMPORARY MOCK LOCATION DATA
// TODO: Remove this file when restoring API calls

export interface MockLocation {
  name: string;
  coordinates: string;
  address: string;
}

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    name: "Downtown",
    coordinates: "40.7128,-74.0060",
    address: "Downtown, New York, NY"
  },
  {
    name: "Midtown",
    coordinates: "40.7589,-73.9851", 
    address: "Midtown, New York, NY"
  },
  {
    name: "Brooklyn",
    coordinates: "40.6782,-73.9442",
    address: "Brooklyn, NY"
  },
  {
    name: "San Francisco",
    coordinates: "37.7749,-122.4194",
    address: "San Francisco, CA"
  },
  {
    name: "Los Angeles",
    coordinates: "34.0522,-118.2437",
    address: "Los Angeles, CA"
  },
  {
    name: "Chicago",
    coordinates: "41.8781,-87.6298",
    address: "Chicago, IL"
  },
  {
    name: "Miami",
    coordinates: "25.7617,-80.1918",
    address: "Miami, FL"
  },
  {
    name: "Seattle",
    coordinates: "47.6062,-122.3321",
    address: "Seattle, WA"
  }
];

// Helper function to get mock location data
export const getMockLocation = (input: string): MockLocation | null => {
  const normalizedInput = input.toLowerCase().trim();
  
  // Try to find exact match first
  const exactMatch = MOCK_LOCATIONS.find(loc => 
    loc.name.toLowerCase() === normalizedInput ||
    loc.address.toLowerCase().includes(normalizedInput)
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial match
  const partialMatch = MOCK_LOCATIONS.find(loc => 
    loc.name.toLowerCase().includes(normalizedInput) ||
    loc.address.toLowerCase().includes(normalizedInput)
  );
  
  return partialMatch || null;
};

// Helper function to get location from coordinates
export const getMockLocationFromCoords = (lat: number, lng: number): MockLocation => {
  // For mock data, just return the first location
  // In real implementation, this would do reverse geocoding
  return MOCK_LOCATIONS[0];
}; 