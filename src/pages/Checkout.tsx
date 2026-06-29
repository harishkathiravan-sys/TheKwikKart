import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCart } from '@/api/cart';
import { createOrder } from '@/api/orders';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice } from '@/utils/helpers';
import {
  CreditCard,
  Truck,
  MapPin,
  Smartphone,
  Banknote,
  CheckCircle,
  ArrowLeft,
  Package,
  Tag,
} from 'lucide-react';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  price: number;
}

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ items: CartItem[]; totalPrice: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [upiFlowActive, setUpiFlowActive] = useState(false);
  const [upiCountdown, setUpiCountdown] = useState(10);
  const [upiPaid, setUpiPaid] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please login to checkout');
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (upiFlowActive && upiCountdown > 0) {
      timer = setTimeout(() => setUpiCountdown((prev) => prev - 1), 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [upiFlowActive, upiCountdown]);

  useEffect(() => {
    if (paymentMethod !== 'upi') {
      setUpiFlowActive(false);
      setUpiCountdown(10);
      setUpiPaid(false);
    }
  }, [paymentMethod]);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      if (!data.items || data.items.length === 0) {
        toast.info('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCart(data);
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.addresses && userData.addresses.length > 0) {
          const defaultAddr = userData.addresses.find((a: any) => a.isDefault) || userData.addresses[0];
          setShippingAddress(defaultAddr);
        }
      } catch { /* ignore */ }
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    if (paymentMethod === 'upi') {
      if (!upiFlowActive) {
        setUpiFlowActive(true);
        setUpiCountdown(10);
        setUpiPaid(false);
        toast.info('Generating UPI QR code. Please wait for 10 seconds.');
        return;
      }

      if (!upiPaid) {
        toast.error('Complete the UPI payment by clicking the Paid button first.');
        return;
      }
    }

    setPlacingOrder(true);
    try {
      const order = await createOrder({ shippingAddress, paymentMethod });
      setOrderId(order._id);
      setOrderSuccess(true);
      toast.success('Order placed successfully!');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const shippingCost = (cart?.totalPrice || 0) > 500 ? 0 : 40;
  const taxAmount = Math.round((cart?.totalPrice || 0) * 0.18 * 100) / 100;
  const grandTotal = (cart?.totalPrice || 0) + shippingCost + taxAmount;

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-500 mb-2">Your order has been placed successfully.</p>
          <p className="text-sm text-slate-400 mb-6">Order ID: {orderId}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-3 rounded-xl"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600 mb-1 block">Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="123 Main Street, Apt 4B"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Maharashtra"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="400001"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-amber-500"
                    />
                    <Banknote className="w-6 h-6 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">Cash on Delivery</p>
                      <p className="text-xs text-slate-500">Pay when you receive</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'upi' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        if (e.target.value === 'upi') {
                          setUpiFlowActive(true);
                          setUpiCountdown(10);
                          setUpiPaid(false);
                        }
                      }}
                      className="text-amber-500"
                    />
                    <Smartphone className="w-6 h-6 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">UPI</p>
                      <p className="text-xs text-slate-500">Pay using UPI apps</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'card' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-amber-500"
                    />
                    <CreditCard className="w-6 h-6 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">Credit/Debit Card</p>
                      <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">UPI Payment</h3>
                    <div className="mx-auto mb-4 w-full max-w-xs overflow-hidden rounded-3xl border border-slate-200 bg-white p-4">
                      <img
                        src="/qr_code.png"
                        alt="UPI QR Code"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Scan the QR code using your UPI app, then click Paid to confirm your payment.
                    </p>
                    <div className="flex items-center justify-between gap-3 mb-4 text-sm text-slate-700">
                      <span>QR available for</span>
                      <span className="font-semibold">{upiCountdown}s</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (upiCountdown > 0) {
                          toast.info('Please wait until the QR code is ready.');
                          return;
                        }
                        setUpiPaid(true);
                        toast.success('UPI payment confirmed. You can now place the order.');
                      }}
                      disabled={upiCountdown > 0 || upiPaid}
                      className={`w-full rounded-xl px-4 py-3 font-semibold transition-colors ${
                        upiCountdown > 0 || upiPaid
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                      }`}
                    >
                      {upiPaid ? 'Paid' : `Click Paid ${upiCountdown > 0 ? `(${upiCountdown}s)` : ''}`}
                    </button>
                    {upiPaid && (
                      <p className="mt-3 text-sm text-green-600">Payment successful. Submit the order to complete checkout.</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg"
              >
                {placingOrder ? 'Placing Order...' : `Place Order - ${formatPrice(grandTotal)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart?.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Shipping
                  </span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Tax
                  </span>
                  <span className="font-medium">{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-xl text-slate-900">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-amber-50 rounded-lg p-3 flex items-center gap-2 text-xs text-amber-700">
                <Package className="w-4 h-4 shrink-0" />
                Estimated delivery: 3-5 business days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
