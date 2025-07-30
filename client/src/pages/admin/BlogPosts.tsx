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
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlogPostSchema, type InsertBlogPost, type BlogPost } from "@shared/schema";
import { z } from "zod";

const blogPostFormSchema = insertBlogPostSchema.extend({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  tags: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

export default function AdminBlogPosts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: blogCategories } = useQuery({
    queryKey: ['/api/blog/categories'],
  });

  const { data: blogPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/blog/posts'],
  });

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImage: "",
      tags: "",
      authorId: "",
      readTime: 5,
      isPublished: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const payload = {
        ...data,
        authorId: user?.id || "system",
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        publishedAt: data.isPublished ? new Date().toISOString() : null,
      };
      delete (payload as any).tags;
      await apiRequest('POST', '/api/admin/blog/posts', { ...payload, tags: payload.tags || [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
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
        description: "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      if (!editingPost) throw new Error("No post selected");
      const payload = {
        ...data,
        authorId: editingPost.authorId,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        publishedAt: data.isPublished ? (editingPost.publishedAt || new Date().toISOString()) : null,
      };
      delete (payload as any).tags;
      await apiRequest('PUT', `/api/admin/blog/posts/${editingPost.id}`, { ...payload, tags: payload.tags || [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      setIsDialogOpen(false);
      setEditingPost(null);
      form.reset();
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
        description: "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
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
        description: "Failed to delete blog post",
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

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    form.reset({
      categoryId: post.categoryId,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      tags: post.tags?.join(', ') || "",
      authorId: post.authorId,
      readTime: post.readTime || 5,
      isPublished: post.isPublished || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deleteMutation.mutate(post.id);
    }
  };

  const onSubmit = (data: BlogPostFormData) => {
    if (editingPost) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
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
              <h1 className="text-4xl font-bold mb-2">Manage Blog Posts</h1>
              <p className="text-muted-foreground">
                Create and manage blog posts to share insights and tutorials
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="gradient-bg"
                  onClick={() => {
                    setEditingPost(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
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
                          {blogCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...form.register('title')}
                        placeholder="Building Your First Claude Code Agent"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        {...form.register('slug')}
                        placeholder="building-first-claude-code-agent"
                      />
                      {form.formState.errors.slug && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.slug.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="readTime">Read Time (minutes)</Label>
                      <Input
                        id="readTime"
                        type="number"
                        min="1"
                        {...form.register('readTime', { valueAsNumber: true })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      {...form.register('excerpt')}
                      placeholder="Learn how to create intelligent code agents using Claude AI..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      {...form.register('content')}
                      placeholder="Write your blog post content here..."
                      rows={12}
                      className="font-mono"
                    />
                    {form.formState.errors.content && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.content.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coverImage">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        {...form.register('coverImage')}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        {...form.register('tags')}
                        placeholder="claude, ai, development"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublished"
                        checked={form.watch('isPublished')}
                        onCheckedChange={(checked) => form.setValue('isPublished', checked)}
                      />
                      <Label htmlFor="isPublished">Published</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      {editingPost ? 'Update' : 'Create'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Blog Posts Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : blogPosts && blogPosts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {post.coverImage && (
                              <img 
                                src={post.coverImage} 
                                alt={post.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium line-clamp-1">{post.title}</div>
                              {post.excerpt && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {post.excerpt}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.categoryId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.isPublished ? "default" : "secondary"}>
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.publishedAt ? (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {post.isPublished && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(post)}
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
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
                  <p className="text-muted-foreground">
                    Create your first blog post to start sharing insights.
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
