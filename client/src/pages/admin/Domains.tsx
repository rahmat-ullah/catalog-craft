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
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDomainSchema, type InsertDomain, type Domain } from "@shared/schema";
import { z } from "zod";

const domainFormSchema = insertDomainSchema.extend({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

type DomainFormData = z.infer<typeof domainFormSchema>;

export default function AdminDomains() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['/api/domains'],
  });

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "fas fa-brain",
      sortOrder: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DomainFormData) => {
      await apiRequest('POST', '/api/admin/domains', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "Success",
        description: "Domain created successfully",
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
        description: "Failed to create domain",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DomainFormData) => {
      if (!editingDomain) throw new Error("No domain selected");
      await apiRequest('PUT', `/api/admin/domains/${editingDomain.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "Success",
        description: "Domain updated successfully",
      });
      setIsDialogOpen(false);
      setEditingDomain(null);
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
        description: "Failed to update domain",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/domains/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "Success",
        description: "Domain deleted successfully",
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
        description: "Failed to delete domain",
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

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    form.reset({
      name: domain.name,
      slug: domain.slug,
      description: domain.description || "",
      icon: domain.icon || "fas fa-brain",
      sortOrder: domain.sortOrder || 0,
      isActive: domain.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (domain: Domain) => {
    if (confirm(`Are you sure you want to delete "${domain.name}"?`)) {
      deleteMutation.mutate(domain.id);
    }
  };

  const onSubmit = (data: DomainFormData) => {
    if (editingDomain) {
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
              <h1 className="text-4xl font-bold mb-2">Manage Domains</h1>
              <p className="text-muted-foreground">
                Create and manage resource domains for your catalog
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="gradient-bg"
                  onClick={() => {
                    setEditingDomain(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Domain
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDomain ? 'Edit Domain' : 'Create New Domain'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="AI Platforms"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      placeholder="ai-platforms"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Comprehensive AI platforms including chat interfaces..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon Class</Label>
                    <Input
                      id="icon"
                      {...form.register('icon')}
                      placeholder="fas fa-brain"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      {...form.register('sortOrder', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={form.watch('isActive')}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      {editingDomain ? 'Update' : 'Create'}
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

          {/* Domains Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Domains</CardTitle>
            </CardHeader>
            <CardContent>
              {domainsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : domains && domains.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{domain.name}</div>
                            {domain.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {domain.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {domain.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={domain.isActive ? "default" : "secondary"}>
                            {domain.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{domain.sortOrder || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/domain/${domain.slug}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(domain)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(domain)}
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
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="text-lg font-semibold mb-2">No Domains Yet</h3>
                  <p className="text-muted-foreground">
                    Create your first domain to start organizing your resources.
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
