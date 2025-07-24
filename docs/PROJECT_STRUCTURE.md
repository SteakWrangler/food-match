# Project Structure

This document outlines the organization and architecture of the Toss or Taste application.

## 📁 Root Directory

```
toss-or-taste/
├── src/                    # Source code
├── public/                 # Static assets
├── supabase/              # Supabase configuration and migrations
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── package.json           # Dependencies and scripts
├── README.md              # Project overview
├── CONTRIBUTING.md        # Contribution guidelines
├── CHANGELOG.md           # Version history
├── LICENSE                # MIT License
└── .gitignore            # Git ignore rules
```

## 🗂️ Source Code (`src/`)

### Components (`src/components/`)
Reusable UI components organized by functionality:

```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── SwipeInterface.tsx     # Main swipe interface
├── GeneralSwipeInterface.tsx  # Alternative swipe interface
├── FilterPanel.tsx        # Restaurant filtering
├── CreateRoomModal.tsx    # Room creation modal
├── JoinRoomModal.tsx      # Room joining modal
├── QRCodeModal.tsx        # QR code display
├── MatchModal.tsx         # Match notification
├── LocationModal.tsx      # Location selection
├── RestaurantCard.tsx     # Restaurant display card
├── FoodTypeCard.tsx       # Food type display card
├── SwipeHistory.tsx       # Swipe history display
└── EnhancedSwipeHistory.tsx  # Enhanced history view
```

### Pages (`src/pages/`)
Main application pages:

```
pages/
├── Index.tsx              # Main application page
└── NotFound.tsx           # 404 error page
```

### Hooks (`src/hooks/`)
Custom React hooks:

```
hooks/
├── useRoom.ts             # Room management logic
├── use-mobile.tsx         # Mobile detection
└── use-toast.ts           # Toast notifications
```

### Data (`src/data/`)
Static data and types:

```
data/
├── foodTypes.ts           # Cuisine type definitions
└── restaurants.ts         # Sample restaurant data
```

### Utils (`src/utils/`)
Utility functions and helpers:

```
utils/
├── restaurantFilters.ts    # Restaurant filtering logic
└── foodTypeRandomizer.ts  # Food type randomization
```

### Integrations (`src/integrations/`)
External service integrations:

```
integrations/
└── supabase/
    ├── client.ts          # Supabase client configuration
    ├── types.ts           # Database type definitions
    └── worldwideRestaurants.ts  # Restaurant API integration
```

### Lib (`src/lib/`)
Shared utilities and configurations:

```
lib/
└── utils.ts               # Common utility functions
```

## 🗄️ Database (`supabase/`)

### Migrations (`supabase/migrations/`)
Database schema migrations:

```
migrations/
├── 20250612065442_create_rooms_table.sql
├── 20250612065443_create_restaurant_cache.sql
├── 20250612065444_create_image_cache.sql
└── 20250612065445_cleanup_unused_tables.sql
```

### Functions (`supabase/functions/`)
Edge functions for serverless operations:

```
functions/
└── worldwide-restaurants/
    └── index.ts           # Restaurant API proxy
```

### Configuration (`supabase/`)
```
config.toml                # Supabase project configuration
```

## 📚 Documentation (`docs/`)

```
docs/
├── PROJECT_STRUCTURE.md   # This file
├── API_MIGRATION.md       # API migration documentation
├── HYBRID_API_IMPLEMENTATION_PRD.md  # Product requirements
└── get-db-password.md     # Database setup guide
```

## 🔧 Scripts (`scripts/`)

```
scripts/
├── test/                  # Test utilities
│   ├── test-*.js         # Various test scripts
│   └── ...
├── setup/                 # Setup scripts
│   └── setup-supabase-cli.sh
├── deployment/            # Deployment scripts
│   └── migrate.sh
└── check-rooms.js         # Room verification utility
```

## 🎨 Styling

### Tailwind CSS
- Configuration: `tailwind.config.ts`
- PostCSS: `postcss.config.js`
- Global styles: `src/index.css`

### Component Styling
- Uses Tailwind CSS utility classes
- shadcn/ui components for consistency
- Custom CSS for complex animations

## 🔌 Configuration Files

### Build Tools
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules

### Package Management
- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `bun.lockb` - Bun lock file (alternative)

### UI Framework
- `components.json` - shadcn/ui configuration

## 🚀 Key Architectural Decisions

### 1. Component Organization
- **Feature-based**: Components grouped by feature/functionality
- **Reusable**: UI components in `ui/` directory
- **Page-level**: Main pages in `pages/` directory

### 2. State Management
- **React Query**: For server state management
- **Local State**: For UI state and form data
- **Supabase**: For real-time database state

### 3. Data Flow
- **Unidirectional**: Data flows down, events flow up
- **Hooks**: Custom hooks for complex logic
- **Real-time**: Supabase subscriptions for live updates

### 4. Styling Strategy
- **Utility-first**: Tailwind CSS for rapid development
- **Component-based**: shadcn/ui for consistency
- **Responsive**: Mobile-first design approach

## 🔍 Development Workflow

### Adding New Features
1. Create components in appropriate directory
2. Add types to `src/integrations/supabase/types.ts`
3. Update database schema if needed
4. Add tests to `scripts/test/`
5. Update documentation

### Database Changes
1. Create migration in `supabase/migrations/`
2. Update types in `src/integrations/supabase/types.ts`
3. Test with `scripts/test/` utilities
4. Deploy with `scripts/deployment/migrate.sh`

### Styling Changes
1. Use Tailwind utilities when possible
2. Create custom components in `src/components/ui/`
3. Follow existing design patterns
4. Test on mobile and desktop

## 📝 Code Conventions

### File Naming
- **Components**: PascalCase (e.g., `SwipeInterface.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useRoom.ts`)
- **Utilities**: camelCase (e.g., `restaurantFilters.ts`)
- **Types**: PascalCase (e.g., `types.ts`)

### Import Organization
1. React and external libraries
2. Internal components and hooks
3. Utilities and types
4. Relative imports

### Component Structure
1. Imports
2. Type definitions
3. Component definition
4. Export statement

This structure promotes maintainability, scalability, and developer experience while keeping the codebase organized and easy to navigate. 