import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, ShoppingCart, Users } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = ['Shirts', 'T-Shirts', 'Polos', 'Outerwear', 'Trousers', 'Knitwear', 'Blazers', 'Accessories'];

export default function Admin() {
  const navigate = useNavigate();
  const { user, token, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Shirts',
    sizes: 'XS,S,M,L,XL',
    colors: 'Black,White',
    image_url: '',
    stock: '100',
    featured: false,
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Shirts',
      sizes: 'XS,S,M,L,XL',
      colors: 'Black,White',
      image_url: '',
      stock: '100',
      featured: false,
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      sizes: formData.sizes.split(',').map((s) => s.trim()),
      colors: formData.colors.split(',').map((c) => c.trim()),
      image_url: formData.image_url,
      stock: parseInt(formData.stock),
      featured: formData.featured,
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/admin/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
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
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      sizes: product.sizes.join(','),
      colors: product.colors.join(','),
      image_url: product.image_url,
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

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

  if (!user || !isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-[#E5E5E5] w-1/4" />
          <div className="h-64 bg-[#E5E5E5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="admin-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-16 border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-[#1A1A1A]">
          Admin Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-12 lg:px-24 py-8 border-b border-[#E5E5E5]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-[#666666]" />
              <div>
                <p className="text-3xl font-serif text-[#1A1A1A]">{products.length}</p>
                <p className="text-sm text-[#666666]">Products</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-8 w-8 text-[#666666]" />
              <div>
                <p className="text-3xl font-serif text-[#1A1A1A]">{orders.length}</p>
                <p className="text-sm text-[#666666]">Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-[#666666]" />
              <div>
                <p className="text-3xl font-serif text-[#1A1A1A]">
                  ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(0)}
                </p>
                <p className="text-sm text-[#666666]">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 lg:px-24 py-6 border-b border-[#E5E5E5]">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`text-xs uppercase tracking-[0.2em] font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'products' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#666666]'
            }`}
            data-testid="products-tab"
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-xs uppercase tracking-[0.2em] font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'orders' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#666666]'
            }`}
            data-testid="orders-tab"
          >
            Orders
          </button>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-8">
        {activeTab === 'products' && (
          <div>
            {/* Add Product Button */}
            <div className="flex justify-end mb-8">
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-6 rounded-none uppercase tracking-widest text-xs font-semibold" data-testid="add-product-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Name</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 h-12 rounded-none"
                        required
                        data-testid="product-name-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Description</Label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-2 rounded-none min-h-[100px]"
                        required
                        data-testid="product-description-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Price ($)</Label>
                        <Input
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                          className="mt-2 h-12 rounded-none"
                          required
                          data-testid="product-price-input"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Category</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                          <SelectTrigger className="mt-2 h-12 rounded-none" data-testid="product-category-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Sizes (comma separated)</Label>
                      <Input
                        name="sizes"
                        value={formData.sizes}
                        onChange={handleChange}
                        className="mt-2 h-12 rounded-none"
                        placeholder="XS,S,M,L,XL"
                        data-testid="product-sizes-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Colors (comma separated)</Label>
                      <Input
                        name="colors"
                        value={formData.colors}
                        onChange={handleChange}
                        className="mt-2 h-12 rounded-none"
                        placeholder="Black,White,Navy"
                        data-testid="product-colors-input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Image URL</Label>
                      <Input
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        className="mt-2 h-12 rounded-none"
                        required
                        data-testid="product-image-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-[0.2em] font-semibold">Stock</Label>
                        <Input
                          name="stock"
                          type="number"
                          value={formData.stock}
                          onChange={handleChange}
                          className="mt-2 h-12 rounded-none"
                          data-testid="product-stock-input"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-8">
                        <Switch
                          checked={formData.featured}
                          onCheckedChange={(v) => setFormData((p) => ({ ...p, featured: v }))}
                          data-testid="product-featured-switch"
                        />
                        <Label className="text-sm">Featured Product</Label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 rounded-none uppercase tracking-widest text-xs font-semibold"
                      data-testid="save-product-btn"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#E5E5E5] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                  <tr>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666]">Product</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666]">Category</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666]">Price</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666]">Stock</th>
                    <th className="text-right p-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#666666]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#E5E5E5] hover:bg-[#F9F9F9]" data-testid={`product-row-${product.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-[#F0F0F0] overflow-hidden flex-shrink-0">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">{product.name}</p>
                            {product.featured && (
                              <span className="text-xs text-[#666666]">Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#666666]">{product.category}</td>
                      <td className="p-4 text-sm text-[#1A1A1A]">${product.price.toFixed(2)}</td>
                      <td className="p-4 text-sm text-[#666666]">{product.stock}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="h-10 w-10"
                            data-testid={`edit-product-${product.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="h-10 w-10 text-red-600 hover:text-red-700"
                            data-testid={`delete-product-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-12 w-12 text-[#E5E5E5] mx-auto mb-4" />
                <p className="text-[#666666]">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#E5E5E5] p-6" data-testid={`admin-order-${order.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-[#666666]">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select value={order.status} onValueChange={(v) => handleStatusUpdate(order.id, v)}>
                        <SelectTrigger className={`w-40 h-10 rounded-none ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-lg font-medium text-[#1A1A1A]">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-12 h-16 bg-[#F0F0F0] overflow-hidden">
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-sm">
                          <p className="text-[#1A1A1A]">{item.product_name}</p>
                          <p className="text-[#666666]">{item.size} / {item.color} × {item.quantity}</p>
                        </div>
                      </div>
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
