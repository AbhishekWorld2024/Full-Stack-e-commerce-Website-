import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="text-gray-600 mb-4">Please login to view your profile.</p>
          <Link to="/login"><Button>Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="bg-white border rounded p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              {user.is_admin && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Username</label>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Member Since</label>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/orders" className="border rounded p-4 hover:bg-gray-50">
            <h3 className="font-semibold">My Orders</h3>
            <p className="text-sm text-gray-500">View order history</p>
          </Link>
          <Link to="/cart" className="border rounded p-4 hover:bg-gray-50">
            <h3 className="font-semibold">Cart</h3>
            <p className="text-sm text-gray-500">View cart items</p>
          </Link>
        </div>

        <Button onClick={logout} variant="outline" className="w-full" data-testid="profile-logout-btn">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
