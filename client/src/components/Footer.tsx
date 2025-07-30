import { Link } from "wouter";
import { Brain, Github, Twitter, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t glass-nav mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">AI Catalog</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Discover and explore the finest collection of Claude CLI agents, MCP servers, and AI development tools.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="glass h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="glass h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="glass h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
                  Claude CLI Agents
                </Link>
              </li>
              <li>
                <Link href="/mcp" className="text-muted-foreground hover:text-foreground transition-colors">
                  MCP Servers
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link href="/platforms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Platforms
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/code-generation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Code Generation
                </Link>
              </li>
              <li>
                <Link href="/category/data-analysis" className="text-muted-foreground hover:text-foreground transition-colors">
                  Data Analysis
                </Link>
              </li>
              <li>
                <Link href="/category/automation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Automation
                </Link>
              </li>
              <li>
                <Link href="/category/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Learn More</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/contribute" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contribute
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 AI Catalog. Built with{" "}
            <Heart className="h-3 w-3 text-red-500 inline mx-1" />
            for the AI community.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}