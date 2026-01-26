import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await axios.post(`${API}/seed`);
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
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-gray-100 py-16" data-testid="hero-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to Fashion Store
              </h1>
              <p className="text-gray-600 mb-6">
                Discover our collection of quality clothing and accessories. 
                Shop the latest trends at affordable prices.
              </p>
              <Link 
                to="/shop"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                data-testid="shop-now-btn"
              >
                Shop Now
              </Link>
            </div>
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                alt="Fashion Store"
                className="w-full rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Shirts', 'T-Shirts', 'Outerwear', 'Accessories'].map((cat) => (
            <Link 
              key={cat} 
              to={`/shop?category=${cat}`}
              className="bg-gray-50 border rounded p-4 text-center hover:bg-gray-100"
            >
              <span className="font-medium text-gray-700">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white max-w-6xl mx-auto px-4" data-testid="featured-products-section">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <Link to="/shop" className="text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About Our Store</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We are committed to providing quality fashion at affordable prices. 
            Our collection features the latest styles for men and women.
          </p>
        </div>
      </section>
    </div>
  );
}
