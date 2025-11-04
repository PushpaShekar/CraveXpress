import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    sellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/products?limit=1'),
        api.get('/orders?limit=1'),
      ]);

      setStats({
        totalUsers: usersRes.data.totalUsers,
        customers: usersRes.data.customers,
        sellers: usersRes.data.sellers,
        totalProducts: productsRes.data.total || 0,
        totalOrders: ordersRes.data.total || 0,
        revenue: 0, // Calculate from orders if needed
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="h-8 w-8" />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart className="h-8 w-8" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Sellers',
      value: stats.sellers,
      icon: <DollarSign className="h-8 w-8" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.textColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition"
            >
              <Users className="h-6 w-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage all users</p>
            </a>
            <a
              href="/admin/products"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition"
            >
              <Package className="h-6 w-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Products</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage all products</p>
            </a>
            <a
              href="/admin/orders"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition"
            >
              <ShoppingCart className="h-6 w-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Manage Orders</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage all orders</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

