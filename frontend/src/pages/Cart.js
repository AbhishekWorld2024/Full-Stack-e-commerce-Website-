import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Minus, Plus, Trash2 } from 'lucide-react';

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
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="cart-login-prompt">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-4">Please login to view your cart.</p>
          <Link to="/login">
            <Button data-testid="cart-login-btn">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="cart-empty">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-4">Add some products to your cart.</p>
          <Link to="/shop">
            <Button data-testid="continue-shopping-btn">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="cart-page">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="border rounded p-4 flex gap-4" data-testid={`cart-item-${item.id}`}>
                <Link to={`/product/${item.product_id}`}>
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-24 h-32 object-cover rounded"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-medium text-gray-800">{item.product_name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color}</p>
                  <p className="text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                        data-testid={`decrease-qty-${item.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                        data-testid={`increase-qty-${item.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-700"
                      data-testid={`remove-item-${item.id}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded p-6 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span data-testid="cart-total">${cart.total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                data-testid="checkout-btn"
              >
                Proceed to Checkout
              </Button>
              <Link to="/shop" className="block text-center mt-4 text-blue-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
