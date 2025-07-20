
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import { FilterState, defaultFilters } from '@/utils/restaurantFilters';
// import { Badge } from '@/components/ui/badge'; // COMMENTED OUT - can be restored later
// import { Switch } from '@/components/ui/switch'; // COMMENTED OUT - can be restored later

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
  const priceLabels = ['$', '$$', '$$$', '$$$$'];

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
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
              Distance: {filters.distance[0]} miles or less
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
              Select a price range to see restaurants at that price or less. Leave unselected to see all prices.
            </p>
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
