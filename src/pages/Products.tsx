import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { addToCart } from '@/api/cart';
import ProductCard from '@/components/product/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
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
}

export default function Products() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const data = await getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const updateFilter = (key: string, value: string | number) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 });
    setSearchParams(new URLSearchParams());
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

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
            <p className="text-sm text-slate-500 mt-1">{total} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-amber-400 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-amber-400 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="bestselling">Best Selling</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category}
                      onChange={() => updateFilter('category', '')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-sm text-slate-600">All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat._id}
                        onChange={() => updateFilter('category', cat._id)}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <span className="text-sm text-slate-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
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
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 mb-4">No products found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateFilter('page', i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      filters.page === i + 1
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-white border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
