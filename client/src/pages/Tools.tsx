import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Star, Download, Tag, ExternalLink } from "lucide-react";

export default function Tools() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Debug logging - remove these lines after testing
  // console.log("Products data:", products);
  // console.log("Products length:", products.length);
  // console.log("Categories data:", categories);

  // Filter products based on search and category
  const filteredProducts = (products as any[]).filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // console.log("Filtered products length:", filteredProducts.length);

  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Tools & Resources
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover cutting-edge AI tools, platforms, and resources to accelerate your development workflow and boost productivity.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tools, technologies, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Tools
                </Button>
                {(categories as any[]).map((category: any) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => {
                const rating = (product.rating || 0) / 10; // Convert to 5-star scale
                
                return (
                  <Card key={product.id} className="glass-card group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      {/* Product Image */}
                      {product.thumbnail && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          {product.subtitle && (
                            <p className="text-sm text-muted-foreground">
                              {product.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {product.description.replace(/[#*`\[\]]/g, '').substring(0, 120)}...
                          </p>
                        )}

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {product.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            {rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span>{rating.toFixed(1)}</span>
                              </div>
                            )}
                            {product.downloadCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                <span>{product.downloadCount}</span>
                              </div>
                            )}
                          </div>
                          {product.isFeatured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/product/${product.slug}`} className="flex-1">
                            <Button className="w-full" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Statistics */}
          <div className="mt-12 text-center">
            <Card className="glass-card inline-block">
              <CardContent className="p-6">
                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-2xl font-bold">{filteredProducts.length}</div>
                    <div className="text-sm text-muted-foreground">Tools Available</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {filteredProducts.reduce((sum: number, product: any) => sum + (product.downloadCount || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Downloads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{(categories as any[]).length}</div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}