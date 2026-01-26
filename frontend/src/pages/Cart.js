import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateCartItem, removeFromCart, loading } = useCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" data-testid="cart-login-prompt">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-16 w-16 text-[#E5E5E5] mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-4">Your Cart</h1>
          <p className="text-[#666666] mb-8">Please login to view your cart and continue shopping.</p>
          <Link to="/login">
            <Button className="bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-8 rounded-none uppercase tracking-widest text-xs font-semibold" data-testid="cart-login-btn">
              Login to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-[#E5E5E5] w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-6">
              <div className="w-32 h-40 bg-[#E5E5E5]" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-[#E5E5E5] w-1/2" />
                <div className="h-4 bg-[#E5E5E5] w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" data-testid="cart-empty">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-16 w-16 text-[#E5E5E5] mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-4">Your Cart is Empty</h1>
          <p className="text-[#666666] mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop">
            <Button className="bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-8 rounded-none uppercase tracking-widest text-xs font-semibold" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="cart-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-16 border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-[#1A1A1A]">
          Shopping Cart
        </h1>
        <p className="text-[#666666] mt-4">
          {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 pb-8 border-b border-[#E5E5E5] animate-fade-in"
                data-testid={`cart-item-${item.id}`}
              >
                {/* Product Image */}
                <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                  <div className="w-28 md:w-36 aspect-[3/4] bg-[#F0F0F0] overflow-hidden">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="font-serif text-lg text-[#1A1A1A] hover:text-[#666666] transition-colors">
                        {item.product_name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[#999999] hover:text-[#1A1A1A] transition-colors p-1"
                      data-testid={`remove-item-${item.id}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-sm text-[#666666] mb-1">Size: {item.size}</p>
                  <p className="text-sm text-[#666666] mb-4">Color: {item.color}</p>

                  <div className="flex items-center justify-between mt-auto">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#E5E5E5]">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
                        data-testid={`decrease-qty-${item.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
                        data-testid={`increase-qty-${item.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <p className="text-lg font-medium text-[#1A1A1A]">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E5E5] p-8 sticky top-32">
              <h2 className="font-serif text-2xl text-[#1A1A1A] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-6 mb-8">
                <div className="flex justify-between text-lg font-medium text-[#1A1A1A]">
                  <span>Total</span>
                  <span data-testid="cart-total">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 rounded-none uppercase tracking-widest text-xs font-semibold"
                data-testid="checkout-btn"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Link to="/shop" className="block mt-6 text-center">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#666666] hover:text-[#1A1A1A] transition-colors">
                  Continue Shopping
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
