import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Search, Moon, Sun, Menu, X, Brain, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as Icons from "lucide-react";

function DynamicNavigation({ 
  location, 
  isMobile = false, 
  onMobileClick 
}: { 
  location: string; 
  isMobile?: boolean;
  onMobileClick?: () => void;
}) {
  const { data: navItems } = useQuery({
    queryKey: ['/api/navigation'],
  });

  if (!navItems || !Array.isArray(navItems)) return null;

  const baseClasses = isMobile 
    ? "block py-3 px-2 text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
    : "transition-colors hover:text-foreground";

  return (
    <>
      {navItems
        .filter((item: any) => item.isVisible)
        .map((item: any) => {
          const IconComponent = item.icon ? (Icons as any)[item.icon] : null;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={isMobile ? baseClasses : `transition-colors ${
                location === item.href
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
              onClick={onMobileClick}
            >
              {isMobile && IconComponent ? (
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              ) : (
                item.label
              )}
            </Link>
          );
        })}
    </>
  );
}

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
          <div className="hidden lg:flex items-center space-x-8">
            <DynamicNavigation location={location} />

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 xl:w-72 pl-10 glass"
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
                      <AvatarImage src={(user as any)?.profileImageUrl || ""} alt={(user as any)?.firstName || ""} />
                      <AvatarFallback>
                        {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {(user as any)?.firstName && <p className="font-medium">{(user as any).firstName} {(user as any).lastName}</p>}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {(user as any)?.email}
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

          {/* Tablet/Mobile Navigation - shows theme toggle and hamburger */}
          <div className="flex items-center space-x-2 lg:hidden">
            {/* Theme Toggle for tablet/mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="glass w-9 h-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Slide-out Menu */}
            <div className="fixed top-16 left-0 right-0 z-50 glass-nav border-b border-t shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Search */}
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
                
                {/* Navigation Links */}
                <div className="space-y-1">
                  <DynamicNavigation 
                    location={location} 
                    isMobile={true}
                    onMobileClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
                
                {/* User Actions */}
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={(user as any)?.profileImageUrl || ""} alt={(user as any)?.firstName || ""} />
                          <AvatarFallback>
                            {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {(user as any)?.firstName && (
                            <p className="font-medium text-sm">{(user as any).firstName} {(user as any).lastName}</p>
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            {(user as any)?.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              await fetch('/api/auth/logout', { method: 'POST' });
                              window.location.href = '/';
                            } catch (error) {
                              console.error('Logout failed:', error);
                            }
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="gradient-bg w-full">
                        <User className="h-4 w-4 mr-2" />
                        Admin Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}