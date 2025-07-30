import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertDomainSchema, insertCategorySchema, insertProductSchema, insertBlogCategorySchema, insertBlogPostSchema } from "@shared/schema";

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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
  app.post('/api/admin/domains', isAuthenticated, async (req, res) => {
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

  app.put('/api/admin/domains/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/admin/domains/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDomain(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting domain:", error);
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });

  // Category admin routes
  app.post('/api/admin/categories', isAuthenticated, async (req, res) => {
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

  app.put('/api/admin/categories/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/admin/categories/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product admin routes
  app.post('/api/admin/products', isAuthenticated, async (req, res) => {
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

  app.put('/api/admin/products/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/admin/products/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // File upload route
  app.post('/api/admin/products/:productId/attachments', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const attachment = await storage.createAttachment({
        productId: req.params.productId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `uploads/${req.file.filename}`,
      });

      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  app.delete('/api/admin/attachments/:id', isAuthenticated, async (req, res) => {
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
  app.post('/api/admin/blog/categories', isAuthenticated, async (req, res) => {
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

  app.post('/api/admin/blog/posts', isAuthenticated, async (req, res) => {
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

  app.put('/api/admin/blog/posts/:id', isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
