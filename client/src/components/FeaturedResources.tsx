import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedResources() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 glass">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Resources</h2>
            <p className="text-xl text-muted-foreground">Trending and most popular AI tools and resources</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 glass">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Resources</h2>
          <p className="text-xl text-muted-foreground">Trending and most popular AI tools and resources</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
