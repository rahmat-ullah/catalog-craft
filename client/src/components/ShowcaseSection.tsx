import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Server, Bot, Code, Database, Globe, ArrowRight, ExternalLink, Star } from "lucide-react";
import { Link } from "wouter";

const showcaseItems = [
  {
    category: "Claude CLI Agents",
    icon: Terminal,
    gradient: "from-blue-500 to-cyan-500",
    items: [
      {
        name: "Claude Code Assistant",
        description: "Intelligent code generation and debugging agent that understands context and provides optimized solutions.",
        tags: ["TypeScript", "Python", "Debugging"],
        stars: 1247,
        link: "/product/claude-code-assistant"
      },
      {
        name: "Claude DevOps Agent",
        description: "Automates deployment pipelines, monitors infrastructure, and manages cloud resources with intelligent decision-making.",
        tags: ["DevOps", "CI/CD", "Cloud"],
        stars: 892,
        link: "/product/claude-devops-agent"
      },
      {
        name: "Claude Data Analyst",
        description: "Processes large datasets, generates insights, and creates visualizations with natural language queries.",
        tags: ["Data Science", "Analytics", "Visualization"],
        stars: 1034,
        link: "/product/claude-data-analyst"
      }
    ]
  },
  {
    category: "MCP Servers",
    icon: Server,
    gradient: "from-purple-500 to-pink-500",
    items: [
      {
        name: "Git MCP Server",
        description: "Provides comprehensive Git operations, repository management, and version control through MCP protocol.",
        tags: ["Git", "Version Control", "MCP"],
        stars: 756,
        link: "/product/git-mcp-server"
      },
      {
        name: "Database MCP Server",
        description: "Universal database connector supporting PostgreSQL, MySQL, MongoDB with query optimization.",
        tags: ["Database", "SQL", "NoSQL"],
        stars: 623,
        link: "/product/database-mcp-server"
      },
      {
        name: "File System MCP",
        description: "Secure file system operations with advanced search, manipulation, and organization capabilities.",
        tags: ["File System", "Search", "Organization"],
        stars: 489,
        link: "/product/filesystem-mcp"
      }
    ]
  },
  {
    category: "AI Development Tools",
    icon: Bot,
    gradient: "from-green-500 to-emerald-500",
    items: [
      {
        name: "Claude API Toolkit",
        description: "Complete SDK and utilities for integrating Claude AI into your applications with ease.",
        tags: ["SDK", "API", "Integration"],
        stars: 2156,
        link: "/product/claude-api-toolkit"
      },
      {
        name: "Prompt Engineering Studio",
        description: "Visual tool for designing, testing, and optimizing prompts with real-time performance metrics.",
        tags: ["Prompt Engineering", "Testing", "Optimization"],
        stars: 1687,
        link: "/product/prompt-engineering-studio"
      },
      {
        name: "Claude Training Suite",
        description: "Framework for fine-tuning and customizing Claude models for specific use cases and domains.",
        tags: ["Training", "Fine-tuning", "Customization"],
        stars: 834,
        link: "/product/claude-training-suite"
      }
    ]
  }
];

export default function ShowcaseSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Featured AI Resources
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the most popular and innovative Claude agents, MCP servers, and AI development tools used by thousands of developers worldwide.
          </p>
        </div>

        <div className="space-y-12">
          {showcaseItems.map((section, sectionIndex) => {
            const IconComponent = section.icon;
            return (
              <div key={section.category} className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${section.gradient} flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{section.category}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item, itemIndex) => (
                    <Card key={item.name} className="glass-card group hover:scale-[1.02] transition-all duration-300 border-0">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {item.name}
                          </CardTitle>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.stars}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Link href={item.link}>
                            <Button variant="ghost" size="sm" className="group/btn">
                              Learn More
                              <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg" className="gradient-bg">
              <Globe className="h-4 w-4 mr-2" />
              Explore All Resources
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}