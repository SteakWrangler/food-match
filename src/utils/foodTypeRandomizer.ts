
import { FoodType } from '@/data/foodTypes';

export const randomizeFoodTypesByTiers = (foodTypes: FoodType[]): FoodType[] => {
  // Define tier sizes - more popular items in smaller tiers at the top
  const tierSizes = [3, 4, 5, 6, 8]; // First 3, next 4, next 5, etc.
  const randomized: FoodType[] = [];
  let startIndex = 0;

  tierSizes.forEach(tierSize => {
    if (startIndex >= foodTypes.length) return;
    
    const endIndex = Math.min(startIndex + tierSize, foodTypes.length);
    const tier = foodTypes.slice(startIndex, endIndex);
    
    // Shuffle this tier
    const shuffledTier = [...tier].sort(() => Math.random() - 0.5);
    randomized.push(...shuffledTier);
    
    startIndex = endIndex;
  });

  // Add any remaining items
  if (startIndex < foodTypes.length) {
    const remaining = foodTypes.slice(startIndex);
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
    randomized.push(...shuffledRemaining);
  }

  return randomized;
};
