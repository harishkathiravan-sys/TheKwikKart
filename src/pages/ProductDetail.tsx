import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { getProductById, addReview } from '@/api/products';
import { addToCart } from '@/api/cart';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import StarRating from '@/components/product/StarRating';
import { formatPrice } from '@/utils/helpers';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  Send,
  Package,
  Star,
} from 'lucide-react';

interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  ratings: number;
  numReviews: number;
  reviews: Review[];
  brand?: string;
  stock: number;
  category?: { _id: string; name: string };
  specifications?: { key: string; value: string }[];
  tags?: string[];
  sold?: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductById(id!);
      setProduct(data);
      setSelectedImage(0);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(id!, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await addReview(id!, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewComment('');
      setReviewRating(5);
      fetchProduct();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const discount = product?.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Product not found</h2>
          <Link to="/products" className="text-amber-600 hover:text-amber-700 mt-2 inline-block">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600">Products</Link>
          <span>/</span>
          <span className="text-slate-700">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === idx ? 'border-amber-400' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.brand && (
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{product.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.ratings} size="md" />
              <span className="text-sm text-slate-500">({product.numReviews} reviews)</span>
              {product.sold ? (
                <span className="text-sm text-green-600 font-medium">{product.sold} sold</span>
              ) : null}
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-xl text-slate-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-1 rounded-md">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-50 rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-slate-50 rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-300 text-slate-900 font-semibold py-3.5 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 p-4 bg-white rounded-xl border border-slate-200">
              {[
                { icon: Truck, label: 'Free Delivery', desc: 'Orders ₹500+' },
                { icon: ShieldCheck, label: 'Warranty', desc: '1 Year' },
                { icon: RefreshCw, label: 'Returns', desc: '30 Days' },
              ].map((badge, idx) => (
                <div key={idx} className="text-center">
                  <badge.icon className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-700">{badge.label}</p>
                  <p className="text-xs text-slate-500">{badge.desc}</p>
                </div>
              ))}
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-900 mb-3">Specifications</h3>
                <div className="bg-white rounded-xl border border-slate-200 divide-y">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex justify-between px-4 py-3">
                      <span className="text-sm text-slate-500">{spec.key}</span>
                      <span className="text-sm font-medium text-slate-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Customer Reviews ({product.numReviews})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
                <h3 className="font-semibold text-slate-900 mb-4">Write a Review</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Your Rating</label>
                      <StarRating
                        rating={reviewRating}
                        size="lg"
                        interactive
                        onRate={setReviewRating}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">Your Review</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm mb-3">Login to write a review</p>
                    <Link
                      to="/login"
                      className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium px-6 py-2 rounded-lg text-sm"
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-700 font-bold text-sm">
                            {review.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{review.name}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
