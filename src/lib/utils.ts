import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts snake_case strings to displayable title case
 * Examples:
 * - "meal_takeaway" → "Meal Takeaway"
 * - "fast_food_restaurant" → "Fast Food Restaurant"
 * - "outdoor_seating" → "Outdoor Seating"
 */
export function formatSnakeCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts kebab-case strings to displayable title case
 * Examples:
 * - "meal-takeaway" → "Meal Takeaway"
 * - "fast-food-restaurant" → "Fast Food Restaurant"
 */
export function formatKebabCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generic function to format any case string to displayable title case
 * Handles snake_case, kebab-case, camelCase, and regular strings
 */
export function formatForDisplay(str: string): string {
  if (!str) return '';
  
  // Handle snake_case
  if (str.includes('_')) {
    return formatSnakeCase(str);
  }
  
  // Handle kebab-case
  if (str.includes('-')) {
    return formatKebabCase(str);
  }
  
  // Handle camelCase
  if (/[a-z][A-Z]/.test(str)) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Handle regular strings - just capitalize first letter
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
