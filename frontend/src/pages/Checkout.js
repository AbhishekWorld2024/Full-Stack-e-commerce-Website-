import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Checkout() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['full_name', 'address_line1', 'city', 'state', 'postal_code', 'phone'];
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/_/g, ' ')}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/orders`,
        { shipping_address: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderId(response.data.id);
      setOrderComplete(true);
      await fetchCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) { navigate('/login'); return null; }
  if (cart.items.length === 0 && !orderComplete) { navigate('/cart'); return null; }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="order-success">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Order ID: {orderId.slice(0, 8)}</p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/orders')} data-testid="view-orders-btn">View Orders</Button>
            <Button variant="outline" onClick={() => navigate('/shop')} data-testid="continue-shopping-after-order-btn">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} data-testid="checkout-name-input" />
              </div>
              <div>
                <Label htmlFor="address_line1">Address *</Label>
                <Input id="address_line1" name="address_line1" value={formData.address_line1} onChange={handleChange} data-testid="checkout-address1-input" />
              </div>
              <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input id="address_line2" name="address_line2" value={formData.address_line2} onChange={handleChange} data-testid="checkout-address2-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} data-testid="checkout-city-input" />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} data-testid="checkout-state-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} data-testid="checkout-postal-input" />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} data-testid="checkout-country-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} data-testid="checkout-phone-input" />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Payment</h3>
                <div className="bg-gray-100 p-4 rounded text-center text-sm text-gray-600">
                  Demo checkout - No real payment processed
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="place-order-btn">
                {loading ? 'Processing...' : `Place Order - $${cart.total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="border rounded p-4 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{item.size} / {item.color} × {item.quantity}</p>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>${cart.total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span data-testid="checkout-total">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
