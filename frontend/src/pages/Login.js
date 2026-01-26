import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-12">
            <Link to="/" className="font-serif text-3xl text-[#1A1A1A]">
              ATELIER
            </Link>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-4">
            Welcome Back
          </h1>
          <p className="text-[#666666] mb-10">
            Sign in to your account to continue shopping.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                placeholder="you@example.com"
                data-testid="login-email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0 pr-12"
                  placeholder="••••••••"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 rounded-none uppercase tracking-widest text-xs font-semibold"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-[#666666]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1A1A1A] font-medium hover:underline" data-testid="register-link">
              Create Account
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-12 p-6 bg-[#F0F0F0]">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#666666] mb-3">
              Demo Admin Account
            </p>
            <p className="text-sm text-[#1A1A1A]">Email: admin@atelier.com</p>
            <p className="text-sm text-[#1A1A1A]">Password: admin123</p>
          </div>
        </div>
      </div>

      {/* Right - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:flex-1 bg-[#F0F0F0]">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
