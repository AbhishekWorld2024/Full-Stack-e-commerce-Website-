import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Minus, Plus, ArrowLeft, Check } from 'lucide-react';

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
        if (response.data.sizes?.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }
        if (response.data.colors?.length > 0) {
          setSelectedColor(response.data.colors[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
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

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedSize, selectedColor);
      toast.success('Added to cart', {
        description: `${product.name} - ${selectedSize}, ${selectedColor}`,
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="aspect-[3/4] bg-[#E5E5E5] animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 bg-[#E5E5E5] w-1/2 animate-pulse" />
            <div className="h-6 bg-[#E5E5E5] w-1/4 animate-pulse" />
            <div className="h-24 bg-[#E5E5E5] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 lg:px-24 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <Link to="/shop" className="hover:text-[#1A1A1A] transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
          <span>/</span>
          <span className="text-[#1A1A1A]">{product.name}</span>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Product Image */}
          <div className="aspect-[3/4] bg-[#F0F0F0] overflow-hidden animate-fade-in">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-8 animate-fade-in">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#666666] font-semibold mb-2 block">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-4" data-testid="product-name">
                {product.name}
              </h1>
              <p className="text-2xl text-[#1A1A1A]" data-testid="product-price">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-[#666666] leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            {/* Size Selection */}
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] mb-4 block">
                Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 px-4 border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-transparent text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]'
                    }`}
                    data-testid={`size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] mb-4 block">
                Color: {selectedColor}
              </label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="w-full h-12 rounded-none border-[#E5E5E5]" data-testid="color-select">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] mb-4 block">
                Quantity
              </label>
              <div className="flex items-center border border-[#E5E5E5] w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
                  data-testid="quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-16 h-12 flex items-center justify-center text-sm font-medium" data-testid="quantity-value">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
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
              className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 rounded-none uppercase tracking-widest text-xs font-semibold disabled:opacity-50"
              data-testid="add-to-cart-btn"
            >
              {adding ? (
                'Adding...'
              ) : product.stock === 0 ? (
                'Out of Stock'
              ) : (
                <>
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </Button>

            {/* Stock Status */}
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-sm text-[#666666] flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Only {product.stock} left in stock
              </p>
            )}

            {/* Product Details */}
            <div className="border-t border-[#E5E5E5] pt-8 space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                Details
              </h3>
              <ul className="text-sm text-[#666666] space-y-2">
                <li>Premium quality materials</li>
                <li>Designed for everyday comfort</li>
                <li>Machine washable</li>
                <li>Free returns within 30 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
