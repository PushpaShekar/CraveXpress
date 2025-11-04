import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IOrder, IProduct, OrderStatus } from '../../../types';
import api from '../lib/axios';
import { Package, MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getOrderProgress = (status: OrderStatus): number => {
    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
    return ((statusOrder.indexOf(status) + 1) / statusOrder.length) * 100;
  };

  const canCancelOrder = (status: OrderStatus): boolean => {
    return status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-xl text-gray-600">Order not found</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <Link to="/orders" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to Orders
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">
                Order ID: <span className="font-mono font-semibold">{order._id}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {format(new Date(order.createdAt!), 'MMMM dd, yyyy h:mm a')}
              </p>
            </div>
            {canCancelOrder(order.status) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Order Status Progress */}
        {order.status !== OrderStatus.CANCELLED && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                <div
                  className="h-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${getOrderProgress(order.status)}%` }}
                ></div>
              </div>

              {/* Status Steps */}
              <div className="relative flex justify-between">
                {[
                  { status: OrderStatus.PENDING, label: 'Order Placed', icon: Package },
                  { status: OrderStatus.CONFIRMED, label: 'Confirmed', icon: CheckCircle },
                  { status: OrderStatus.PROCESSING, label: 'Processing', icon: Package },
                  { status: OrderStatus.SHIPPED, label: 'Shipped', icon: Truck },
                  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: CheckCircle },
                ].map(({ status, label, icon: Icon }) => {
                  const isCompleted = getOrderProgress(order.status) >= getOrderProgress(status);
                  const isCurrent = order.status === status;

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          isCompleted || isCurrent
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-primary-600' : 'text-gray-600'}`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {order.status === OrderStatus.CANCELLED && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 font-semibold">This order has been cancelled</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = item.product as IProduct;
                  return (
                    <div key={product._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <img
                        src={product.images?.[0] || ''}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/products/${product._id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          Subtotal: ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking Information</h2>
                <p className="text-gray-700">
                  Tracking Number:{' '}
                  <span className="font-mono font-semibold">{order.trackingNumber}</span>
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Delivery Address
              </h2>
              <p className="text-gray-700">
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.zipCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                Payment Information
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold capitalize ${
                      order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentId && (
                  <div className="text-sm text-gray-600 mt-2">
                    Payment ID: <span className="font-mono">{order.paymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

