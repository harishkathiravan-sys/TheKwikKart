import { Link } from 'react-router';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { formatPrice, truncateText } from '@/utils/helpers';

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  ratings: number;
  numReviews: number;
  discount?: number;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group">
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-slate-50">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Heart className="w-4 h-4 text-slate-600 hover:text-red-500" />
        </button>
      </Link>

      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{product.brand}</p>
        )}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-medium text-slate-900 mt-1 hover:text-amber-600 transition-colors">
            {truncateText(product.name, 50)}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(product.ratings || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">({product.numReviews || 0})</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-slate-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product._id)}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-2 rounded-lg transition-colors text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
