
import React, { useState } from 'react';
import SwipeInterface from '@/components/SwipeInterface';
import FilterPanel from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { Filter, Users, MapPin } from 'lucide-react';

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              FoodMatch
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>San Francisco</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="border-orange-200 hover:bg-orange-50"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Status Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700">Connected with</span>
              <span className="font-medium text-gray-900">Sarah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Swipe Interface */}
        <SwipeInterface />

        {/* Instructions */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-600 text-sm">
            Swipe right if you want to eat there, left if you don't
          </p>
          <p className="text-orange-600 text-sm font-medium">
            When you both swipe right, it's a match! 🎉
          </p>
        </div>
      </main>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
};

export default Index;
