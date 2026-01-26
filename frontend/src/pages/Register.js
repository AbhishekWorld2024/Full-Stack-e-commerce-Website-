import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:flex-1 bg-[#F0F0F0]">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Fashion Store"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-12">
            <Link to="/" className="font-serif text-3xl text-[#1A1A1A]">
              ATELIER
            </Link>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-4">
            Create Account
          </h1>
          <p className="text-[#666666] mb-10">
            Join us and discover our curated collection.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                placeholder="johndoe"
                data-testid="register-username-input"
              />
            </div>

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
                data-testid="register-email-input"
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
                  data-testid="register-password-input"
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

            <div>
              <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A]">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 h-12 rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] focus:ring-0"
                placeholder="••••••••"
                data-testid="register-confirm-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 rounded-none uppercase tracking-widest text-xs font-semibold"
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-[#666666]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1A1A1A] font-medium hover:underline" data-testid="login-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
