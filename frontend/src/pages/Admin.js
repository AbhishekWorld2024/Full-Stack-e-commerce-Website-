import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ['Shirts', 'T-Shirts', 'Polos', 'Outerwear', 'Trousers', 'Knitwear', 'Blazers', 'Accessories'];

export default function Admin() {
  const navigate = useNavigate();
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Shirts',
    sizes: 'XS,S,M,L,XL', colors: 'Black,White', image_url: '', stock: '100', featured: false,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { navigate('/login'); return; }
    fetchData();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: 'Shirts', sizes: 'XS,S,M,L,XL', colors: 'Black,White', image_url: '', stock: '100', featured: false });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name, description: formData.description, price: parseFloat(formData.price),
      category: formData.category, sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.split(',').map(c => c.trim()), image_url: formData.image_url,
      stock: parseInt(formData.stock), featured: formData.featured,
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/admin/products`, productData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Product created');
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description, price: product.price.toString(),
      category: product.category, sizes: product.sizes.join(','), colors: product.colors.join(','),
      image_url: product.image_url, stock: product.stock.toString(), featured: product.featured,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status?status=${status}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (authLoading || loading) return <div className="text-center py-12">Loading...</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen" data-testid="admin-page">
      <div className="bg-gray-50 py-8 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded p-4 bg-white">
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-gray-500 text-sm">Products</p>
          </div>
          <div className="border rounded p-4 bg-white">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-gray-500 text-sm">Orders</p>
          </div>
          <div className="border rounded p-4 bg-white">
            <p className="text-2xl font-bold">${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}</p>
            <p className="text-gray-500 text-sm">Revenue</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-4 border-b">
          <button onClick={() => setActiveTab('products')} className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} data-testid="products-tab">Products</button>
          <button onClick={() => setActiveTab('orders')} className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} data-testid="orders-tab">Orders</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-end mb-4">
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button data-testid="add-product-btn"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div><Label>Name</Label><Input name="name" value={formData.name} onChange={handleChange} required data-testid="product-name-input" /></div>
                    <div><Label>Description</Label><Textarea name="description" value={formData.description} onChange={handleChange} required data-testid="product-description-input" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Price ($)</Label><Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required data-testid="product-price-input" /></div>
                      <div><Label>Category</Label><select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded p-2" data-testid="product-category-select">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div><Label>Sizes (comma separated)</Label><Input name="sizes" value={formData.sizes} onChange={handleChange} data-testid="product-sizes-input" /></div>
                    <div><Label>Colors (comma separated)</Label><Input name="colors" value={formData.colors} onChange={handleChange} data-testid="product-colors-input" /></div>
                    <div><Label>Image URL</Label><Input name="image_url" value={formData.image_url} onChange={handleChange} required data-testid="product-image-input" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Stock</Label><Input name="stock" type="number" value={formData.stock} onChange={handleChange} data-testid="product-stock-input" /></div>
                      <div className="flex items-center gap-2 pt-6"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} data-testid="product-featured-switch" /><Label>Featured</Label></div>
                    </div>
                    <Button type="submit" className="w-full" data-testid="save-product-btn">{editingProduct ? 'Update' : 'Add'} Product</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Product</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Stock</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t" data-testid={`product-row-${product.id}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image_url} alt={product.name} className="w-10 h-12 object-cover rounded" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{product.category}</td>
                      <td className="p-3">${product.price.toFixed(2)}</td>
                      <td className="p-3 text-gray-600">{product.stock}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} data-testid={`edit-product-${product.id}`}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500" data-testid={`delete-product-${product.id}`}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No orders yet</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border rounded p-4" data-testid={`admin-order-${order.id}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)} className="border rounded p-1 text-sm">
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.items.map((item, idx) => (
                      <img key={idx} src={item.product_image} alt={item.product_name} className="w-10 h-12 object-cover rounded" />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
