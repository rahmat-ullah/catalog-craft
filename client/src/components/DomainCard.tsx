import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Package } from "lucide-react";
import type { Domain } from "@shared/schema";

interface DomainCardProps {
  domain: Domain & {
    categoryCount?: number;
    productCount?: number;
    lastUpdated?: string;
  };
}

export default function DomainCard({ domain }: DomainCardProps) {
  const iconMap: { [key: string]: string } = {
    "fas fa-code": "💻",
    "fas fa-server": "🖥️",
    "fas fa-brain": "🧠",
    "fas fa-lightbulb": "💡",
    "fas fa-tools": "🔧",
    "fas fa-book-open": "📚",
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-yellow-500 to-orange-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Link href={`/domain/${domain.slug}`}>
      <Card className="group glass-card card-hover cursor-pointer h-full">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(domain.sortOrder || 0)} rounded-xl flex items-center justify-center mr-4 text-white text-xl`}>
              {iconMap[domain.icon || "fas fa-brain"] || "🧠"}
            </div>
            <div>
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {domain.name}
              </h3>
              <div className="text-sm text-muted-foreground">
                {domain.categoryCount || 0} Categories
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {domain.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Package className="h-3 w-3 mr-1" />
                {domain.productCount || 0} Resources
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {domain.lastUpdated || "Recently"}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
