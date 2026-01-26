import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${id}`);
        setProduct(response.data);
        if (response.data.sizes?.length > 0) setSelectedSize(response.data.sizes[0]);
        if (response.data.colors?.length > 0) setSelectedColor(response.data.colors[0]);
      } catch (error) {
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedSize, selectedColor);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen" data-testid="product-detail-page">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/shop" className="text-blue-600 hover:underline">← Back to Shop</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-gray-100 rounded overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto"
              data-testid="product-image"
            />
          </div>

          {/* Info */}
          <div>
            <span className="text-sm text-gray-500">{product.category}</span>
            <h1 className="text-2xl font-bold text-gray-800 mb-2" data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-2xl text-blue-600 font-bold mb-4" data-testid="product-price">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-gray-600 mb-6" data-testid="product-description">
              {product.description}
            </p>

            {/* Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                    data-testid={`size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                data-testid="color-select"
              >
                {product.colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  data-testid="quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2" data-testid="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100"
                  data-testid="quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              data-testid="add-to-cart-btn"
            >
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
            </Button>

            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-sm text-orange-600 mt-2">Only {product.stock} left in stock!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
