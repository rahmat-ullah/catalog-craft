import { Button } from "@/components/ui/button";
import { Rocket, Book, Zap, Terminal, Server, Bot } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/10 rounded-full animate-bounce delay-100"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-500/10 rounded-full animate-ping delay-200"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-1/4 animate-float">
          <Terminal className="h-8 w-8 text-blue-500/30" />
        </div>
        <div className="absolute top-48 left-1/4 animate-float-delayed">
          <Server className="h-6 w-6 text-purple-500/30" />
        </div>
        <div className="absolute bottom-32 right-1/3 animate-float-slow">
          <Bot className="h-10 w-10 text-green-500/30" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <div className="mb-4 animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-600 dark:text-blue-400 border border-blue-200/20">
              <Zap className="h-4 w-4 mr-2" />
              Discover the Future of AI Development
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient leading-tight animate-slide-up">
            <span className="block">Unleash the Power</span>
            <span className="block">of AI Agents</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto animate-slide-up delay-100">
            Explore curated collections of{' '}
            <span className={`inline-block transition-all duration-500 ${animationPhase === 0 ? 'text-blue-500 font-semibold scale-110' : ''}`}>
              Claude CLI agents
            </span>
            ,{' '}
            <span className={`inline-block transition-all duration-500 ${animationPhase === 1 ? 'text-purple-500 font-semibold scale-110' : ''}`}>
              MCP servers
            </span>
            , and{' '}
            <span className={`inline-block transition-all duration-500 ${animationPhase === 2 ? 'text-green-500 font-semibold scale-110' : ''}`}>
              AI platforms
            </span>
            {' '}for developers and enthusiasts.
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
