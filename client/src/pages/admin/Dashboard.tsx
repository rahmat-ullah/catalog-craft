import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Package, 
  FolderOpen, 
  FileText, 
  Download, 
  TrendingUp,
  Settings,
  Plus,
  Navigation
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
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

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your AI catalog content and monitor platform statistics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (stats as any)?.domains || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Organized collections
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (stats as any)?.categories || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Resource categories
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (stats as any)?.products || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available resources
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : `${Math.round(((stats as any)?.downloads || 0) / 1000 * 10) / 10}k`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total downloads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Manage Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and organize your resource domains
                </p>
                <div className="flex gap-2">
                  <Link href="/admin/domains">
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Link href="/admin/domains">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Domain
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Manage Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Organize your resources into categories
                </p>
                <div className="flex gap-2">
                  <Link href="/admin/categories">
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Link href="/admin/categories">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Category
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Manage Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Add and manage your AI resources and tools
                </p>
                <div className="flex gap-2">
                  <Link href="/admin/products">
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Link href="/admin/products">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Product
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create and manage user accounts with different roles
                </p>
                <div className="flex gap-2">
                  <Link href="/admin/users">
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New User
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage site navigation menu items dynamically
                </p>
                <div className="flex gap-2">
                  <Link href="/admin/navigation">
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Link href="/admin/navigation">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Item
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blog Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Blog Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create and manage blog posts to share insights and tutorials
              </p>
              <Link href="/admin/blog">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Blog Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
