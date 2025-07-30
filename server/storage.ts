import {
  users,
  domains,
  categories,
  products,
  attachments,
  blogCategories,
  blogPosts,
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
} from "@shared/schema";
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

  constructor() {
    this.initializeSampleData();
    this.initializeDefaultAdmin();
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
        name: "Debugging Tools",
        slug: "debugging-tools",
        description: "AI-powered debugging and error analysis",
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
        description: "Advanced code generation and debugging assistant powered by Claude AI for multiple programming languages.",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        tags: ["code-generation", "debugging", "ai-assistant"],
        rating: 49,
        downloadCount: 1200,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-2",
        categoryId: "cat-3",
        name: "Data Integration Hub",
        slug: "data-integration-hub",
        subtitle: "High-performance MCP server for real-time data integration",
        description: "High-performance MCP server for real-time data integration with external APIs and databases.",
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        tags: ["mcp-server", "data-integration", "api"],
        rating: 47,
        downloadCount: 856,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
    const product: Product = {
      id,
      slug: productData.slug,
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
