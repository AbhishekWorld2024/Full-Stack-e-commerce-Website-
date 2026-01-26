import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${API}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#E5E5E5] w-1/4" />
          <div className="h-64 bg-[#E5E5E5]" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen" data-testid="order-detail-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-8 border-b border-[#E5E5E5]">
        <Link
          to="/orders"
          className="flex items-center gap-2 text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A]">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-[#666666] mt-2">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <span className={`px-4 py-2 text-xs uppercase tracking-wider font-medium w-fit ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-8 flex items-center gap-3">
              <Package className="h-6 w-6" />
              Items
            </h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-6 pb-6 border-b border-[#E5E5E5]">
                  <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                    <div className="w-24 md:w-32 aspect-[3/4] bg-[#F0F0F0] overflow-hidden">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="font-serif text-lg text-[#1A1A1A] hover:text-[#666666] transition-colors">
                        {item.product_name}
                      </h3>
                    </Link>
                    <p className="text-sm text-[#666666] mt-1">
                      Size: {item.size} / Color: {item.color}
                    </p>
                    <p className="text-sm text-[#666666]">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-lg font-medium text-[#1A1A1A] mt-2">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white border border-[#E5E5E5] p-6">
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h3>
              <div className="text-sm text-[#666666] space-y-1">
                <p className="text-[#1A1A1A] font-medium">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
                <p className="mt-2">{order.shipping_address.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-[#E5E5E5] p-6">
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-3">
                  <div className="flex justify-between text-lg font-medium text-[#1A1A1A]">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="text-center">
              <p className="text-sm text-[#666666]">
                Need help with your order?
              </p>
              <Link to="/contact" className="text-sm text-[#1A1A1A] font-medium hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
