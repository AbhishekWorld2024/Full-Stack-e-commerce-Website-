import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <User className="h-16 w-16 text-[#E5E5E5] mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-4">My Profile</h1>
          <p className="text-[#666666] mb-8">Please login to view your profile.</p>
          <Link to="/login">
            <Button className="bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-8 rounded-none uppercase tracking-widest text-xs font-semibold">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen" data-testid="profile-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-16 border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-[#1A1A1A]">
          My Profile
        </h1>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-2xl">
          {/* Profile Info */}
          <div className="bg-white border border-[#E5E5E5] p-8 mb-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-serif">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-[#1A1A1A]">{user.username}</h2>
                {user.is_admin && (
                  <span className="inline-block mt-1 px-3 py-1 text-xs uppercase tracking-widest bg-[#1A1A1A] text-white">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-[#E5E5E5]">
                <User className="h-5 w-5 text-[#666666]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#666666] mb-1">Username</p>
                  <p className="text-[#1A1A1A]">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-[#E5E5E5]">
                <Mail className="h-5 w-5 text-[#666666]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#666666] mb-1">Email</p>
                  <p className="text-[#1A1A1A]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-[#666666]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#666666] mb-1">Member Since</p>
                  <p className="text-[#1A1A1A]">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link to="/orders" className="bg-white border border-[#E5E5E5] p-6 hover:bg-[#F9F9F9] transition-colors">
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">My Orders</h3>
              <p className="text-sm text-[#666666]">View and track your orders</p>
            </Link>
            <Link to="/cart" className="bg-white border border-[#E5E5E5] p-6 hover:bg-[#F9F9F9] transition-colors">
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">Shopping Cart</h3>
              <p className="text-sm text-[#666666]">View items in your cart</p>
            </Link>
          </div>

          {/* Sign Out */}
          <Button
            onClick={logout}
            variant="outline"
            className="w-full border-[#E5E5E5] text-[#666666] hover:bg-[#F0F0F0] hover:text-[#1A1A1A] h-12 rounded-none uppercase tracking-widest text-xs font-semibold"
            data-testid="profile-logout-btn"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
