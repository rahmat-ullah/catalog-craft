import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Category() {
  const { slug } = useParams();
  
  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: [`/api/categories/${slug}`],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/categories/${category?.id}/products`],
    enabled: !!category?.id,
  });

  if (categoryLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (categoryError || !category) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
                  <p className="text-muted-foreground">
                    The category you're looking for doesn't exist or has been removed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Domains</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/domain/${category.domainId}`}>Domain</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-medium">{category.name}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Category Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-muted-foreground max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          {/* Products Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Products</h2>
            
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                    <p className="text-muted-foreground">
                      This category doesn't have any products yet. Check back later!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
