import { CUISINE_TAGS, SERVICE_TAGS, DIETARY_TAGS, ATMOSPHERE_TAGS, PRICE_TAGS, FEATURE_TAGS } from '@/data/restaurantTags';
import { Restaurant } from '@/data/restaurants';

export interface TagWithConfidence {
  tag: string;
  confidence: number;
}

export interface DisplayTags {
  cuisine: string[];
  service: string[];
  dietary: string[];
  atmosphere: string[];
  price: string[];
  features: string[];
}

// Confidence thresholds for display
const CUISINE_CONFIDENCE_THRESHOLD = 5; // Show cuisine if confidence >= 5
const OTHER_TAG_CONFIDENCE_THRESHOLD = 5; // Show other tags if confidence >= 5 (lowered from 7)

// UI display limits - show more tags for better UX
const MAX_CUISINE_TAGS_DISPLAY = 5; // Show max 5 cuisine tags in UI
const MAX_SERVICE_TAGS_DISPLAY = 4; // Show max 4 service tags in UI
const MAX_ATMOSPHERE_TAGS_DISPLAY = 4; // Show max 4 atmosphere tags in UI
const MAX_DIETARY_TAGS_DISPLAY = 3; // Show max 3 dietary tags in UI
const MAX_PRICE_TAGS_DISPLAY = 2; // Show max 2 price tags in UI
const MAX_FEATURE_TAGS_DISPLAY = 4; // Show max 4 feature tags in UI

export const getDisplayTags = (restaurant: Restaurant, maxTags: number = 3): string[] => {
  if (!restaurant.tags || restaurant.tags.length === 0) {
    return [];
  }

  // Filter out common/generic tags that don't add value
  const filteredTags = restaurant.tags.filter(tag => 
    !['restaurant', 'food', 'establishment', 'point_of_interest'].includes(tag.toLowerCase())
  );

  // Return up to maxTags
  return filteredTags.slice(0, maxTags);
};

// Get all tags for filtering (including low confidence ones)
export function getAllTagsForFiltering(tagsWithConfidence: TagWithConfidence[] = []): string[] {
  return tagsWithConfidence.map(({ tag }) => tag);
} 