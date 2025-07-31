import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Star, Download, Calendar, Tag, FileText, File, Eye } from "lucide-react";
import MarkdownViewer from "@/components/MarkdownViewer";
import { useState } from "react";

export default function Product() {
  const { slug } = useParams();
  const [viewerAttachment, setViewerAttachment] = useState<any>(null);

  // Simple markdown renderer (basic implementation)
  const renderMarkdown = (content: string) => {
    if (!content) return '';
    
    return content
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-6">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-6 text-sm"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1">$1. $2</li>')
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>')
      // Wrap in paragraphs
      .replace(/^(?!<[h|l|p|c])(.+)$/gm, '<p class="mb-4">$1</p>')
      // Clean up empty paragraphs
      .replace(/<p class="mb-4"><\/p>/g, '');
  };
  
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

  const rating = ((product as any)?.rating || 0) / 10; // Convert to 5-star scale

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
                <BreadcrumbLink href={`/category/${(product as any)?.categoryId}`}>Category</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-medium">{(product as any)?.name}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Image */}
              {(product as any)?.thumbnail && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl mb-8">
                  <img
                    src={(product as any).thumbnail}
                    alt={(product as any).name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {(product as any)?.tags && (product as any).tags.map((tag: any) => (
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
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{(product as any)?.name}</h1>
                
                {(product as any)?.subtitle && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {(product as any).subtitle}
                  </p>
                )}
              </div>

              {/* Product Description */}
              {(product as any)?.description && (
                <Card className="glass-card mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Description</h2>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <div 
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdown((product as any).description) 
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {(product as any)?.attachments && (product as any).attachments.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Downloads & Resources</h2>
                    <div className="space-y-4">
                      {(product as any).attachments.map((attachment: any) => {
                        const getFileIcon = (fileType: string) => {
                          return fileType === 'pdf' ? 
                            <File className="w-5 h-5 text-red-500" /> : 
                            <FileText className="w-5 h-5 text-blue-500" />;
                        };

                        const formatFileSize = (bytes: number) => {
                          if (bytes === 0) return '0 Bytes';
                          const k = 1024;
                          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                          const i = Math.floor(Math.log(bytes) / Math.log(k));
                          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                        };

                        return (
                          <div key={attachment.id} className="flex items-center justify-between p-6 glass-card rounded-xl border">
                            <div className="flex items-start gap-4">
                              {getFileIcon(attachment.fileType)}
                              <div>
                                <div className="font-semibold text-lg">{attachment.originalName}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {formatFileSize(attachment.size)} • {attachment.fileType?.toUpperCase()} File
                                </div>
                                {attachment.fileType === 'md' && attachment.content && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    Click "View" to read the markdown content
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {attachment.fileType === 'md' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewerAttachment(attachment)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                              )}
                              <Button asChild>
                                <a href={`/api/attachments/${attachment.id}/download`} download>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
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
                        <span className="font-medium">{(product as any)?.downloadCount || 0}</span>
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
                          {(product as any)?.createdAt ? new Date((product as any).createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Card */}
              {(product as any)?.tags && (product as any).tags.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {(product as any).tags.map((tag: any) => (
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

          {/* Markdown Viewer */}
          {viewerAttachment && (
            <MarkdownViewer
              attachment={viewerAttachment}
              open={!!viewerAttachment}
              onOpenChange={(open) => !open && setViewerAttachment(null)}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
