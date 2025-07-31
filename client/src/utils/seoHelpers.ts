// SEO utility functions for generating optimized content

export function generateSEOTitle(title: string, baseTitle = "AI Catalog Platform"): string {
  return title ? `${title} | ${baseTitle}` : `${baseTitle} - Discover the Best AI Tools & Resources`;
}

export function generateSEODescription(content: string, maxLength = 160): string {
  if (content.length <= maxLength) return content;
  
  // Find the last complete sentence within the limit
  const truncated = content.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // If no good sentence break, find last word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

export function generateKeywords(categories: string[], tags: string[], additionalKeywords: string[] = []): string {
  const baseKeywords = [
    'AI tools',
    'artificial intelligence',
    'machine learning',
    'development tools',
    'tech resources'
  ];
  
  const allKeywords = [
    ...baseKeywords,
    ...categories,
    ...tags,
    ...additionalKeywords
  ].filter(Boolean);
  
  // Remove duplicates and limit to reasonable number
  return [...new Set(allKeywords)].slice(0, 15).join(', ');
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}