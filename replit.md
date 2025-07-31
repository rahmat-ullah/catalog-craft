# AI Catalog Platform

## Overview

This is a full-stack web application for cataloging AI resources, tools, and content. It's built as a modern SPA with a React frontend and Express backend, featuring a content management system for domains, categories, products, and blog posts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client-side and server-side code:

- **Frontend**: React SPA with TypeScript, built with Vite
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration with session management
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Dynamic Navigation System
The application features a dynamic navigation management system that allows administrators to configure menu items without code changes:
- **Navigation Management**: Admin interface to create, edit, delete, and reorder navigation items
- **Visual Management**: Drag-and-drop interface with position controls and visibility toggles
- **Icon Integration**: Integration with Lucide React icons for visual navigation elements
- **Real-time Updates**: Navigation changes reflect immediately across the application
- **Responsive Design**: Unified navigation experience across desktop and mobile devices

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **State Management**: TanStack Query for API data fetching and caching
- **Build Tool**: Vite with custom configuration for development and production
- **Markdown Support**: Built-in markdown renderer for rich product descriptions and file content

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with consistent JSON responses
- **File Uploads**: Multer middleware for handling file uploads
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom request/response logging for API endpoints

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Authentication and profile management
- **Domains**: Top-level categorization (e.g., AI Tools, Platforms)
- **Categories**: Subcategories within domains
- **Products**: Individual resources/tools with rich metadata and markdown descriptions
- **Blog Posts**: Content management with categories
- **Sessions**: Server-side session storage for authentication
- **Attachments**: File management for uploaded PDF and Markdown content with preview capabilities

### Authentication System
- **Provider**: Custom Local Authentication with bcrypt password hashing
- **Session Management**: Express sessions with PostgreSQL storage
- **User Roles**: Admin, Editor, Moderator, User with role-based access control
- **Security**: HTTPS-only cookies, password hashing, role-based route protection
- **Default Admin**: Username "maruf", password "Mnbvcxz7500", email "mdrahmatullahmaruf@gmail.com"
- **User Management**: Admin can create, edit, delete users and assign roles

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Authentication Check**: Express middleware validates session
3. **Route Handling**: Express routes process requests with validation
4. **Database Operations**: Drizzle ORM handles PostgreSQL interactions
5. **Response**: JSON data returned to client with consistent error handling
6. **UI Updates**: React components re-render based on query state changes

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect authentication
- **multer**: File upload handling

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Backend bundling for production

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR and error overlay
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Drizzle migrations with push command
- **Environment**: Replit-specific integration with cartographer plugin

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL with connection pooling
- **Serving**: Express serves both API routes and static frontend assets

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPLIT_DOMAINS**: Authentication domain configuration (required)
- **NODE_ENV**: Environment mode (development/production)

The application is designed to run seamlessly on Replit with automatic authentication integration, but can be deployed to any Node.js hosting platform with minimal configuration changes.

## Recent Changes

### AI Chatbot Implementation (January 31, 2025)
- Built complete AI chatbot system with OpenAI GPT-4 integration
- Added floating chat interface in bottom-right corner with glassmorphism design
- Implemented rate limiting system (5 questions per day per device) with browser fingerprinting
- Created chat sessions database table for tracking usage and conversations
- Added predefined questions for quick user engagement and better UX
- Implemented markdown rendering for AI responses with proper formatting support
- Added context-aware responses using platform's domains, categories, and products data

### README Documentation (January 31, 2025)
- Created comprehensive README.md file with complete project documentation
- Documented all features, tech stack, installation instructions, and API endpoints
- Added project structure overview, database schema details, and deployment guidelines
- Included authentication system details, design system documentation, and development guidelines
- Provided roadmap and contributing guidelines for future development

### Comprehensive SEO Optimization (January 31, 2025)
- Implemented complete SEO meta tags in HTML with Open Graph and Twitter Card support
- Added structured data (JSON-LD) for Organization, Website, and page-specific schemas
- Created dynamic sitemap.xml generation with all pages, products, categories, and blog posts
- Added robots.txt with proper crawling directives and sitemap references
- Built custom useSEO React hook for dynamic meta tag management per page
- Added canonical URLs, proper meta descriptions, and keyword optimization
- Implemented breadcrumb and FAQ structured data schemas for enhanced search results
- Created SEO utility functions for title, description, and keyword generation
- Added favicon, manifest.json, and social media image placeholders
- Optimized for AI search engines with comprehensive content markup

### Tools Page Implementation (January 31, 2025)
- Created comprehensive Tools page at `/tools` route with search and filtering capabilities
- Fixed missing API endpoints `/api/products` and `/api/categories` that were causing empty data
- Resolved JavaScript runtime errors related to variable initialization in Tools component
- Added 10 sample AI/tech tools across different categories with rich markdown descriptions
- Implemented responsive grid layout with tool cards showing thumbnails, descriptions, stats, and tags
- Enhanced navigation to include Tools section for better discoverability
- Updated product schema to include author field and improved markdown support for descriptions