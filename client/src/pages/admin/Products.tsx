import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Upload, Star, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product, type Attachment } from "@shared/schema";
import { z } from "zod";
import FileUpload from "@/components/FileUpload";

const productFormSchema = insertProductSchema.extend({
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function AdminProducts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false);

  const { data: domains } = useQuery({
    queryKey: ['/api/domains'],
  });

  const { data: allCategories } = useQuery({
    queryKey: ['/api/domains', 'categories'],
    queryFn: async () => {
      if (!domains) return [];
      const categoriesPromises = (domains as any[]).map(async (domain: any) => {
        const response = await fetch(`/api/domains/${domain.id}/categories`);
        const domainCategories = await response.json();
        return domainCategories.map((cat: any) => ({ 
          ...cat, 
          domainName: domain.name,
          displayName: `${domain.name} > ${cat.name}`
        }));
      });
      const allCategories = await Promise.all(categoriesPromises);
      return allCategories.flat();
    },
    enabled: !!domains,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', 'all'],
    queryFn: async () => {
      if (!allCategories) return [];
      const productsPromises = allCategories.map(async (category: any) => {
        const response = await fetch(`/api/categories/${category.id}/products`);
        const categoryProducts = await response.json();
        return categoryProducts.map((prod: any) => ({ 
          ...prod, 
          categoryName: category.name,
          domainName: category.domainName
        }));
      });
      const allProducts = await Promise.all(productsPromises);
      return allProducts.flat();
    },
    enabled: !!allCategories,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      slug: "",
      subtitle: "",
      description: "",
      thumbnail: "",
      author: "Rahmat Ullah",
      tags: "",
      rating: 0,
      downloadCount: 0,
      isFeatured: false,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };
      delete (payload as any).tags;
      await apiRequest('POST', '/api/admin/products', { ...payload, tags: payload.tags || [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      resetForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!editingProduct) throw new Error("No product selected");
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };
      delete (payload as any).tags;
      await apiRequest('PUT', `/api/admin/products/${editingProduct.id}`, { ...payload, tags: payload.tags || [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      resetForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    form.reset({
      categoryId: product.categoryId,
      name: product.name,
      subtitle: product.subtitle || "",
      description: product.description || "",
      thumbnail: product.thumbnail || "",
      author: ((product as any).author) || "Rahmat Ullah",
      tags: product.tags?.join(', ') || "",
      rating: product.rating || 0,
      downloadCount: product.downloadCount || 0,
      isFeatured: product.isFeatured || false,
      isActive: product.isActive ?? true,
    });
    
    // Fetch attachments for this product
    try {
      const response = await fetch(`/api/products/${product.slug}`);
      if (response.ok) {
        const productWithAttachments = await response.json();
        setAttachments(productWithAttachments.attachments || []);
      }
    } catch (error) {
      console.error("Error fetching product attachments:", error);
      setAttachments([]);
    }
    
    setIsDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const resetForm = () => {
    form.reset({
      categoryId: "",
      name: "",
      slug: "",
      subtitle: "",
      description: "",
      thumbnail: "",
      author: "Rahmat Ullah",
      tags: "",
      rating: 0,
      downloadCount: 0,
      isFeatured: false,
      isActive: true,
    });
    setAttachments([]);
    setEditingProduct(null);
    setIsDialogOpen(false);
    setShowDescriptionPreview(false);
  };

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

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Products</h1>
              <p className="text-muted-foreground">
                Add and manage AI resources and tools in your catalog
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="gradient-bg"
                  onClick={() => {
                    setEditingProduct(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoryId">Category</Label>
                      <Select onValueChange={(value) => form.setValue('categoryId', value)} value={form.watch('categoryId')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {(category as any).displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.categoryId && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.categoryId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...form.register('name')}
                        placeholder="Claude Dev Assistant"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        {...form.register('subtitle')}
                        placeholder="Advanced code generation assistant"
                      />
                    </div>

                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        {...form.register('author')}
                        placeholder="Rahmat Ullah"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Slug will be auto-generated from the product name
                  </p>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="description">Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {showDescriptionPreview ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Supports Markdown formatting (headings, lists, links, **bold**, *italic*, etc.)
                    </p>
                    
                    {showDescriptionPreview ? (
                      <div className="min-h-[200px] p-4 border rounded-md bg-background">
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                          <div 
                            className="text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: renderMarkdown(form.watch('description') || '') 
                            }}
                          />
                        </div>
                        {!form.watch('description') && (
                          <p className="text-muted-foreground italic">Enter description to see preview...</p>
                        )}
                      </div>
                    ) : (
                      <Textarea
                        id="description"
                        {...form.register('description')}
                        placeholder="## Overview
Advanced code generation and debugging assistant powered by Claude AI.

### Features
- **Intelligent Code Generation**: Creates high-quality code from natural language
- **Bug Detection**: Identifies and fixes issues automatically
- **Multi-language Support**: Works with Python, JavaScript, TypeScript, and more

[Learn more](https://example.com) about our AI-powered development tools."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="thumbnail">Thumbnail URL</Label>
                      <Input
                        id="thumbnail"
                        {...form.register('thumbnail')}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        {...form.register('tags')}
                        placeholder="code-generation, debugging, ai-assistant"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rating">Rating (0-50)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="50"
                        {...form.register('rating', { valueAsNumber: true })}
                        placeholder="45"
                      />
                    </div>

                    <div>
                      <Label htmlFor="downloadCount">Download Count</Label>
                      <Input
                        id="downloadCount"
                        type="number"
                        min="0"
                        {...form.register('downloadCount', { valueAsNumber: true })}
                        placeholder="1200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={form.watch('isFeatured') || false}
                        onCheckedChange={(checked) => form.setValue('isFeatured', checked)}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={form.watch('isActive') || false}
                        onCheckedChange={(checked) => form.setValue('isActive', checked)}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold">File Attachments</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      {editingProduct 
                        ? "Upload PDF and Markdown files for this product"
                        : "You can upload files after creating the product"
                      }
                    </p>
                    
                    {editingProduct ? (
                      <FileUpload
                        productId={editingProduct.id}
                        attachments={attachments}
                        onAttachmentsChange={setAttachments}
                      />
                    ) : (
                      <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          File uploads will be available after creating the product
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      {editingProduct ? 'Update' : 'Create'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Products Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.thumbnail && (
                              <img 
                                src={product.thumbnail} 
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.subtitle && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {product.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline">{(product as any).categoryName}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {(product as any).domainName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {((product as any).author) || "Rahmat Ullah"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.rating ? (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                              <span>{(product.rating / 10).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{product.downloadCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {product.isFeatured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(product)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                  <p className="text-muted-foreground">
                    Create your first product to start building your catalog.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
