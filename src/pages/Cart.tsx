import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/api/cart';
import { toast } from 'react-toastify';
import { formatPrice } from '@/utils/helpers';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Package,
  Truck,
  Tag,
} from 'lucide-react';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    stock: number;
  };
  quantity: number;
  price: number;
}

interface CartData {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      const data = await updateCartItem(itemId, quantity);
      setCart(data);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const data = await removeFromCart(itemId);
      setCart(data);
      toast.success('Item removed from cart');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
      toast.success('Cart cleared');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const shippingCost = (cart?.totalPrice || 0) > 500 ? 0 : 40;
  const taxAmount = Math.round((cart?.totalPrice || 0) * 0.18 * 100) / 100;
  const grandTotal = (cart?.totalPrice || 0) + shippingCost + taxAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link
            to="/products"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-8 py-3 rounded-xl"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ShoppingCart className="w-7 h-7" />
          Shopping Cart ({cart.totalItems} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-500">{cart.items.length} product(s) in cart</p>
              <button
                onClick={handleClear}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Clear Cart
              </button>
            </div>

            {cart.items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4"
              >
                <Link to={`/product/${item.product._id}`} className="shrink-0">
                  <img
                    src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="font-medium text-slate-900 hover:text-amber-600 transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-lg font-bold text-slate-900 mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={updating === item._id || item.quantity <= 1}
                        className="p-2 hover:bg-slate-50 rounded-l-lg disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={updating === item._id || item.quantity >= item.product.stock}
                        className="p-2 hover:bg-slate-50 rounded-r-lg disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.totalPrice)}</span>
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
                    <Tag className="w-4 h-4" /> Tax (18%)
                  </span>
                  <span className="font-medium">{formatPrice(taxAmount)}</span>
                </div>
                {shippingCost === 0 && (
                  <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    You got free shipping!
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-xl text-slate-900">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-3.5 rounded-xl transition-colors"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-amber-600 hover:text-amber-700 mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
