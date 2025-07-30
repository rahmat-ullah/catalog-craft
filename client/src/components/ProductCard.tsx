import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rating = (product.rating || 0) / 10; // Convert to 5-star scale

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group glass-card card-hover cursor-pointer overflow-hidden h-full">
        {product.thumbnail && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            {product.tags && product.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.tags[0]}
              </Badge>
            )}
            {rating > 0 && (
              <div className="flex items-center text-yellow-500">
                <Star className="h-3 w-3 mr-1 fill-current" />
                <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {product.subtitle && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.subtitle}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Download className="h-3 w-3" />
              <span>{product.downloadCount || 0} downloads</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
