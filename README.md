# 🍽️ Toss or Taste

A real-time collaborative restaurant discovery app that helps groups find dining spots together through an intuitive swipe interface.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Room Collaboration**: Create or join rooms to discover restaurants with friends
- **Swipe Interface**: Tinder-like interface for restaurant discovery
- **Food Type Matching**: Match on cuisine preferences before finding specific restaurants
- **Location-based Discovery**: Find restaurants near your location
- **QR Code Sharing**: Easy room sharing via QR codes
- **Match Notifications**: Get notified when everyone in the room likes the same restaurant

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Updates**: Live synchronization across all room participants
- **Filter System**: Filter restaurants by cuisine, price, rating, and distance
- **Loading States**: Smooth loading animations and error handling

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching and caching
- **Supabase**: Real-time database with PostgreSQL
- **Vite**: Fast development and build tooling
- **ESLint**: Code quality and consistency

## 🚀 Live Demo

Visit the live application: [tossortaste.com](https://tossortaste.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and state management

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Real-time Subscriptions** - Live data synchronization
- **Row Level Security** - Secure data access
- **Edge Functions** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **AI-Assisted Tools** - Leveraging modern AI coding assistants for enhanced productivity

## 🏗️ Project Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── SwipeInterface.tsx
│   ├── FilterPanel.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   └── useRoom.ts      # Room management logic
├── pages/              # Page components
│   ├── Index.tsx       # Main application page
│   └── NotFound.tsx    # 404 page
├── data/               # Static data
│   ├── foodTypes.ts    # Cuisine types
│   └── restaurants.ts  # Sample restaurant data
├── utils/              # Utility functions
│   ├── restaurantFilters.ts
│   └── foodTypeRandomizer.ts
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
└── lib/                # Shared utilities
    └── utils.ts
```

## 🎯 Key Features Implementation

### Real-time Room Management
- Uses Supabase real-time subscriptions for live updates
- Room state synchronization across all participants
- Automatic cleanup when users leave rooms

### Swipe Interface
- Custom swipe gestures with touch and mouse support
- Smooth animations and visual feedback
- Match detection and notification system

### Restaurant Discovery
- Integration with restaurant APIs for location-based results
- Caching system for improved performance
- Filter system for refined search results

---

## 📬 Contact

Interested in discussing this project or potential opportunities? Feel free to reach out!

---

**© 2025 Toss or Taste - Built with modern web technologies**
