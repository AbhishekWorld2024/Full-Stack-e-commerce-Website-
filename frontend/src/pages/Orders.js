import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Orders</h1>
          <p className="text-gray-600 mb-4">Please login to view orders.</p>
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen" data-testid="orders-page">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No orders yet.</p>
            <Link to="/shop" className="text-blue-600 hover:underline" data-testid="start-shopping-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4" data-testid={`order-${order.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="font-semibold mt-1">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-sm text-gray-500 self-center">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
