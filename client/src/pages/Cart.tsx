import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { IProduct } from '../../../types';
import api from '../lib/axios';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [cart]);

  const fetchProductDetails = async () => {
    if (cart.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const productIds = cart.map((item) => 
        typeof item.product === 'string' ? item.product : item.product._id
      );
      const promises = productIds.map((id) => api.get(`/products/${id}`));
      const responses = await Promise.all(promises);
      setProducts(responses.map((res) => res.data));
    } catch (error) {
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some products to your cart to get started!</p>
        <Link to="/products" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const product = products[index];
              if (!product) return null;

              const discountedPrice = product.discount
                ? product.price - (product.price * product.discount) / 100
                : product.price;

              return (
                <div key={product._id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{product.category}</p>

                      <div className="mt-2 flex items-center">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{discountedPrice.toFixed(2)}
                        </span>
                        {(product.discount ?? 0) > 0 && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                        <span className="ml-1 text-sm text-gray-600">/ {product.unit}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(product._id!, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product._id!, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                            disabled={item.quantity >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product._id!)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{(discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

