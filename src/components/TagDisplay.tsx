import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { formatForDisplay } from '@/lib/utils';
import { DisplayTags } from '@/utils/tagDisplayUtils';

interface TagDisplayProps {
  displayTags: DisplayTags;
  allTags: string[];
  showExpandButton?: boolean;
}

const TagDisplay: React.FC<TagDisplayProps> = ({ 
  displayTags, 
  allTags, 
  showExpandButton = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count visible tags
  const visibleTagsCount = Object.values(displayTags).flat().length;
  const hiddenTagsCount = allTags.length - visibleTagsCount;

  // Get all tags categorized for expanded view
  const getAllCategorizedTags = () => {
    const categorized = {
      cuisine: [] as string[],
      service: [] as string[],
      dietary: [] as string[],
      atmosphere: [] as string[],
      price: [] as string[],
      features: [] as string[]
    };

    allTags.forEach(tag => {
      if (displayTags.cuisine.includes(tag)) {
        categorized.cuisine.push(tag);
      } else if (displayTags.service.includes(tag)) {
        categorized.service.push(tag);
      } else if (displayTags.dietary.includes(tag)) {
        categorized.dietary.push(tag);
      } else if (displayTags.atmosphere.includes(tag)) {
        categorized.atmosphere.push(tag);
      } else if (displayTags.price.includes(tag)) {
        categorized.price.push(tag);
      } else if (displayTags.features.includes(tag)) {
        categorized.features.push(tag);
      } else {
        // Uncategorized tags go to features
        categorized.features.push(tag);
      }
    });

    return categorized;
  };

  const renderTagSection = (
    tags: string[], 
    colorClass: string, 
    title: string,
    showTitle: boolean = false
  ) => {
    if (tags.length === 0) return null;

    return (
      <div key={title} className="mb-2">
        {showTitle && (
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            {title}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge 
              key={`${title}-${index}`} 
              variant="secondary" 
              className={`text-xs ${colorClass}`}
            >
              {formatForDisplay(tag)}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderCompactView = () => (
    <div className="flex flex-wrap gap-1">
      {/* Show cuisine tags (highest priority) */}
      {displayTags.cuisine.map((tag, index) => (
        <Badge key={`cuisine-${index}`} variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
          {formatForDisplay(tag)}
        </Badge>
      ))}
      {/* Show service tags */}
      {displayTags.service.map((tag, index) => (
        <Badge key={`service-${index}`} variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
          {formatForDisplay(tag)}
        </Badge>
      ))}
      {/* Show atmosphere tags */}
      {displayTags.atmosphere.map((tag, index) => (
        <Badge key={`atmosphere-${index}`} variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
          {formatForDisplay(tag)}
        </Badge>
      ))}
      {/* Show dietary tags */}
      {displayTags.dietary.map((tag, index) => (
        <Badge key={`dietary-${index}`} variant="secondary" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
          {formatForDisplay(tag)}
        </Badge>
      ))}
      {/* Show price tags */}
      {displayTags.price.map((tag, index) => (
        <Badge key={`price-${index}`} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
          {formatForDisplay(tag)}
        </Badge>
      ))}
      {/* Show feature tags */}
      {displayTags.features.map((tag, index) => (
        <Badge key={`features-${index}`} variant="secondary" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
          {formatForDisplay(tag)}
        </Badge>
      ))}
      
      {/* Expand button */}
      {showExpandButton && hiddenTagsCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronDown className="w-3 h-3" />
                <span className="ml-1">+{hiddenTagsCount}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show all {allTags.length} tags</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  const renderExpandedView = () => {
    const allCategorized = getAllCategorizedTags();
    
    return (
      <div className="space-y-3">
        {renderTagSection(allCategorized.cuisine, "bg-orange-100 text-orange-800 border-orange-200", "Cuisine", true)}
        {renderTagSection(allCategorized.service, "bg-blue-100 text-blue-800 border-blue-200", "Service", true)}
        {renderTagSection(allCategorized.atmosphere, "bg-green-100 text-green-800 border-green-200", "Atmosphere", true)}
        {renderTagSection(allCategorized.dietary, "bg-purple-100 text-purple-800 border-purple-200", "Dietary", true)}
        {renderTagSection(allCategorized.price, "bg-yellow-100 text-yellow-800 border-yellow-200", "Price", true)}
        {renderTagSection(allCategorized.features, "bg-gray-100 text-gray-800 border-gray-200", "Features", true)}
        
        {/* Collapse button */}
        <div className="flex justify-center pt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show less
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Collapse tag list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Utensils className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Tags</span>
      </div>
      
      {isExpanded ? renderExpandedView() : renderCompactView()}
    </div>
  );
};

export default TagDisplay; 