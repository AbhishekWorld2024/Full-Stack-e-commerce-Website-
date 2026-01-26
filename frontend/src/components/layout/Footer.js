import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8" data-testid="main-footer">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FashionStore</h3>
            <p className="text-gray-400 text-sm">
              Quality fashion at affordable prices.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-white">Shop</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/shop?category=Shirts" className="hover:text-white">Shirts</Link></li>
              <li><Link to="/shop?category=T-Shirts" className="hover:text-white">T-Shirts</Link></li>
              <li><Link to="/shop?category=Outerwear" className="hover:text-white">Outerwear</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} FashionStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
