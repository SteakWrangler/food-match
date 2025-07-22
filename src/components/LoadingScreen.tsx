import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  isHost?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading restaurants...", 
  isHost = false 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8">
        {/* Animated Logo/Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">🍽️</span>
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {message}
          </h2>
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-sm text-gray-500">Please wait...</span>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Additional Info */}
        <div className="text-xs text-gray-400 max-w-sm mx-auto">
          {isHost ? (
            <p>Finding the best restaurants near you...</p>
          ) : (
            <p>Waiting for the host to load restaurants...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 