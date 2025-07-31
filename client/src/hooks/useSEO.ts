import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  image?: string;
  type?: string;
  structuredData?: any;
}

export function useSEO(data: SEOData) {
  useEffect(() => {
    // Update page title
    if (data.title) {
      document.title = data.title;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update canonical link
    const updateCanonical = (url: string) => {
      let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      
      element.setAttribute('href', url);
    };

    // Update structured data
    const updateStructuredData = (data: any) => {
      const existingScript = document.querySelector('script[data-seo="page-structured-data"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'page-structured-data');
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // Apply SEO updates
    if (data.description) {
      updateMetaTag('description', data.description);
      updateMetaTag('og:description', data.description, true);
      updateMetaTag('twitter:description', data.description);
    }

    if (data.keywords) {
      updateMetaTag('keywords', data.keywords);
    }

    if (data.canonical) {
      updateCanonical(data.canonical);
      updateMetaTag('og:url', data.canonical, true);
      updateMetaTag('twitter:url', data.canonical);
    }

    if (data.title) {
      updateMetaTag('og:title', data.title, true);
      updateMetaTag('twitter:title', data.title);
    }

    if (data.image) {
      updateMetaTag('og:image', data.image, true);
      updateMetaTag('twitter:image', data.image);
    }

    if (data.type) {
      updateMetaTag('og:type', data.type, true);
    }

    if (data.structuredData) {
      updateStructuredData(data.structuredData);
    }

    // Cleanup function
    return () => {
      // Reset title to default if needed
      if (data.title && document.title === data.title) {
        document.title = 'AI Catalog Platform - Discover the Best AI Tools & Resources';
      }
    };
  }, [data]);
}

// SEO helper for generating page metadata
export function generatePageSEO(page: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  type?: string;
}): SEOData {
  const baseUrl = 'https://ai-catalog-platform.replit.app';
  const fullTitle = `${page.title} | AI Catalog Platform`;
  
  return {
    title: fullTitle,
    description: page.description,
    canonical: `${baseUrl}${page.path}`,
    keywords: page.keywords || 'AI tools, artificial intelligence, machine learning, development tools',
    image: `${baseUrl}/og-image.jpg`,
    type: page.type || 'website'
  };
}