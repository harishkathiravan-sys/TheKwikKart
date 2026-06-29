import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { login as loginApi, register as registerApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Store, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface FormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isRegister) {
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = await registerApi(data.name!, data.email, data.password);
        login(result.token, {
          _id: result._id,
          name: result.name,
          email: result.email,
          role: result.role,
          avatar: result.avatar,
        });
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        const result = await loginApi(data.email, data.password);
        login(result.token, {
          _id: result._id,
          name: result.name,
          email: result.email,
          role: result.role,
          avatar: result.avatar,
        });
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Store className="w-10 h-10 text-amber-500" />
            <span className="text-2xl font-bold text-slate-900">KwikKart</span>
          </Link>
          <p className="text-slate-500 mt-2">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('name', { required: isRegister })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">Name is required</p>}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-600 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">Email is required</p>}
            </div>

            <div>
              <label className="text-sm text-slate-600 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true, minLength: 6 })}
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { required: isRegister })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="text-right">
                <span className="text-sm text-amber-600 hover:text-amber-700 cursor-pointer">
                  Forgot password?
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@shopmart.com');
                  setValue('password', 'admin123');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg transition-colors"
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'john@example.com');
                  setValue('password', 'user123');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg transition-colors"
              >
                User Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
