import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Orders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

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
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-[#E5E5E5] mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-4">My Orders</h1>
          <p className="text-[#666666] mb-8">Please login to view your orders.</p>
          <Link
            to="/login"
            className="inline-block bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-8 uppercase tracking-widest text-xs font-semibold flex items-center justify-center"
          >
            Login
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
            <div key={i} className="h-32 bg-[#E5E5E5]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="orders-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-16 border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-[#1A1A1A]">
          My Orders
        </h1>
        <p className="text-[#666666] mt-4">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-16 w-16 text-[#E5E5E5] mx-auto mb-6" />
            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-4">No orders yet</h2>
            <p className="text-[#666666] mb-8">Start shopping to see your orders here.</p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-8 uppercase tracking-widest text-xs font-semibold"
              data-testid="start-shopping-btn"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-[#E5E5E5] bg-white p-6 md:p-8 animate-fade-in"
                data-testid={`order-${order.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-[#666666] uppercase tracking-wider">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-[#999999] mt-1">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs uppercase tracking-wider font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-lg font-medium text-[#1A1A1A]">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="aspect-[3/4] bg-[#F0F0F0] overflow-hidden">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="aspect-[3/4] bg-[#F0F0F0] flex items-center justify-center">
                      <span className="text-[#666666] text-sm">
                        +{order.items.length - 4} more
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-[#E5E5E5] flex justify-between items-center">
                  <div className="text-sm text-[#666666]">
                    <span className="font-medium text-[#1A1A1A]">Ships to:</span>{' '}
                    {order.shipping_address.city}, {order.shipping_address.country}
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666] hover:text-[#1A1A1A] transition-colors"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
