
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { X, Filter } from 'lucide-react';
import { FilterState, defaultFilters } from '@/utils/restaurantFilters';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange 
}) => {
  const cuisines = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian',
    'American', 'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Greek'
  ];

  const priceLabels = ['$', '$$', '$$$', '$$$$'];

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.selectedCuisines.includes(cuisine) 
      ? filters.selectedCuisines.filter(c => c !== cuisine)
      : [...filters.selectedCuisines, cuisine];
    
    updateFilters({ selectedCuisines: newCuisines });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Distance: {filters.distance[0]} miles
            </label>
            <Slider
              value={filters.distance}
              onValueChange={(value) => updateFilters({ distance: value })}
              max={25}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range {filters.priceRange.length === 0 && <span className="text-gray-500">(All)</span>}
            </label>
            <div className="flex gap-2">
              {priceLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Toggle the price range - if already selected, clear it; otherwise set it
                    const newPriceRange = filters.priceRange[0] === index + 1 ? [] : [index + 1];
                    updateFilters({ priceRange: newPriceRange });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                    filters.priceRange[0] === index + 1
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select a specific price range or leave unselected to see all prices
            </p>
          </div>

          {/* Open Now */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Open Now
            </label>
            <Switch
              checked={filters.openNow}
              onCheckedChange={(checked) => updateFilters({ openNow: checked })}
            />
          </div>

          {/* Cuisines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cuisine Types
            </label>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={filters.selectedCuisines.includes(cuisine) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.selectedCuisines.includes(cuisine)
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'hover:bg-orange-50 hover:border-orange-300'
                  }`}
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetFilters}
          >
            Reset
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FilterPanel;
