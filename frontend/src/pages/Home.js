import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First seed the database
        await axios.post(`${API}/seed`);
        
        // Then fetch featured products
        const response = await axios.get(`${API}/products?featured=true`);
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Fashion Editorial"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F9F9F9]/95 via-[#F9F9F9]/70 to-transparent" />
        </div>
        
        <div className="relative h-full px-6 md:px-12 lg:px-24 flex items-center">
          <div className="max-w-xl animate-fade-in">
            <span className="text-xs uppercase tracking-[0.3em] text-[#666666] font-semibold mb-4 block">
              New Collection
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-[#1A1A1A] mb-6">
              Timeless
              <br />
              Elegance
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-light text-[#666666] mb-10 max-w-md">
              Discover our curated collection of minimalist essentials designed for the modern wardrobe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button className="bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 px-10 rounded-none uppercase tracking-widest text-xs font-semibold" data-testid="shop-now-btn">
                  Shop Now
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop?featured=true">
                <Button variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white h-14 px-10 rounded-none uppercase tracking-widest text-xs font-semibold" data-testid="view-collection-btn">
                  View Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32" data-testid="categories-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/shop?category=Shirts" className="group relative aspect-[4/5] overflow-hidden bg-[#F0F0F0]">
            <img
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=srgb&fm=jpg&q=85"
              alt="Shirts Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 category-overlay" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-semibold mb-2 block">
                Essentials
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white">Shirts</h2>
            </div>
          </Link>
          <Link to="/shop?category=Outerwear" className="group relative aspect-[4/5] overflow-hidden bg-[#F0F0F0]">
            <img
              src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?crop=entropy&cs=srgb&fm=jpg&q=85"
              alt="Outerwear Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 category-overlay" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-semibold mb-2 block">
                Outerwear
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white">Coats & Jackets</h2>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-white" data-testid="featured-products-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#666666] font-semibold mb-4 block">
              Curated Selection
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-[#1A1A1A]">
              Featured Pieces
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-6 md:mt-0 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666] hover:text-[#1A1A1A] transition-colors flex items-center gap-2"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#E5E5E5] mb-4" />
                <div className="h-5 bg-[#E5E5E5] w-2/3 mb-2" />
                <div className="h-4 bg-[#E5E5E5] w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 stagger-children">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Statement */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32" data-testid="brand-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-[#1A1A1A] leading-tight mb-8">
            "Fashion is not about labels. It's about having a sense of self and expressing it."
          </h2>
          <p className="text-lg text-[#666666] font-light">— ATELIER Philosophy</p>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-[#1A1A1A]" data-testid="newsletter-section">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#999999] font-semibold mb-4 block">
            Stay Connected
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
            Join Our World
          </h2>
          <p className="text-[#999999] mb-10">
            Subscribe to receive updates on new arrivals, exclusive offers, and style inspiration.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-transparent border-b border-[#444444] py-4 text-white text-sm placeholder:text-[#666666] focus:border-white focus:outline-none transition-colors"
              data-testid="home-newsletter-input"
            />
            <button
              type="submit"
              className="bg-white text-[#1A1A1A] h-12 px-8 uppercase tracking-widest text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
              data-testid="home-newsletter-btn"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
