import { CUISINE_TAGS, SERVICE_TAGS, DIETARY_TAGS, ATMOSPHERE_TAGS, PRICE_TAGS, FEATURE_TAGS } from '@/data/restaurantTags';

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

export function getDisplayTags(
  tagsWithConfidence: TagWithConfidence[] = [], 
  cuisine: string = 'Unknown',
  allTags: string[] = []
): DisplayTags {
  const categorized: DisplayTags = {
    cuisine: [],
    service: [],
    dietary: [],
    atmosphere: [],
    price: [],
    features: []
  };

  // Always include cuisine if it has reasonable confidence
  if (cuisine && cuisine !== 'Unknown') {
    categorized.cuisine.push(cuisine);
  }

  // If we have tagsWithConfidence data (ChatGPT processed), use that
  if (tagsWithConfidence.length > 0) {
    // Categorize tags by confidence and sort by confidence (highest first)
    const categorizedWithConfidence: {
      cuisine: Array<{tag: string, confidence: number}>;
      service: Array<{tag: string, confidence: number}>;
      dietary: Array<{tag: string, confidence: number}>;
      atmosphere: Array<{tag: string, confidence: number}>;
      price: Array<{tag: string, confidence: number}>;
      features: Array<{tag: string, confidence: number}>;
    } = {
      cuisine: [],
      service: [],
      dietary: [],
      atmosphere: [],
      price: [],
      features: []
    };

    // Always include the main cuisine from ChatGPT response
    if (cuisine && cuisine !== 'Unknown') {
      categorizedWithConfidence.cuisine.push({ tag: cuisine, confidence: 9 });
    }

    tagsWithConfidence.forEach(({ tag, confidence }) => {
      if (CUISINE_TAGS.includes(tag)) {
        if (confidence >= CUISINE_CONFIDENCE_THRESHOLD) {
          categorizedWithConfidence.cuisine.push({ tag, confidence });
        }
      } else if (SERVICE_TAGS.includes(tag)) {
        if (confidence >= OTHER_TAG_CONFIDENCE_THRESHOLD) {
          categorizedWithConfidence.service.push({ tag, confidence });
        }
      } else if (DIETARY_TAGS.includes(tag)) {
        if (confidence >= OTHER_TAG_CONFIDENCE_THRESHOLD) {
          categorizedWithConfidence.dietary.push({ tag, confidence });
        }
      } else if (ATMOSPHERE_TAGS.includes(tag)) {
        if (confidence >= OTHER_TAG_CONFIDENCE_THRESHOLD) {
          categorizedWithConfidence.atmosphere.push({ tag, confidence });
        }
      } else if (PRICE_TAGS.includes(tag)) {
        if (confidence >= OTHER_TAG_CONFIDENCE_THRESHOLD) {
          categorizedWithConfidence.price.push({ tag, confidence });
        }
      } else if (FEATURE_TAGS.includes(tag)) {
        if (confidence >= OTHER_TAG_CONFIDENCE_THRESHOLD) {
          categorizedWithConfidence.features.push({ tag, confidence });
        }
      }
    });

    // Sort by confidence (highest first) and limit display
    return {
      cuisine: categorizedWithConfidence.cuisine
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_CUISINE_TAGS_DISPLAY)
        .map(item => item.tag),
      service: categorizedWithConfidence.service
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_SERVICE_TAGS_DISPLAY)
        .map(item => item.tag),
      dietary: categorizedWithConfidence.dietary
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_DIETARY_TAGS_DISPLAY)
        .map(item => item.tag),
      atmosphere: categorizedWithConfidence.atmosphere
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_ATMOSPHERE_TAGS_DISPLAY)
        .map(item => item.tag),
      price: categorizedWithConfidence.price
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_PRICE_TAGS_DISPLAY)
        .map(item => item.tag),
      features: categorizedWithConfidence.features
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_FEATURE_TAGS_DISPLAY)
        .map(item => item.tag)
    };
  }

  // Fallback: Use regular tags array for static data
  if (allTags.length > 0) {
    const categorizedTags: {
      cuisine: string[];
      service: string[];
      dietary: string[];
      atmosphere: string[];
      price: string[];
      features: string[];
    } = {
      cuisine: [],
      service: [],
      dietary: [],
      atmosphere: [],
      price: [],
      features: []
    };

    allTags.forEach(tag => {
      if (CUISINE_TAGS.includes(tag)) {
        categorizedTags.cuisine.push(tag);
      } else if (SERVICE_TAGS.includes(tag)) {
        categorizedTags.service.push(tag);
      } else if (DIETARY_TAGS.includes(tag)) {
        categorizedTags.dietary.push(tag);
      } else if (ATMOSPHERE_TAGS.includes(tag)) {
        categorizedTags.atmosphere.push(tag);
      } else if (PRICE_TAGS.includes(tag)) {
        categorizedTags.price.push(tag);
      } else if (FEATURE_TAGS.includes(tag)) {
        categorizedTags.features.push(tag);
      } else {
        // Uncategorized tags go to features
        categorizedTags.features.push(tag);
      }
    });

    // Limit display for static data
    return {
      cuisine: categorizedTags.cuisine.slice(0, MAX_CUISINE_TAGS_DISPLAY),
      service: categorizedTags.service.slice(0, MAX_SERVICE_TAGS_DISPLAY),
      dietary: categorizedTags.dietary.slice(0, MAX_DIETARY_TAGS_DISPLAY),
      atmosphere: categorizedTags.atmosphere.slice(0, MAX_ATMOSPHERE_TAGS_DISPLAY),
      price: categorizedTags.price.slice(0, MAX_PRICE_TAGS_DISPLAY),
      features: categorizedTags.features.slice(0, MAX_FEATURE_TAGS_DISPLAY)
    };
  }

  // If no tags at all, return empty categorized object
  return categorized;
}

// Get all tags for filtering (including low confidence ones)
export function getAllTagsForFiltering(tagsWithConfidence: TagWithConfidence[] = []): string[] {
  return tagsWithConfidence.map(({ tag }) => tag);
} 