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

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **State Management**: TanStack Query for API data fetching and caching
- **Build Tool**: Vite with custom configuration for development and production

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
- **Products**: Individual resources/tools with rich metadata
- **Blog Posts**: Content management with categories
- **Sessions**: Server-side session storage for authentication
- **Attachments**: File management for uploaded content

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