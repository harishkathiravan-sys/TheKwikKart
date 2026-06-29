import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getMyOrders } from '@/api/orders';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice, formatDate } from '@/utils/helpers';
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  trackingNumber?: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  processing: { color: 'text-blue-700', bg: 'bg-blue-100', icon: RotateCcw },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Truck },
  delivered: { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
  cancelled: { color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">No Orders Yet</h2>
          <p className="text-slate-500 mb-6">You haven&apos;t placed any orders yet.</p>
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
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Package className="w-7 h-7" />
          My Orders ({orders.length})
        </h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Order ID</p>
                      <p className="text-sm font-mono font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-bold">{formatPrice(order.totalPrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${config.bg} ${config.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.isPaid && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {order.orderItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <p className="text-xs text-slate-500">
                        +{order.orderItems.length - 3} more item(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {order.trackingNumber && (
                      <span>Tracking: {order.trackingNumber}</span>
                    )}
                  </div>
                  <button className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
