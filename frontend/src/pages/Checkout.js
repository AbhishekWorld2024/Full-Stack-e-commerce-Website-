import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Check, ArrowLeft, CreditCard } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];

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

  const handleCountryChange = (value) => {
    setFormData((prev) => ({ ...prev, country: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const required = ['full_name', 'address_line1', 'city', 'state', 'postal_code', 'country', 'phone'];
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
      console.error('Failed to place order:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cart.items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" data-testid="order-success">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-4">Order Confirmed</h1>
          <p className="text-[#666666] mb-2">Thank you for your order!</p>
          <p className="text-sm text-[#999999] mb-8">Order ID: {orderId}</p>
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/orders')}
              className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 rounded-none uppercase tracking-widest text-xs font-semibold"
              data-testid="view-orders-btn"
            >
              View My Orders
            </Button>
            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="w-full border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white h-12 rounded-none uppercase tracking-widest text-xs font-semibold"
              data-testid="continue-shopping-after-order-btn"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="checkout-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-8 border-b border-[#E5E5E5]">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>
        <h1 className="font-serif text-4xl font-normal tracking-tight text-[#1A1A1A]">
          Checkout
        </h1>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Shipping Form */}
          <div>
            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-8">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="full_name" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                  placeholder="John Doe"
                  data-testid="checkout-name-input"
                />
              </div>

              <div>
                <Label htmlFor="address_line1" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                  Address Line 1 *
                </Label>
                <Input
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                  placeholder="123 Main Street"
                  data-testid="checkout-address1-input"
                />
              </div>

              <div>
                <Label htmlFor="address_line2" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                  Address Line 2
                </Label>
                <Input
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                  placeholder="Apt 4B"
                  data-testid="checkout-address2-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                    City *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                    placeholder="New York"
                    data-testid="checkout-city-input"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                    State *
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                    placeholder="NY"
                    data-testid="checkout-state-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                    Postal Code *
                  </Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                    placeholder="10001"
                    data-testid="checkout-postal-input"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                    Country *
                  </Label>
                  <Select value={formData.country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="mt-2 h-12 rounded-none border-[#E5E5E5]" data-testid="checkout-country-select">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                  placeholder="+1 (555) 000-0000"
                  data-testid="checkout-phone-input"
                />
              </div>

              {/* Payment Mock */}
              <div className="border-t border-[#E5E5E5] pt-8 mt-8">
                <h3 className="font-serif text-xl text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h3>
                <div className="bg-[#F0F0F0] p-6 text-center">
                  <p className="text-sm text-[#666666]">
                    This is a demo checkout. No real payment will be processed.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 rounded-none uppercase tracking-widest text-xs font-semibold mt-8"
                data-testid="place-order-btn"
              >
                {loading ? 'Processing...' : `Place Order — $${cart.total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-8">Order Summary</h2>
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-[#F0F0F0] overflow-hidden flex-shrink-0">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-base text-[#1A1A1A]">{item.product_name}</h4>
                    <p className="text-sm text-[#666666]">
                      {item.size} / {item.color} × {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-[#1A1A1A] mt-1">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E5E5] mt-8 pt-8 space-y-4">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="flex justify-between text-lg font-medium text-[#1A1A1A]">
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
