# AI Catalog Platform

A modern, full-stack web application for cataloging AI resources, tools, and content. Built with React, Express.js, and PostgreSQL, featuring a glassmorphism design with both dark and light themes.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Comprehensive catalog of AI tools and resources with rich metadata
- **Dynamic Navigation**: Admin-configurable navigation menu with drag-and-drop reordering
- **Advanced Search**: Real-time search across tools, descriptions, and tags with category filtering  
- **File Management**: Upload and preview PDF and Markdown files with integrated viewer
- **Blog System**: Full-featured blog with categories and rich content management
- **User Management**: Role-based access control with admin, editor, moderator, and user roles

### Technical Features
- **Responsive Design**: Mobile-first design with glassmorphism aesthetics
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Markdown Support**: Rich markdown rendering for product descriptions and blog posts
- **File Uploads**: Secure file upload system with preview capabilities
- **Search & Filtering**: Advanced filtering by categories, tags, and text search
- **Admin Dashboard**: Comprehensive admin panel for content and user management

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** with custom glassmorphism design
- **shadcn/ui** component library with Radix UI primitives
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence
- **Multer** for file upload handling
- **bcryptjs** for password hashing
- **Express Sessions** for authentication

### Development Tools
- **tsx** for TypeScript execution
- **ESBuild** for production bundling
- **Drizzle Kit** for database migrations
- **PostCSS** and **Autoprefixer** for CSS processing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-catalog-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/ai_catalog
   SESSION_SECRET=your-super-secret-session-key
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:5000/api

## 🏗 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Page components and routes
│   │   └── App.tsx        # Main application component
│   └── index.html         # HTML entry point
├── server/                # Express.js backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data access layer
│   ├── auth.ts           # Authentication middleware
│   └── db.ts             # Database configuration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Drizzle database schema
├── uploads/              # File upload directory
└── package.json          # Project dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## 🔐 Authentication

The application uses local authentication with the following default admin credentials:

- **Username**: `maruf`
- **Password**: `Mnbvcxz7500`
- **Email**: `mdrahmatullahmaruf@gmail.com`

### User Roles
- **Admin**: Full system access including user management
- **Editor**: Content creation and editing capabilities
- **Moderator**: Content review and approval permissions  
- **User**: Basic read access and personal profile management

## 📊 Database Schema

### Core Entities
- **Users**: Authentication and profile data with role-based permissions
- **Domains**: Top-level categories (e.g., "AI Tools", "Platforms")
- **Categories**: Subcategories within domains
- **Products**: Individual tools/resources with rich metadata
- **Blog Posts**: Content management with categories and markdown support
- **Attachments**: File uploads with metadata and preview support
- **Navigation Items**: Dynamic menu configuration

### Key Features
- **Slug Generation**: Automatic URL-friendly slug generation for all content
- **File Management**: Secure file uploads with type validation
- **Search Optimization**: Full-text search across multiple fields
- **Audit Trail**: Created/updated timestamps for all entities

## 🎨 Design System

### Theme Support
- **Light Theme**: Clean, professional appearance with subtle shadows
- **Dark Theme**: Modern dark interface with enhanced contrast
- **Glassmorphism**: Translucent elements with backdrop blur effects
- **Responsive Design**: Mobile-first approach with breakpoint optimization

### Color Palette
- **Primary**: Blue accent colors for interactive elements
- **Secondary**: Neutral grays for content and backgrounds  
- **Success/Error**: Green and red for status indicators
- **Glassmorphism**: Semi-transparent overlays with blur effects

## 🔍 API Endpoints

### Public Endpoints
- `GET /api/domains` - List all domains
- `GET /api/categories` - List all categories
- `GET /api/products` - List all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search?q=term` - Search products
- `GET /api/blog/posts` - List blog posts

### Protected Endpoints
- `POST /api/admin/*` - Admin-only operations
- `PUT /api/products/:id` - Update product (Editor+)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/upload` - File upload (Editor+)

## 📝 Content Management

### Product Management
- Rich markdown descriptions with live preview
- Category and tag assignment
- File attachment support (PDF, Markdown)
- Featured product designation
- Author attribution and timestamps

### Blog Management  
- Full markdown editor with preview
- Category organization
- Draft and published states
- SEO-friendly URL generation

### Navigation Management
- Drag-and-drop menu reordering
- Icon selection from Lucide React library
- Visibility controls for menu items
- Real-time navigation updates

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://prod-db-url
SESSION_SECRET=production-session-secret
NODE_ENV=production
```

### Replit Deployment
This project is optimized for Replit deployment with:
- Automatic dependency management
- Built-in PostgreSQL database
- Environment variable configuration
- One-click deployment setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Test thoroughly before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` directory
- Review the API documentation at `/api/docs` (when running)

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Content moderation workflow
- [ ] API rate limiting
- [ ] GraphQL endpoint support
- [ ] Advanced caching strategies
- [ ] Multi-language support

### Performance Optimizations
- [ ] Image optimization and CDN integration
- [ ] Database query optimization
- [ ] Frontend bundle size reduction
- [ ] Progressive Web App (PWA) features

---

**Built with ❤️ for the AI community**