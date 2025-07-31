import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertNavigationItemSchema } from "@shared/schema";
import type { NavigationItem, InsertNavigationItem } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Globe } from "lucide-react";
import * as Icons from "lucide-react";

// Available Lucide icons for navigation
const availableIcons = [
  "Home", "Globe", "Terminal", "Server", "Wrench", "BookOpen", "Code", "Database",
  "Settings", "Users", "Search", "Menu", "Calendar", "Mail", "Phone", "Map",
  "Heart", "Star", "Bookmark", "Share", "Download", "Upload", "File", "Folder"
];

const navigationFormSchema = insertNavigationItemSchema.extend({
  position: z.number().min(0).default(0),
});

type NavigationFormData = z.infer<typeof navigationFormSchema>;

export default function NavigationManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: navigationItems, isLoading } = useQuery({
    queryKey: ['/api/navigation'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertNavigationItem) => {
      return await apiRequest('/api/navigation', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Navigation item created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create navigation item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertNavigationItem> }) => {
      return await apiRequest(`/api/navigation/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Navigation item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update navigation item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/navigation/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
      toast({
        title: "Success",
        description: "Navigation item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete navigation item",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; position: number }[]) => {
      return await apiRequest('/api/navigation/reorder', 'POST', { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation'] });
      toast({
        title: "Success",
        description: "Navigation items reordered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reorder navigation items",
        variant: "destructive",
      });
    },
  });

  const createForm = useForm<NavigationFormData>({
    resolver: zodResolver(navigationFormSchema),
    defaultValues: {
      label: "",
      href: "",
      position: Array.isArray(navigationItems) ? navigationItems.length : 0,
      isVisible: true,
      icon: "Globe",
      description: "",
    },
  });

  const editForm = useForm<NavigationFormData>({
    resolver: zodResolver(navigationFormSchema),
  });

  const onCreateSubmit = (data: NavigationFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: NavigationFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    editForm.reset({
      label: item.label,
      href: item.href,
      position: item.position,
      isVisible: item.isVisible,
      icon: item.icon || "Globe",
      description: item.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleVisibility = (item: NavigationItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { isVisible: !item.isVisible }
    });
  };

  const moveItem = (item: NavigationItem, direction: 'up' | 'down') => {
    if (!Array.isArray(navigationItems)) return;
    
    const currentIndex = navigationItems.findIndex((nav: NavigationItem) => nav.id === item.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= navigationItems.length) return;
    
    const reorderedItems = navigationItems.map((nav: NavigationItem, index: number) => ({
      id: nav.id,
      position: index === currentIndex ? newIndex : 
                index === newIndex ? currentIndex :
                index
    }));
    
    reorderMutation.mutate(reorderedItems);
  };

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return <Globe className="h-4 w-4" />;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="p-6">Loading navigation items...</div>;
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigation Management</h1>
          <p className="text-muted-foreground">
            Manage navigation menu items that appear in the site header
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="h-4 w-4 mr-2" />
              Add Navigation Item
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-md">
            <DialogHeader>
              <DialogTitle>Create Navigation Item</DialogTitle>
              <DialogDescription>
                Add a new item to the navigation menu
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Home, About, Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="href"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Path</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., /, /about, /services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Globe"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center space-x-2">
                                {renderIcon(icon)}
                                <span>{icon}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of this page" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Visible</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show this item in the navigation menu
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {Array.isArray(navigationItems) && navigationItems.map((item: NavigationItem, index: number) => (
          <Card key={item.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveItem(item, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveItem(item, 'down')}
                        disabled={index === (Array.isArray(navigationItems) ? navigationItems.length - 1 : 0)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {renderIcon(item.icon)}
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.href}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant={item.isVisible ? "default" : "secondary"}>
                    Position {item.position}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility(item)}
                  >
                    {item.isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Navigation Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.label}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Navigation Item</DialogTitle>
            <DialogDescription>
              Update the navigation item details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same form fields as create form */}
              <FormField
                control={editForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Home, About, Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="href"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Path</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., /, /about, /services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "Globe"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableIcons.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center space-x-2">
                              {renderIcon(icon)}
                              <span>{icon}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of this page" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Visible</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Show this item in the navigation menu
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </Layout>
  );
}