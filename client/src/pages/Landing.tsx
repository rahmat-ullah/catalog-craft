import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import FeaturedResources from "@/components/FeaturedResources";
import BlogPreview from "@/components/BlogPreview";
import ShowcaseSection from "@/components/ShowcaseSection";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import DomainCard from "@/components/DomainCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Landing() {
  const { data: domains, isLoading } = useQuery({
    queryKey: ['/api/domains'],
  });

  return (
    <Layout>
      <HeroSection />
      
      {/* Domains Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Domains</h2>
            <p className="text-xl text-muted-foreground">Discover curated collections organized by technology domains</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {domains?.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          )}
        </div>
      </section>

      <FeaturedResources />
      <ShowcaseSection />
      <BlogPreview />
      
      {/* Newsletter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the latest AI resources, tools, and insights delivered directly to your inbox. Join our community of developers and AI enthusiasts.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 gradient-bg text-white rounded-lg font-semibold transition-all transform hover:scale-105 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </Layout>
  );
}
