import { Link } from 'react-router';
import { Store, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-8 h-8 text-amber-400" />
              <span className="text-xl font-bold text-white">KwikKart</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Your one-stop destination for all your shopping needs. Quality products, great prices, and fast delivery.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>support@kwikkart.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+91 1800 123 4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-sm hover:text-amber-400 transition-colors">All Products</Link></li>
              <li><Link to="/cart" className="text-sm hover:text-amber-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="text-sm hover:text-amber-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=electronics" className="text-sm hover:text-amber-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="text-sm hover:text-amber-400 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=home" className="text-sm hover:text-amber-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=sports" className="text-sm hover:text-amber-400 transition-colors">Sports & Fitness</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><span className="text-sm">About Us</span></li>
              <li><span className="text-sm">Contact Us</span></li>
              <li><span className="text-sm">Privacy Policy</span></li>
              <li><span className="text-sm">Terms & Conditions</span></li>
              <li><span className="text-sm">Return Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} KwikKart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
