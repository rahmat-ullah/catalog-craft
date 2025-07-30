import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPreview() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog/posts'],
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
              <p className="text-xl text-muted-foreground">Stay updated with AI trends and tutorials</p>
            </div>
            <Skeleton className="h-10 w-32" />
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

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
            <p className="text-xl text-muted-foreground">Stay updated with AI trends and tutorials</p>
          </div>
          <Link href="/blog">
            <Button variant="outline" className="glass">
              View All Posts
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post) => (
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
                      <span>{post.categoryId}</span>
                      <span className="mx-2">•</span>
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
                          <div className="text-xs text-muted-foreground">
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
      </div>
    </section>
  );
}
