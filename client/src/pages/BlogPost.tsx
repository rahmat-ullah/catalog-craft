import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, Clock, User, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function BlogPost() {
  const { slug } = useParams();
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/blog/posts/${slug}`],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-64 mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Blog Post Not Found</h1>
                  <p className="text-muted-foreground">
                    The blog post you're looking for doesn't exist or has been removed.
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
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-medium">{post.title}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">
                {post.categoryId}
              </Badge>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{post.readTime} min read</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Author */}
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Author</div>
                <div className="text-sm text-muted-foreground">AI Content Creator</div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <Card className="glass-card mb-8">
            <CardContent className="p-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
