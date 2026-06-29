import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from '@/api/admin';
import { formatPrice, formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  UserCheck,
  RefreshCw,
  Search,
  Ban,
  Trash2,
  ArrowLeft,
  Edit,
  X,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

type TabType = 'dashboard' | 'users' | 'orders' | 'products';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: Array<{ _id: string; name: string; email: string; role: string; createdAt: string }>;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  category: string;
  ratings: number;
  numReviews: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  orderItems: Array<{ name: string; quantity: number }>;
}

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  recentOrders: Order[];
  ordersByStatus: Array<{ _id: string; count: number }>;
  monthlyRevenue: Array<{ _id: string; revenue: number }>;
}

export default function Admin() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
    fetchAllData();
  }, [isAuthenticated, isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsData, dashData, usersData, ordersData, productsData] = await Promise.all([
        getAdminStats(),
        getDashboardStats(),
        getAllUsers(),
        getAllOrders(),
        getAllProducts(),
      ]);
      setStats(statsData);
      setDashboardData(dashData);
      setUsers(usersData);
      setOrders(ordersData);
      setProducts(productsData.products || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      await toggleBlockUser(userId);
      toast.success('User status updated');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      toast.success('User role updated');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      toast.success('User deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditFormData(product);
    setNewImage(null);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name || '');
      formData.append('price', String(editFormData.price || 0));
      formData.append('stock', String(editFormData.stock || 0));
      formData.append('description', editFormData.description || '');
      if (newImage) {
        formData.append('image', newImage);
      }
      await updateProduct(editingProduct._id, formData);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      setNewImage(null);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      toast.success('Product deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id.includes(searchTerm)
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p._id.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-7 h-7 text-amber-500" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-6 w-fit">
          {[
            { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users' as TabType, label: 'Users', icon: Users },
            { id: 'products' as TabType, label: 'Products', icon: Package },
            { id: 'orders' as TabType, label: 'Orders', icon: ShoppingBag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && dashboardData && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
                { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-amber-500' },
                { label: 'Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Orders by Status</h3>
                <div className="space-y-3">
                  {dashboardData.ordersByStatus.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${statusColors[status._id]?.split(' ')[0] || 'bg-slate-300'}`} />
                        <span className="text-sm text-slate-600 capitalize">{status._id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width: `${(status.count / dashboardData.totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{status.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {stats.recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-600">
                          {u.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  View All
                </button>
              </div>
              <div className="divide-y">
                {dashboardData.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{order.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatPrice(order.totalPrice)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">All Users ({filteredUsers.length})</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">User</th>
                    <th className="text-left px-5 py-3 font-medium">Role</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Joined</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-700">
                              {u.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            u.isBlocked
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBlock(u._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={u.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">All Orders ({filteredOrders.length})</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search orders..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Order ID</th>
                    <th className="text-left px-5 py-3 font-medium">Customer</th>
                    <th className="text-left px-5 py-3 font-medium">Items</th>
                    <th className="text-left px-5 py-3 font-medium">Total</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono text-xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{order.user?.name}</p>
                        <p className="text-xs text-slate-500">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {order.orderItems?.length || 0} items
                      </td>
                      <td className="px-5 py-4 font-bold">{formatPrice(order.totalPrice)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateOrderStatus(order._id, status)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                order.status === status
                                  ? statusColors[status]
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {status.charAt(0).toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">All Products ({filteredProducts.length})</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Product</th>
                    <th className="text-left px-5 py-3 font-medium">Price</th>
                    <th className="text-left px-5 py-3 font-medium">Stock</th>
                    <th className="text-left px-5 py-3 font-medium">Rating</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/product-watch.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold">{formatPrice(product.price)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-700'
                            : product.stock > 0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{product.ratings?.toFixed(1) || 0}</span>
                          <span className="text-xs text-slate-500">({product.numReviews || 0})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Edit Product</h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewImage(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Product Image */}
                <div>
                  <label className="text-sm text-slate-600 block mb-2">Product Image</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {newImage ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm">{newImage.name}</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Click to upload image</p>
                      </div>
                    )}
                  </div>
                  {editingProduct.images?.[0] && !newImage && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-2">Current image:</p>
                      <img
                        src={editingProduct.images[0]}
                        alt="Current"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/product-watch.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Price</label>
                  <input
                    type="number"
                    value={editFormData.price || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editFormData.stock || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Description</label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setNewImage(null);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-500 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
