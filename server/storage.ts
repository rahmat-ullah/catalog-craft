import {
  users,
  domains,
  categories,
  products,
  attachments,
  blogCategories,
  blogPosts,
  navigationItems,
  type User,
  type UpsertUser,
  type Domain,
  type InsertDomain,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Attachment,
  type InsertAttachment,
  type BlogCategory,
  type InsertBlogCategory,
  type BlogPost,
  type InsertBlogPost,
  type NavigationItem,
  type InsertNavigationItem,
} from "@shared/schema";
import { generateSlug } from "@shared/utils";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations for local authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Domain operations
  getDomains(): Promise<Domain[]>;
  getDomain(idOrSlug: string): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: string, domain: Partial<InsertDomain>): Promise<Domain>;
  deleteDomain(id: string): Promise<void>;

  // Category operations
  getCategories(domainId?: string): Promise<Category[]>;
  getCategory(idOrSlug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Product operations
  getProducts(categoryId?: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(idOrSlug: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Attachment operations
  getAttachments(productId: string): Promise<Attachment[]>;
  getAttachment(id: string): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: string): Promise<void>;

  // Blog operations
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(idOrSlug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, category: Partial<InsertBlogCategory>): Promise<BlogCategory>;
  deleteBlogCategory(id: string): Promise<void>;

  getBlogPosts(categoryId?: string): Promise<BlogPost[]>;
  getBlogPost(idOrSlug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;

  // Navigation operations
  getNavigationItems(): Promise<NavigationItem[]>;
  getNavigationItem(id: string): Promise<NavigationItem | undefined>;
  createNavigationItem(item: InsertNavigationItem): Promise<NavigationItem>;
  updateNavigationItem(id: string, item: Partial<InsertNavigationItem>): Promise<NavigationItem>;
  deleteNavigationItem(id: string): Promise<void>;
  reorderNavigationItems(items: { id: string; position: number }[]): Promise<void>;

  // Stats
  getStats(): Promise<{
    domains: number;
    categories: number;
    products: number;
    downloads: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private domains: Map<string, Domain> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private attachments: Map<string, Attachment> = new Map();
  private blogCategories: Map<string, BlogCategory> = new Map();
  private blogPosts: Map<string, BlogPost> = new Map();
  private navigationItems: Map<string, NavigationItem> = new Map();

  constructor() {
    this.initializeSampleData();
    this.initializeDefaultAdmin();
    this.initializeDefaultNavigation();
  }

  private async initializeDefaultAdmin() {
    // Check if admin user already exists
    const existingAdmin = await this.getUserByUsername('maruf');
    if (!existingAdmin) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('Mnbvcxz7500', 12);
      
      await this.createUser({
        username: 'maruf',
        email: 'mdrahmatullahmaruf@gmail.com',
        passwordHash: hashedPassword,
        firstName: 'Maruf',
        lastName: 'Rahman',
        profileImageUrl: null,
        role: 'admin',
        isActive: true,
      });
    }
  }

  private initializeDefaultNavigation() {
    const defaultNavItems = [
      {
        id: "nav-1",
        label: "Domains",
        href: "/",
        position: 1,
        isVisible: true,
        icon: "Globe",
        description: "Browse all domains",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "nav-2", 
        label: "CLI Agents",
        href: "/agents",
        position: 2,
        isVisible: true,
        icon: "Terminal",
        description: "Claude CLI agents",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "nav-3",
        label: "MCP Servers", 
        href: "/mcp",
        position: 3,
        isVisible: true,
        icon: "Server",
        description: "Model Context Protocol servers",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "nav-4",
        label: "Tools",
        href: "/tools", 
        position: 4,
        isVisible: true,
        icon: "Wrench",
        description: "Development tools",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "nav-5",
        label: "Blog",
        href: "/blog",
        position: 5,
        isVisible: true,
        icon: "BookOpen",
        description: "Latest news and tutorials",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    defaultNavItems.forEach(item => {
      this.navigationItems.set(item.id, item);
    });
  }

  private initializeSampleData() {
    // Create sample domains
    const sampleDomains = [
      {
        id: "domain-1",
        name: "Claude Code Agents",
        slug: "claude-code-agents",
        description: "Discover powerful Claude-powered code agents for development automation, code generation, and intelligent programming assistance.",
        heroImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
        icon: "fas fa-code",
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "domain-2",
        name: "MCP Servers",
        slug: "mcp-servers",
        description: "Model Context Protocol servers for extending AI capabilities with external data sources and real-time integrations.",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        icon: "fas fa-server",
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "domain-3",
        name: "AI Platforms",
        slug: "ai-platforms",
        description: "Comprehensive AI platforms including chat interfaces, IDEs, document generation tools, and development environments.",
        heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        icon: "fas fa-brain",
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create sample categories
    const sampleCategories = [
      {
        id: "cat-1",
        domainId: "domain-1",
        name: "Code Generation",
        slug: "code-generation",
        description: "Automated code generation tools and agents",
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cat-2",
        domainId: "domain-1",
        name: "Development Tools",
        slug: "development-tools",
        description: "Comprehensive development and debugging tools",
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cat-3",
        domainId: "domain-2",
        name: "Data Integration",
        slug: "data-integration",
        description: "External data source integrations",
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create sample products
    const sampleProducts = [
      {
        id: "prod-1",
        categoryId: "cat-1",
        name: "Claude Dev Assistant",
        slug: "claude-dev-assistant",
        subtitle: "Advanced code generation and debugging assistant",
        description: `## Overview
Advanced code generation and debugging assistant powered by Claude AI for multiple programming languages.

### Key Features
- **Intelligent Code Generation**: Creates high-quality code from natural language descriptions
- **Advanced Debugging**: Identifies and fixes complex bugs automatically  
- **Multi-Language Support**: Works with Python, JavaScript, TypeScript, Java, C++, and more
- **Code Optimization**: Suggests performance improvements and best practices

### Getting Started
1. Install the Claude Dev Assistant extension
2. Configure your preferred programming language
3. Start coding with AI-powered assistance

[Learn more about Claude](https://www.anthropic.com) and its capabilities.`,
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        tags: ["code-generation", "debugging", "ai-assistant"],
        rating: 49,
        downloadCount: 1200,
        isFeatured: true,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-2",
        categoryId: "cat-3",
        name: "Data Integration Hub",
        slug: "data-integration-hub",
        subtitle: "High-performance MCP server for real-time data integration",
        description: `## Data Integration Hub - MCP Server
High-performance Model Context Protocol server for real-time data integration with external APIs and databases.

### Core Features
- **Real-time API Integration**: Connect to REST, GraphQL, and WebSocket APIs
- **Database Connectivity**: Support for PostgreSQL, MySQL, MongoDB, and Redis
- **Data Transformation**: Built-in data mapping and transformation tools
- **Caching Layer**: Intelligent caching for improved performance

### Supported Integrations
- Salesforce, HubSpot, and CRM systems
- E-commerce platforms (Shopify, WooCommerce)
- Analytics platforms (Google Analytics, Mixpanel)
- Social media APIs (Twitter, LinkedIn, Facebook)

*Perfect for businesses needing real-time data synchronization.*`,
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        tags: ["mcp-server", "data-integration", "api"],
        rating: 47,
        downloadCount: 856,
        isFeatured: true,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-3",
        categoryId: "cat-1",
        name: "AutoCode Pro",
        slug: "autocode-pro",
        subtitle: "Professional code automation suite",
        description: `## AutoCode Pro - Professional Development Suite
Streamline your development workflow with intelligent automation tools.

### Core Features
- **Smart Templates**: Pre-built code structures for common patterns
- **Automated Testing**: Generate comprehensive test suites automatically
- **Code Review**: AI-powered code analysis and suggestions
- **Documentation**: Auto-generate technical documentation

### Supported Frameworks
- React, Vue, Angular for frontend development
- Node.js, Django, Flask for backend services
- Docker and Kubernetes for deployment
- CI/CD pipeline integration

**Perfect for teams looking to accelerate development cycles.**`,
        thumbnail: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400",
        tags: ["automation", "templates", "testing", "documentation"],
        rating: 48,
        downloadCount: 2100,
        isFeatured: true,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-4",
        categoryId: "cat-2",
        name: "AI Bug Hunter",
        slug: "ai-bug-hunter",
        subtitle: "Intelligent debugging and error analysis tool",
        description: `## AI Bug Hunter - Smart Debugging Assistant
Advanced AI-powered debugging tool that automatically identifies, analyzes, and suggests fixes for code issues.

### Key Capabilities
- **Automatic Bug Detection**: Scans code for potential issues and vulnerabilities
- **Root Cause Analysis**: Traces bugs to their source with detailed explanations
- **Fix Suggestions**: Provides specific code fixes and optimizations
- **Performance Analysis**: Identifies performance bottlenecks and memory leaks

### Language Support
- Full support for JavaScript, TypeScript, Python, Java, C#
- Framework-specific debugging for React, Angular, Django, Spring
- Database query optimization and SQL debugging
- API endpoint testing and validation

*Reduce debugging time by 70% with intelligent error analysis.*`,
        thumbnail: "https://images.unsplash.com/photo-1564094981303-3c8c1b52de79?w=400",
        tags: ["debugging", "error-analysis", "performance", "automation"],
        rating: 46,
        downloadCount: 1580,
        isFeatured: false,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-5",
        categoryId: "cat-1",
        name: "Neural Network Builder",
        slug: "neural-network-builder",
        subtitle: "Visual neural network design and training platform",
        description: `## Neural Network Builder - Visual AI Model Design
Build and train neural networks with an intuitive drag-and-drop interface, no coding required.

### Design Features
- **Visual Architecture**: Drag-and-drop neural network design
- **Pre-trained Models**: Access to popular model architectures (BERT, GPT, ResNet)
- **Training Pipeline**: Automated model training with progress monitoring
- **Hyperparameter Tuning**: Automatic optimization of training parameters

### Supported Networks
- Convolutional Neural Networks (CNNs) for image processing
- Recurrent Neural Networks (RNNs) for sequence data
- Transformer architectures for NLP tasks
- Generative Adversarial Networks (GANs) for content creation

### Use Cases
- Image classification and object detection
- Natural language processing and sentiment analysis
- Time series prediction and forecasting
- Creative AI applications and content generation

**Perfect for researchers, students, and AI enthusiasts.**`,
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        tags: ["neural-networks", "machine-learning", "visual-design", "education"],
        rating: 45,
        downloadCount: 1180,
        isFeatured: true,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-6",
        categoryId: "cat-2",
        name: "API Testing Suite",
        slug: "api-testing-suite",
        subtitle: "Comprehensive API testing and monitoring platform",
        description: `## API Testing Suite - Complete API Development Toolkit
Professional-grade tools for testing, monitoring, and documenting your APIs with advanced automation features.

### Testing Features
- **Automated Testing**: Schedule and run API tests continuously
- **Load Testing**: Simulate high-traffic scenarios with thousands of concurrent users
- **Security Testing**: Identify vulnerabilities and security flaws
- **Response Validation**: Verify API responses meet specifications

### Monitoring & Analytics
- **Real-time Monitoring**: Track API performance 24/7 with instant alerts
- **Uptime Tracking**: Monitor service availability across global regions
- **Performance Metrics**: Detailed analysis of response times and throughput
- **Custom Dashboards**: Create visualizations for stakeholders

### Documentation & Collaboration
- **Auto-generated Docs**: Create beautiful API documentation automatically
- **Interactive Examples**: Live code examples and API playground
- **Team Collaboration**: Share tests and results with your development team

*Essential for any team building or consuming APIs.*`,
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        tags: ["api-testing", "monitoring", "documentation", "security"],
        rating: 44,
        downloadCount: 967,
        isFeatured: false,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-7",
        categoryId: "cat-3",
        name: "Database Sync Pro",
        slug: "database-sync-pro",
        subtitle: "Multi-database synchronization MCP server",
        description: `## Database Sync Pro - Multi-Database MCP Server
Enterprise-grade MCP server for real-time synchronization across multiple database systems.

### Synchronization Features
- **Real-time Sync**: Instant data synchronization across databases
- **Conflict Resolution**: Intelligent handling of data conflicts
- **Schema Mapping**: Automatic schema transformation between databases
- **Incremental Updates**: Efficient delta synchronization to minimize bandwidth

### Supported Databases
- **SQL Databases**: PostgreSQL, MySQL, SQL Server, Oracle
- **NoSQL Systems**: MongoDB, CouchDB, DynamoDB, Cassandra
- **Cloud Platforms**: AWS RDS, Google Cloud SQL, Azure SQL Database
- **Data Warehouses**: Snowflake, BigQuery, Redshift

### Enterprise Features
- High availability with automatic failover
- End-to-end encryption for data security
- Audit trails and compliance reporting
- Multi-tenant architecture support

*Critical for businesses managing distributed data architectures.*`,
        thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
        tags: ["database", "synchronization", "enterprise", "mcp-server"],
        rating: 48,
        downloadCount: 743,
        isFeatured: false,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-8",
        categoryId: "cat-1",
        name: "Smart Refactor",
        slug: "smart-refactor",
        subtitle: "AI-powered code refactoring and optimization",
        description: `## Smart Refactor - Intelligent Code Optimization
Advanced AI tool that automatically refactors and optimizes your codebase for better performance, maintainability, and readability.

### Refactoring Capabilities
- **Code Smell Detection**: Identifies anti-patterns and code smells
- **Automatic Refactoring**: Safely transforms code while preserving functionality
- **Performance Optimization**: Optimizes algorithms and data structures
- **Design Pattern Application**: Suggests and applies appropriate design patterns

### Analysis Features
- **Complexity Analysis**: Measures cyclomatic complexity and technical debt
- **Dependency Analysis**: Visualizes and optimizes module dependencies
- **Security Scanning**: Identifies potential security vulnerabilities
- **Test Coverage**: Ensures refactoring doesn't break existing functionality

### Supported Languages
- Modern JavaScript/TypeScript with React, Vue, Angular support
- Python with Django, Flask, FastAPI frameworks
- Java with Spring Boot and enterprise patterns
- C# with .NET Core and modern C# features

**Transform legacy code into modern, maintainable software.**`,
        thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400",
        tags: ["refactoring", "optimization", "code-quality", "technical-debt"],
        rating: 47,
        downloadCount: 1320,
        isFeatured: false,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-9",
        categoryId: "cat-3",
        name: "Cloud Connect MCP",
        slug: "cloud-connect-mcp",
        subtitle: "Multi-cloud integration MCP server",
        description: `## Cloud Connect MCP - Multi-Cloud Integration Server
Comprehensive MCP server for seamless integration with major cloud platforms and services.

### Cloud Platform Support
- **AWS Services**: EC2, S3, Lambda, RDS, CloudWatch, and 50+ services
- **Google Cloud**: Compute Engine, Cloud Storage, BigQuery, AI Platform
- **Microsoft Azure**: Virtual Machines, Blob Storage, SQL Database, Cognitive Services
- **Multi-cloud Management**: Unified interface across all cloud providers

### Integration Features
- **Resource Management**: Create, monitor, and manage cloud resources
- **Cost Optimization**: Track spending and optimize cloud costs
- **Security Management**: Implement security best practices across clouds
- **Disaster Recovery**: Automated backup and recovery across regions

### Developer Tools
- Infrastructure as Code (IaC) generation
- Automated deployment pipelines
- Resource monitoring and alerting
- Cost analysis and optimization recommendations

*Essential for organizations with multi-cloud strategies.*`,
        thumbnail: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
        tags: ["cloud", "multi-cloud", "aws", "azure", "gcp"],
        rating: 46,
        downloadCount: 689,
        isFeatured: false,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-10",
        categoryId: "cat-2",
        name: "Performance Profiler",
        slug: "performance-profiler",
        subtitle: "Advanced application performance monitoring",
        description: `## Performance Profiler - Application Performance Monitoring
Professional application performance monitoring and optimization tool with AI-powered insights.

### Profiling Features
- **Real-time Monitoring**: Live performance metrics and bottleneck detection
- **Memory Analysis**: Memory leak detection and optimization suggestions
- **Database Profiling**: SQL query optimization and database performance
- **Network Analysis**: API call tracking and network latency monitoring

### AI-Powered Insights
- **Anomaly Detection**: Automatically identifies performance anomalies
- **Predictive Analysis**: Forecasts potential performance issues
- **Optimization Recommendations**: Specific suggestions for performance improvements
- **Root Cause Analysis**: Traces performance problems to their source

### Supported Platforms
- Web applications (React, Angular, Vue, vanilla JS)
- Backend services (Node.js, Python, Java, .NET)
- Mobile applications (React Native, Flutter)
- Microservices and containerized applications

**Optimize application performance with data-driven insights.**`,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        tags: ["performance", "monitoring", "profiling", "optimization"],
        rating: 45,
        downloadCount: 1045,
        isFeatured: false,
        isActive: true,
        author: "Rahmat Ullah",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Create sample blog categories
    const sampleBlogCategories = [
      {
        id: "blog-cat-1",
        name: "AI Development",
        slug: "ai-development",
        description: "Articles about AI development and best practices",
        sortOrder: 1,
        createdAt: new Date(),
      },
      {
        id: "blog-cat-2",
        name: "Tutorials",
        slug: "tutorials",
        description: "Step-by-step guides and tutorials",
        sortOrder: 2,
        createdAt: new Date(),
      },
    ];

    // Create sample blog posts
    const sampleBlogPosts = [
      {
        id: "blog-1",
        categoryId: "blog-cat-1",
        title: "Building Your First Claude Code Agent",
        slug: "building-first-claude-code-agent",
        content: "Learn how to create intelligent code agents using Claude AI for automated development tasks and code generation.",
        excerpt: "Learn how to create intelligent code agents using Claude AI for automated development tasks and code generation.",
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        tags: ["claude", "ai", "development"],
        authorId: "user-1",
        readTime: 5,
        isPublished: true,
        publishedAt: new Date("2024-12-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Store sample data
    sampleDomains.forEach(domain => this.domains.set(domain.id, domain));
    sampleCategories.forEach(category => this.categories.set(category.id, category));
    sampleProducts.forEach(product => this.products.set(product.id, product));
    sampleBlogCategories.forEach(category => this.blogCategories.set(category.id, category));
    sampleBlogPosts.forEach(post => this.blogPosts.set(post.id, post));
  }

  // User operations for local authentication
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values())
      .filter(domain => domain.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getDomain(idOrSlug: string): Promise<Domain | undefined> {
    return Array.from(this.domains.values()).find(
      domain => domain.id === idOrSlug || domain.slug === idOrSlug
    );
  }

  async createDomain(domainData: InsertDomain): Promise<Domain> {
    const id = randomUUID();
    const domain: Domain = {
      id,
      slug: domainData.slug,
      name: domainData.name,
      description: domainData.description || null,
      heroImage: domainData.heroImage || null,
      icon: domainData.icon || null,
      sortOrder: domainData.sortOrder || null,
      isActive: domainData.isActive ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.domains.set(id, domain);
    return domain;
  }

  async updateDomain(id: string, domainData: Partial<InsertDomain>): Promise<Domain> {
    const existing = this.domains.get(id);
    if (!existing) throw new Error("Domain not found");
    
    const updated: Domain = {
      ...existing,
      ...domainData,
      updatedAt: new Date(),
    };
    this.domains.set(id, updated);
    return updated;
  }

  async deleteDomain(id: string): Promise<void> {
    this.domains.delete(id);
  }

  // Category operations
  async getCategories(domainId?: string): Promise<Category[]> {
    let categories = Array.from(this.categories.values()).filter(cat => cat.isActive);
    if (domainId) {
      categories = categories.filter(cat => cat.domainId === domainId);
    }
    return categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getCategory(idOrSlug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      category => category.id === idOrSlug || category.slug === idOrSlug
    );
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      slug: categoryData.slug,
      name: categoryData.name,
      description: categoryData.description || null,
      domainId: categoryData.domainId,
      sortOrder: categoryData.sortOrder || null,
      isActive: categoryData.isActive ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error("Category not found");
    
    const updated: Category = {
      ...existing,
      ...categoryData,
      updatedAt: new Date(),
    };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  // Product operations
  async getProducts(categoryId?: string): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(prod => prod.isActive);
    if (categoryId) {
      products = products.filter(prod => prod.categoryId === categoryId);
    }
    return products.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(prod => prod.isActive && prod.isFeatured)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getProduct(idOrSlug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      product => product.id === idOrSlug || product.slug === idOrSlug
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product =>
      product.isActive && (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    );
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = randomUUID();
    // Auto-generate slug if not provided
    const slug = productData.slug || generateSlug(productData.name);
    
    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (Array.from(this.products.values()).some(p => p.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    const product: Product = {
      id,
      slug: uniqueSlug,
      name: productData.name,
      description: productData.description || null,
      categoryId: productData.categoryId,
      isActive: productData.isActive ?? null,
      subtitle: productData.subtitle || null,
      thumbnail: productData.thumbnail || null,
      tags: productData.tags || null,
      rating: productData.rating || null,
      downloadCount: productData.downloadCount || null,
      isFeatured: productData.isFeatured || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error("Product not found");
    
    const updated: Product = {
      ...existing,
      ...productData,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  // Attachment operations
  async getAttachments(productId: string): Promise<Attachment[]> {
    return Array.from(this.attachments.values()).filter(att => att.productId === productId);
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }

  async createAttachment(attachmentData: InsertAttachment): Promise<Attachment> {
    const id = randomUUID();
    const attachment: Attachment = {
      id,
      ...attachmentData,
      uploadedAt: new Date(),
    };
    this.attachments.set(id, attachment);
    return attachment;
  }

  async deleteAttachment(id: string): Promise<void> {
    this.attachments.delete(id);
  }

  // Blog operations
  async getBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values())
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getBlogCategory(idOrSlug: string): Promise<BlogCategory | undefined> {
    return Array.from(this.blogCategories.values()).find(
      category => category.id === idOrSlug || category.slug === idOrSlug
    );
  }

  async createBlogCategory(categoryData: InsertBlogCategory): Promise<BlogCategory> {
    const id = randomUUID();
    const category: BlogCategory = {
      id,
      slug: categoryData.slug,
      name: categoryData.name,
      description: categoryData.description || null,
      sortOrder: categoryData.sortOrder || null,
      createdAt: new Date(),
    };
    this.blogCategories.set(id, category);
    return category;
  }

  async updateBlogCategory(id: string, categoryData: Partial<InsertBlogCategory>): Promise<BlogCategory> {
    const existing = this.blogCategories.get(id);
    if (!existing) throw new Error("Blog category not found");
    
    const updated: BlogCategory = {
      ...existing,
      ...categoryData,
    };
    this.blogCategories.set(id, updated);
    return updated;
  }

  async deleteBlogCategory(id: string): Promise<void> {
    this.blogCategories.delete(id);
  }

  async getBlogPosts(categoryId?: string): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values()).filter(post => post.isPublished);
    if (categoryId) {
      posts = posts.filter(post => post.categoryId === categoryId);
    }
    return posts.sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
  }

  async getBlogPost(idOrSlug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      post => post.id === idOrSlug || post.slug === idOrSlug
    );
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      id,
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      categoryId: postData.categoryId,
      authorId: postData.authorId,
      tags: postData.tags || null,
      excerpt: postData.excerpt || null,
      coverImage: postData.coverImage || null,
      readTime: postData.readTime || null,
      isPublished: postData.isPublished || null,
      publishedAt: postData.publishedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, postData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existing = this.blogPosts.get(id);
    if (!existing) throw new Error("Blog post not found");
    
    const updated: BlogPost = {
      ...existing,
      ...postData,
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, updated);
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    this.blogPosts.delete(id);
  }

  // Navigation operations
  async getNavigationItems(): Promise<NavigationItem[]> {
    return Array.from(this.navigationItems.values())
      .sort((a, b) => a.position - b.position);
  }

  async getNavigationItem(id: string): Promise<NavigationItem | undefined> {
    return this.navigationItems.get(id);
  }

  async createNavigationItem(itemData: InsertNavigationItem): Promise<NavigationItem> {
    const id = randomUUID();
    const item: NavigationItem = {
      id,
      label: itemData.label,
      href: itemData.href,
      position: itemData.position || 0,
      isVisible: itemData.isVisible ?? true,
      icon: itemData.icon || null,
      description: itemData.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.navigationItems.set(id, item);
    return item;
  }

  async updateNavigationItem(id: string, itemData: Partial<InsertNavigationItem>): Promise<NavigationItem> {
    const existing = this.navigationItems.get(id);
    if (!existing) throw new Error("Navigation item not found");
    
    const updated: NavigationItem = {
      ...existing,
      ...itemData,
      updatedAt: new Date(),
    };
    this.navigationItems.set(id, updated);
    return updated;
  }

  async deleteNavigationItem(id: string): Promise<void> {
    this.navigationItems.delete(id);
  }

  async reorderNavigationItems(items: { id: string; position: number }[]): Promise<void> {
    for (const { id, position } of items) {
      const item = this.navigationItems.get(id);
      if (item) {
        item.position = position;
        item.updatedAt = new Date();
        this.navigationItems.set(id, item);
      }
    }
  }

  // Stats
  async getStats(): Promise<{ domains: number; categories: number; products: number; downloads: number; }> {
    const domains = Array.from(this.domains.values()).filter(d => d.isActive).length;
    const categories = Array.from(this.categories.values()).filter(c => c.isActive).length;
    const products = Array.from(this.products.values()).filter(p => p.isActive).length;
    const downloads = Array.from(this.products.values()).reduce((sum, p) => sum + (p.downloadCount || 0), 0);
    
    return { domains, categories, products, downloads };
  }
}

export const storage = new MemStorage();
