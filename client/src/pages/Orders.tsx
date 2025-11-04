import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IOrder, OrderStatus } from '../../../types';
import api from '../lib/axios';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
      case OrderStatus.CONFIRMED:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-5 w-5 text-blue-600" />;
      case OrderStatus.SHIPPED:
        return <Truck className="h-5 w-5 text-purple-600" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
      case OrderStatus.CONFIRMED:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
        <Link to="/products" className="btn-primary inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm font-semibold">{order._id}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Placed on {format(new Date(order.createdAt!), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Items</p>
                  <p className="font-semibold">{order.items.length} product(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-semibold text-primary-600">₹{order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className="font-semibold capitalize">{order.paymentStatus}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="text-sm mt-1">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;

