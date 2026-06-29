import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Package,
  LayoutDashboard,
  ChevronDown,
  Store,
} from 'lucide-react';

interface NavbarProps {
  cartCount: number;
}

export default function Navbar({ cartCount }: NavbarProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Store className="w-8 h-8 text-amber-400" />
            <span className="text-xl font-bold hidden sm:block">KwikKart</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and more..."
                className="w-full py-2 pl-4 pr-12 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-amber-400 rounded-md hover:bg-amber-500 transition-colors"
              >
                <Search className="w-4 h-4 text-slate-900" />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-slate-900 rounded-lg shadow-xl border">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-t-lg"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4" />
                      <span className="text-sm">My Orders</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 w-full text-left rounded-b-lg text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Login</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm hidden lg:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-amber-400 font-medium">{user?.name}</div>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg">
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({cartCount})</span>
                </Link>
                <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg w-full text-red-400">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg">
                  <User className="w-5 h-5" />
                  <span>Login / Register</span>
                </Link>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({cartCount})</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
