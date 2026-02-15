import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, ChevronRight, Menu, X, User as UserIcon, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const Logo = ({ size = 40 }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    background: 'var(--primary)',
    borderRadius: '10px',
    padding: '4px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
  }}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 75V25L50 50L75 25V75" stroke="#3B82F6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 25C40 18 44.5 12 50 12C55.5 12 60 18 60 25" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  </div>
);

const Header = ({ cart, onShowCheckout, totalAmount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
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
          <Logo size={40} />
          <span className="logo-text">Nee Commerce</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/businesses" className={`nav-link ${location.pathname === '/businesses' ? 'active' : ''}`}>Explore</Link>
          {user ? (
            <Link to="/merchant" className={`nav-link ${location.pathname === '/merchant' ? 'active' : ''}`}>Dashboard</Link>
          ) : (
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Merchant Login</Link>
          )}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* User Section (Desktop) */}
          {user && (
            <div className="user-nav-item desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.nickname || user.full_name.split(' ')[0]}</div>
                <button
                  onClick={logout}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <LogOut size={12} /> Logout
                </button>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {user.full_name[0]}
              </div>
            </div>
          )}

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
            {user ? (
              <>
                <Link to="/merchant" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Merchant Dashboard <ChevronRight size={16} /></Link>
                <div className="mobile-nav-link" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ color: '#EF4444' }}>Logout <LogOut size={16} /></div>
              </>
            ) : (
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Merchant Login <ChevronRight size={16} /></Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
