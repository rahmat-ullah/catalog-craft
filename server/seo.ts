import { storage } from "./storage";

// Generate dynamic sitemap
export async function generateSitemap(): Promise<string> {
  try {
    const domains = await storage.getDomains();
    const categories = await storage.getCategories();
    const products = await storage.getProducts();
    const blogPosts = await storage.getBlogPosts();

    const baseUrl = "https://ai-catalog-platform.replit.app";
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/tools</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add domain pages
    domains.forEach(domain => {
      sitemap += `
  <url>
    <loc>${baseUrl}/domain/${domain.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add category pages
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add product pages
    products.forEach(product => {
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add blog posts
    blogPosts.forEach(post => {
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt ? post.updatedAt.toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ai-catalog-platform.replit.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}

// Generate structured data for products
export function generateProductStructuredData(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": product.name,
    "description": product.description,
    "url": `https://ai-catalog-platform.replit.app/product/${product.slug}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": product.author || "AI Catalog Platform"
    },
    "datePublished": product.createdAt?.toISOString(),
    "dateModified": product.updatedAt?.toISOString()
  };
}

// Generate structured data for blog posts
export function generateBlogPostStructuredData(post: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": `https://ai-catalog-platform.replit.app/blog/${post.slug}`,
    "datePublished": post.createdAt?.toISOString(),
    "dateModified": post.updatedAt?.toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author || "AI Catalog Platform"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Catalog Platform",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ai-catalog-platform.replit.app/logo.png"
      }
    }
  };
}

// Generate page metadata
export function generatePageMetadata(page: {
  title: string;
  description: string;
  canonical?: string;
  type?: string;
}) {
  const baseTitle = "AI Catalog Platform";
  const fullTitle = page.title ? `${page.title} | ${baseTitle}` : `${baseTitle} - Discover the Best AI Tools & Resources`;
  
  return {
    title: fullTitle,
    description: page.description,
    canonical: page.canonical || "https://ai-catalog-platform.replit.app",
    openGraph: {
      title: fullTitle,
      description: page.description,
      url: page.canonical || "https://ai-catalog-platform.replit.app",
      type: page.type || "website",
      image: "https://ai-catalog-platform.replit.app/og-image.jpg",
      siteName: "AI Catalog Platform"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      image: "https://ai-catalog-platform.replit.app/og-image.jpg"
    }
  };
}