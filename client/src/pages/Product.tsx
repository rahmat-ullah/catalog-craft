import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Star, Download, Calendar, Tag } from "lucide-react";

export default function Product() {
  const { slug } = useParams();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${slug}`],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-6 w-64 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 mb-8" />
                <Skeleton className="h-8 w-96 mb-4" />
                <Skeleton className="h-6 w-full mb-8" />
              </div>
              <div>
                <Skeleton className="h-32 mb-4" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                  <p className="text-muted-foreground">
                    The product you're looking for doesn't exist or has been removed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const rating = (product.rating || 0) / 10; // Convert to 5-star scale

  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Domains</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/category/${product.categoryId}`}>Category</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-medium">{product.name}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Image */}
              {product.thumbnail && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl mb-8">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {product.tags && product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {rating > 0 && (
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
                
                {product.subtitle && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Product Description */}
              {product.description && (
                <Card className="glass-card mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Description</h2>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {product.attachments && product.attachments.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Downloads</h2>
                    <div className="space-y-3">
                      {product.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-4 glass rounded-lg">
                          <div>
                            <div className="font-medium">{attachment.originalName}</div>
                            <div className="text-sm text-muted-foreground">
                              {(attachment.size / 1024 / 1024).toFixed(1)} MB • {attachment.mimeType}
                            </div>
                          </div>
                          <Button asChild size="sm">
                            <a href={`/api/attachments/${attachment.id}/download`} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Downloads</span>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        <span className="font-medium">{product.downloadCount || 0}</span>
                      </div>
                    </div>
                    {rating > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                          <span className="font-medium">{rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Card */}
              {product.tags && product.tags.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
