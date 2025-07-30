import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Domain() {
  const { slug } = useParams();
  
  const { data: domain, isLoading: domainLoading, error: domainError } = useQuery({
    queryKey: [`/api/domains/${slug}`],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: [`/api/domains/${domain?.id}/categories`],
    enabled: !!domain?.id,
  });

  if (domainLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (domainError || !domain) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Domain Not Found</h1>
                  <p className="text-muted-foreground">
                    The domain you're looking for doesn't exist or has been removed.
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
                <span className="font-medium">{domain.name}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Domain Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{domain.name}</h1>
            {domain.description && (
              <p className="text-xl text-muted-foreground max-w-3xl">
                {domain.description}
              </p>
            )}
          </div>

          {/* Categories Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Categories</h2>
            
            {categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📂</div>
                    <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
                    <p className="text-muted-foreground">
                      This domain doesn't have any categories yet. Check back later!
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
