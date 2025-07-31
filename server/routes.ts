import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { getSession, requireAuth, requireAdmin, authenticateUser, hashPassword } from "./auth";
import { z } from "zod";
import { loginSchema, insertUserSchema, insertDomainSchema, insertCategorySchema, insertProductSchema, insertBlogCategorySchema, insertBlogPostSchema, insertNavigationItemSchema, UserRole, type User } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, `${name}-${timestamp}${ext}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      (req.session as any).userId = user.id;
      res.json({ user: { ...user, passwordHash: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req, res) => {
    const user = req.user!;
    // Remove password hash from response
    const userResponse = { ...user };
    delete (userResponse as any).passwordHash;
    res.json(userResponse);
  });

  // User management routes (Admin only)
  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.passwordHash);
      
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'user',
        isActive: userData.isActive !== false,
      });
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put('/api/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // If password is being updated, hash it
      if (updateData.passwordHash) {
        updateData.passwordHash = await hashPassword(updateData.passwordHash);
      }
      
      const user = await storage.updateUser(id, updateData);
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (req.user && req.user.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  // Public API routes

  // Stats endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Domain routes
  app.get('/api/domains', async (req, res) => {
    try {
      const domains = await storage.getDomains();
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  app.get('/api/domains/:slug', async (req, res) => {
    try {
      const domain = await storage.getDomain(req.params.slug);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      console.error("Error fetching domain:", error);
      res.status(500).json({ message: "Failed to fetch domain" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/domains/:domainId/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories(req.params.domainId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/categories/:categoryId/products', async (req, res) => {
    try {
      const products = await storage.getProducts(req.params.categoryId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get('/api/products/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get attachments for this product
      const attachments = await storage.getAttachments(product.id);
      
      res.json({ ...product, attachments });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Attachment download
  app.get('/api/attachments/:id/download', async (req, res) => {
    try {
      const attachment = await storage.getAttachment(req.params.id);
      if (!attachment) {
        return res.status(404).json({ message: "Attachment not found" });
      }

      const filePath = path.join(process.cwd(), attachment.url);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Type', attachment.mimeType);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ message: "Failed to download attachment" });
    }
  });

  // Get attachment content (for MD viewer)
  app.get('/api/attachments/:id', async (req, res) => {
    try {
      const attachment = await storage.getAttachment(req.params.id);
      if (!attachment) {
        return res.status(404).json({ message: "Attachment not found" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Error fetching attachment:", error);
      res.status(500).json({ message: "Failed to fetch attachment" });
    }
  });

  // Chatbot routes
  app.get('/api/chatbot/questions', async (req, res) => {
    try {
      const { predefinedQuestions } = await import('./chatbot');
      res.json({ questions: predefinedQuestions });
    } catch (error) {
      console.error("Error fetching predefined questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/chatbot/remaining/:deviceId', async (req, res) => {
    try {
      const { getRemainingQuestions } = await import('./chatbot');
      const remaining = await getRemainingQuestions(req.params.deviceId);
      res.json({ remaining });
    } catch (error) {
      console.error("Error checking remaining questions:", error);
      res.status(500).json({ message: "Failed to check remaining questions" });
    }
  });

  app.post('/api/chatbot/ask', async (req, res) => {
    try {
      const { question, deviceId } = req.body;
      
      if (!question || !deviceId) {
        return res.status(400).json({ message: "Question and deviceId are required" });
      }

      const { checkRateLimit, generateChatResponse } = await import('./chatbot');
      
      // Check rate limit
      const canAsk = await checkRateLimit(deviceId);
      if (!canAsk) {
        return res.status(429).json({ 
          message: "Daily question limit reached. You can ask 5 questions per day.",
          remaining: 0
        });
      }

      // Generate response
      const response = await generateChatResponse(question);
      
      // Save chat session
      await storage.createChatSession({
        deviceId,
        question,
        response,
      });

      // Get remaining questions
      const { getRemainingQuestions } = await import('./chatbot');
      const remaining = await getRemainingQuestions(deviceId);

      res.json({ response, remaining });
    } catch (error) {
      console.error("Error processing chat request:", error);
      res.status(500).json({ message: "Failed to process your question. Please try again." });
    }
  });

  // Blog routes
  app.get('/api/blog/categories', async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });

  app.get('/api/blog/posts', async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const posts = await storage.getBlogPosts(categoryId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/blog/posts/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Admin API routes (protected)

  // Domain admin routes
  app.post('/api/admin/domains', requireAdmin, async (req, res) => {
    try {
      const validation = insertDomainSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid domain data", errors: validation.error.errors });
      }
      
      const domain = await storage.createDomain(validation.data);
      res.status(201).json(domain);
    } catch (error) {
      console.error("Error creating domain:", error);
      res.status(500).json({ message: "Failed to create domain" });
    }
  });

  app.put('/api/admin/domains/:id', requireAdmin, async (req, res) => {
    try {
      const validation = insertDomainSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid domain data", errors: validation.error.errors });
      }
      
      const domain = await storage.updateDomain(req.params.id, validation.data);
      res.json(domain);
    } catch (error) {
      console.error("Error updating domain:", error);
      res.status(500).json({ message: "Failed to update domain" });
    }
  });

  app.delete('/api/admin/domains/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteDomain(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting domain:", error);
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });

  // Category admin routes
  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try {
      const validation = insertCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid category data", errors: validation.error.errors });
      }
      
      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const validation = insertCategorySchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid category data", errors: validation.error.errors });
      }
      
      const category = await storage.updateCategory(req.params.id, validation.data);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product admin routes
  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid product data", errors: validation.error.errors });
      }
      
      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const validation = insertProductSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid product data", errors: validation.error.errors });
      }
      
      const product = await storage.updateProduct(req.params.id, validation.data);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // File upload route
  app.post('/api/admin/products/:productId/attachments', requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Determine file type
      const isMarkdown = req.file.originalname.toLowerCase().endsWith('.md') || 
                        req.file.mimetype === 'text/markdown' ||
                        req.file.mimetype === 'text/x-markdown';
      const isPdf = req.file.mimetype === 'application/pdf';
      
      if (!isMarkdown && !isPdf) {
        return res.status(400).json({ message: "Only PDF and Markdown files are allowed" });
      }

      let content = null;
      const fileType = isMarkdown ? 'md' : 'pdf';
      
      // For MD files, read the content
      if (isMarkdown) {
        try {
          content = fs.readFileSync(req.file.path, 'utf8');
        } catch (error) {
          console.error("Error reading MD file:", error);
        }
      }

      const attachment = await storage.createAttachment({
        productId: req.params.productId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileType,
        size: req.file.size,
        url: `uploads/${req.file.filename}`,
        content,
      });

      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  app.delete('/api/admin/attachments/:id', requireAdmin, async (req, res) => {
    try {
      const attachment = await storage.getAttachment(req.params.id);
      if (attachment) {
        // Delete file from filesystem
        const filePath = path.join(process.cwd(), attachment.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteAttachment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Blog admin routes
  app.post('/api/admin/blog/categories', requireAdmin, async (req, res) => {
    try {
      const validation = insertBlogCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid blog category data", errors: validation.error.errors });
      }
      
      const category = await storage.createBlogCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating blog category:", error);
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });

  app.post('/api/admin/blog/posts', requireAdmin, async (req, res) => {
    try {
      const validation = insertBlogPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid blog post data", errors: validation.error.errors });
      }
      
      const post = await storage.createBlogPost(validation.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put('/api/admin/blog/posts/:id', requireAdmin, async (req, res) => {
    try {
      const validation = insertBlogPostSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid blog post data", errors: validation.error.errors });
      }
      
      const post = await storage.updateBlogPost(req.params.id, validation.data);
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // Navigation routes (Admin only)
  app.get('/api/navigation', async (req, res) => {
    try {
      const items = await storage.getNavigationItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching navigation items:", error);
      res.status(500).json({ message: "Failed to fetch navigation items" });
    }
  });

  app.post('/api/navigation', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNavigationItemSchema.parse(req.body);
      const item = await storage.createNavigationItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating navigation item:", error);
      res.status(400).json({ message: "Failed to create navigation item" });
    }
  });

  app.put('/api/navigation/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertNavigationItemSchema.partial().parse(req.body);
      const item = await storage.updateNavigationItem(id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating navigation item:", error);
      res.status(400).json({ message: "Failed to update navigation item" });
    }
  });

  app.delete('/api/navigation/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNavigationItem(id);
      res.json({ message: "Navigation item deleted successfully" });
    } catch (error) {
      console.error("Error deleting navigation item:", error);
      res.status(400).json({ message: "Failed to delete navigation item" });
    }
  });

  app.post('/api/navigation/reorder', requireAdmin, async (req, res) => {
    try {
      const { items } = req.body;
      await storage.reorderNavigationItems(items);
      res.json({ message: "Navigation items reordered successfully" });
    } catch (error) {
      console.error("Error reordering navigation items:", error);
      res.status(400).json({ message: "Failed to reorder navigation items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
