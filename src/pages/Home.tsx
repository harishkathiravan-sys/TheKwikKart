import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getFeaturedProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { addToCart } from '@/api/cart';
import ProductCard from '@/components/product/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  ChevronRight,
  Zap,
  Tag,
  Clock,
  Award,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  ratings: number;
  numReviews: number;
  brand?: string;
  category?: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
  image: string;
  slug: string;
}

const categoryFallbackImages: Record<string, string> = {
  Electronics: '/product-headphones.jpg',
  'Home & Living': '/product-laptop.jpg',
  Fashion: '/product-shoes.jpg',
  'Sports & Fitness': '/product-watch.jpg',
  Books: '/product-wallet.jpg',
  'Beauty & Health': '/product-skincare.jpg',
  'Toys & Games': '/product-speaker.jpg',
  Automotive: '/product-bottle.jpg',
};

const getCategoryFallbackImage = (name: string) =>
  categoryFallbackImages[name] || 'https://via.placeholder.com/400x300?text=KwikKart';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getFeaturedProducts(),
        getCategories(),
      ]);
      setFeaturedProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart!');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-banner.jpg')] bg-cover bg-center opacity-30" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Summer Sale Live Now
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Up to <span className="text-amber-400">70% Off</span> on Everything
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Discover amazing deals on electronics, fashion, home essentials and more. Free shipping on orders over ₹500.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/products?sort=bestselling"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl backdrop-blur-sm transition-colors"
              >
                Best Sellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹500' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
          <Link to="/products" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3]"
            >
              <img
                src={category.image || getCategoryFallbackImage(category.name)}
                alt={category.name}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = getCategoryFallbackImage(category.name);
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-semibold">{category.name}</h3>
                <p className="text-white/70 text-xs">Explore now</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 text-sm mt-1">Handpicked deals just for you</p>
          </div>
          <Link to="/products?sort=bestselling" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Promo Banners */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Tag,
              title: 'Mega Deals',
              desc: 'Up to 60% off on top brands',
              color: 'from-red-500 to-rose-600',
              link: '/products?sort=price_asc',
            },
            {
              icon: Clock,
              title: 'Flash Sale',
              desc: 'Limited time offers daily',
              color: 'from-amber-500 to-orange-600',
              link: '/products?sort=newest',
            },
            {
              icon: Award,
              title: 'Premium Collection',
              desc: 'Curated luxury items',
              color: 'from-slate-700 to-slate-900',
              link: '/products?sort=rating',
            },
          ].map((promo, idx) => (
            <Link
              key={idx}
              to={promo.link}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${promo.color} p-6 text-white group`}
            >
              <div className="relative z-10">
                <promo.icon className="w-10 h-10 mb-3 opacity-80" />
                <h3 className="text-xl font-bold">{promo.title}</h3>
                <p className="text-white/80 text-sm mt-1">{promo.desc}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium group-hover:gap-2 transition-all">
                  Explore <ChevronRight className="w-4 h-4" />
                </span>
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Subscribe to Our Newsletter</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Get exclusive deals, new arrivals, and special offers delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
