import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white" data-testid="main-footer">
      <div className="px-6 md:px-12 lg:px-24 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-3xl mb-6">ATELIER</h3>
            <p className="text-[#999999] text-sm leading-relaxed">
              Curated minimalism for the modern individual. Timeless pieces crafted with intention.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">Shop</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/shop?category=Shirts" className="text-[#999999] hover:text-white text-sm transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=T-Shirts" className="text-[#999999] hover:text-white text-sm transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Outerwear" className="text-[#999999] hover:text-white text-sm transition-colors">
                  Outerwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Knitwear" className="text-[#999999] hover:text-white text-sm transition-colors">
                  Knitwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="text-[#999999] hover:text-white text-sm transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">Information</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-[#999999] hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#999999] hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-[#999999] text-sm">Shipping Info</span>
              </li>
              <li>
                <span className="text-[#999999] text-sm">Returns</span>
              </li>
              <li>
                <span className="text-[#999999] text-sm">Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">Newsletter</h4>
            <p className="text-[#999999] text-sm mb-6">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-b border-[#444444] py-3 text-sm placeholder:text-[#666666] focus:border-white focus:outline-none transition-colors"
                data-testid="newsletter-email-input"
              />
              <button
                type="submit"
                className="bg-white text-[#1A1A1A] h-12 px-6 uppercase tracking-widest text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
                data-testid="newsletter-submit-btn"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#333333] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#666666] text-xs">
            © {new Date().getFullYear()} ATELIER. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[#666666] text-xs">Instagram</span>
            <span className="text-[#666666] text-xs">Pinterest</span>
            <span className="text-[#666666] text-xs">Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
