import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, ChevronRight, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const Header = ({ cart, onShowCheckout, totalAmount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo Section */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">NC</div>
          <span className="logo-text">Nee Commerce</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/businesses" className={`nav-link ${location.pathname === '/businesses' ? 'active' : ''}`}>Explore</Link>
          <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Cart Badge */}
          <div className="cart-badge-trigger" onClick={onShowCheckout}>
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </div>
            <div className="cart-info">
              <span className="cart-label">Cart</span>
              {cartItemCount > 0 && <span className="cart-total">₦{totalAmount.toLocaleString()}</span>}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay animate-fade">
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home <ChevronRight size={16} /></Link>
            <Link to="/businesses" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Explore <ChevronRight size={16} /></Link>
            <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Admin <ChevronRight size={16} /></Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
