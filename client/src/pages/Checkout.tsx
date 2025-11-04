import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { IProduct, IAddress, PaymentMethod } from '../../../types';
import api from '../lib/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<IAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    fetchProductDetails();
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [cart, user]);

  const fetchProductDetails = async () => {
    try {
      const productIds = cart.map((item) => 
        typeof item.product === 'string' ? item.product : item.product._id
      );
      const promises = productIds.map((id) => api.get(`/products/${id}`));
      const responses = await Promise.all(promises);
      setProducts(responses.map((res) => res.data));
    } catch (error) {
      toast.error('Failed to fetch product details');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/address', addressForm);
      toast.success('Address added successfully');
      setSelectedAddress(data[data.length - 1]);
      setShowAddressForm(false);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);

    try {
      let paymentId: string | undefined;

      if (paymentMethod === PaymentMethod.STRIPE) {
        if (!stripe || !elements) {
          toast.error('Stripe not loaded');
          return;
        }

        // Create payment intent
        const { data: intentData } = await api.post('/payment/create-intent', {
          amount: getCartTotal(),
        });

        // Confirm payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error('Card element not found');
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (error) {
          toast.error(error.message || 'Payment failed');
          return;
        }

        paymentId = paymentIntent?.id;
      }

      // Create order
      const orderData = {
        items: cart.map((item, index) => ({
          product: typeof item.product === 'string' ? item.product : item.product._id,
          quantity: item.quantity,
          price: products[index]?.price || item.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
        paymentId,
      };

      const { data: order } = await api.post('/orders', orderData);

      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-primary-600" />
                  Delivery Address
                </h2>

                {user?.addresses && user.addresses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {user.addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`block p-4 border rounded-lg cursor-pointer transition ${
                          selectedAddress?._id === address._id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?._id === address._id}
                          onChange={() => setSelectedAddress(address)}
                          className="mr-3"
                        />
                        <span className="font-medium">{address.street}</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn-outline w-full"
                >
                  {showAddressForm ? 'Cancel' : 'Add New Address'}
                </button>

                {showAddressForm && (
                  <div className="mt-4 space-y-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="input-field"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="input-field"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        className="input-field"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="btn-primary w-full"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-6 w-6 mr-2 text-primary-600" />
                  Payment Method
                </h2>

                <div className="space-y-3 mb-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary-300">
                    <input
                      type="radio"
                      name="payment"
                      value={PaymentMethod.STRIPE}
                      checked={paymentMethod === PaymentMethod.STRIPE}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span className="font-medium">Credit/Debit Card (Stripe)</span>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary-300">
                    <input
                      type="radio"
                      name="payment"
                      value={PaymentMethod.COD}
                      checked={paymentMethod === PaymentMethod.COD}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                </div>

                {paymentMethod === PaymentMethod.STRIPE && (
                  <div className="p-4 border rounded-lg">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {cart.map((item, index) => {
                    const product = products[index];
                    if (!product) return null;

                    return (
                      <div key={product._id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {product.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{(product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-3">
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
                  type="submit"
                  disabled={loading || !selectedAddress}
                  className="w-full btn-primary mt-6"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;

