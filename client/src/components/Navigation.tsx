import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Search, Moon, Sun, Menu, X, Brain, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AI Catalog</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`transition-colors ${location === '/' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
              Domains
            </Link>
            <Link href="/agents" className={`transition-colors ${location === '/agents' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
              CLI Agents
            </Link>
            <Link href="/mcp" className={`transition-colors ${location === '/mcp' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
              MCP Servers
            </Link>
            <Link href="/tools" className={`transition-colors ${location === '/tools' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
              Tools
            </Link>
            <Link href="/blog" className={`transition-colors ${location === '/blog' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
              Blog
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 glass"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="glass"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.firstName && <p className="font-medium">{user.firstName} {user.lastName}</p>}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="gradient-bg">
                  <User className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 glass"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            
            <div className="flex flex-col space-y-2">
              <Link href="/" className="block py-2 text-foreground/70 hover:text-foreground">
                Domains
              </Link>
              <Link href="/agents" className="block py-2 text-foreground/70 hover:text-foreground">
                CLI Agents
              </Link>
              <Link href="/mcp" className="block py-2 text-foreground/70 hover:text-foreground">
                MCP Servers
              </Link>
              <Link href="/tools" className="block py-2 text-foreground/70 hover:text-foreground">
                Tools
              </Link>
              <Link href="/blog" className="block py-2 text-foreground/70 hover:text-foreground">
                Blog
              </Link>
              
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="glass"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <Link href="/admin">
                      <Button variant="outline" size="sm">Admin</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/api/logout'}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => window.location.href = '/api/login'} className="gradient-bg" size="sm">
                    Admin Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
