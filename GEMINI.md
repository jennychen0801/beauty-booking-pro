# Beauty Booking Pro - Project Instructions

This project is a modern beauty booking system built with **React**, **Vite**, and **Supabase**.

## Project Overview

- **Frontend:** React (TypeScript), Vite
- **BaaS (Backend as a Service):** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router DOM (v7+)
- **State Management:** React Context API (AuthContext)

### Core Architecture
- `src/lib/supabase.ts`: Supabase client initialization.
- `src/contexts/AuthContext.tsx`: Authentication state management.
- `src/pages/`: Application views (e.g., Login).
- `src/components/`: Reusable components and layout wrappers (e.g., ProtectedRoute).
- `supabase_setup.sql`: Database schema and RLS policies for Supabase.

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended)
- Supabase project credentials

### Key Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start the Vite development server.
- `npm run build`: Build the project for production.
- `npm run preview`: Preview the production build locally.

### Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Conventions

### Coding Style
- **Language:** Always use TypeScript for type safety.
- **Components:** Functional components with Hooks.
- **Icons:** Standardized icon set (verify if `lucide-react` or similar is added later).
- **Styling:** Vanilla CSS or inline styles as seen in `App.tsx`.

### Supabase Integration
- Use the `supabase` client from `@/lib/supabase`.
- Handle Auth via the `AuthContext` provider.
- All database tables must have **Row Level Security (RLS)** enabled. Refer to `supabase_setup.sql` for policy patterns.

### Routing
- Protected routes should be wrapped in the `<ProtectedRoute />` component.

## Database Management
- Keep `supabase_setup.sql` updated with any schema changes.
- Always include triggers for automatic profile creation/updates where necessary.
