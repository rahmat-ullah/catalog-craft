import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Domain from "@/pages/Domain";
import Category from "@/pages/Category";
import Product from "@/pages/Product";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminDomains from "@/pages/admin/Domains";
import AdminCategories from "@/pages/admin/Categories";
import AdminProducts from "@/pages/admin/Products";
import AdminBlogPosts from "@/pages/admin/BlogPosts";
import AdminUsers from "@/pages/admin/Users";
import AdminNavigation from "@/pages/admin/Navigation";
import Login from "@/pages/Login";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/domain/:slug" component={Domain} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/product/:slug" component={Product} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/domain/:slug" component={Domain} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/product/:slug" component={Product} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/domains" component={AdminDomains} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/blog" component={AdminBlogPosts} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/navigation" component={AdminNavigation} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
