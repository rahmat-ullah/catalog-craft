import { Button } from "@/components/ui/button";
import { Rocket, Book } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
            Discover AI Resources & Tools
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore curated collections of Claude Code agents, MCP servers, AI platforms, and cutting-edge tools for developers and enthusiasts.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/">
            <Button size="lg" className="gradient-bg">
              <Rocket className="h-4 w-4 mr-2" />
              Explore Domains
            </Button>
          </Link>
          <Link href="/blog">
            <Button size="lg" variant="outline" className="glass">
              <Book className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="glass-card p-6">
              <div className="text-3xl font-bold text-primary">{stats.domains}</div>
              <div className="text-muted-foreground">Domains</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl font-bold text-primary">{stats.categories}</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl font-bold text-primary">{stats.products}</div>
              <div className="text-muted-foreground">Resources</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl font-bold text-primary">{Math.round(stats.downloads / 1000 * 10) / 10}k</div>
              <div className="text-muted-foreground">Downloads</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
