import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog/posts'],
  });

  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay updated with the latest AI trends, tutorials, and insights from our community of developers and AI enthusiasts.
            </p>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group cursor-pointer">
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="glass-card card-hover overflow-hidden h-full">
                      {post.coverImage && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex items-center mb-3 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="mr-2">
                            {post.categoryId}
                          </Badge>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{post.readTime} min read</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">Author</div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recently'}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
                  <p className="text-muted-foreground">
                    We're working on some great content. Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
