import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package } from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category & {
    productCount?: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group glass-card card-hover cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-primary" />
          </div>
          
          {category.description && (
            <p className="text-muted-foreground mb-4 text-sm">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Package className="h-3 w-3 mr-1" />
            {category.productCount || 0} Resources
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
