import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ShoppingBag, X, CreditCard, User, Mail, Phone } from 'lucide-react'
import './index.css'
import Landing from './pages/Landing'
import Businesses from './pages/Businesses'
import BusinessDetail from './pages/BusinessDetail'
import Admin from './pages/Admin'
import Header from './components/Header'

function App() {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.code === product.code);
    if (existingItem) {
      setCart(cart.map(item =>
        item.code === product.code
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`✅ Added ${product.name} to your cart!`);
  };

  const removeFromCart = (productCode) => {
    setCart(cart.filter(item => item.code !== productCode));
  };

  const updateQuantity = (productCode, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productCode);
      return;
    }
    setCart(cart.map(item =>
      item.code === productCode
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (customerData) => {
    setCheckoutLoading(true);
    try {
      const checkoutData = {
        ...customerData,
        items: cart,
        total_amount: getTotalAmount(),
        payment_method: "card"
      };

      const response = await fetch('http://localhost:8000/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`🎉 Order successful! Order ID: ${result.order_id}`);
        setCart([]);
        setShowCheckout(false);
      } else {
        throw new Error('Checkout failed');
      }
    } catch (error) {
      alert('❌ Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Header
          cart={cart}
          onShowCheckout={() => setShowCheckout(true)}
          totalAmount={getTotalAmount()}
        />

        {/* Checkout Modal */}

        {/* Checkout Modal */}
        {showCheckout && (
          <CheckoutModal
            cart={cart}
            onClose={() => setShowCheckout(false)}
            onCheckout={handleCheckout}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            loading={checkoutLoading}
            total={getTotalAmount()}
          />
        )}

        <Routes>
          <Route path="/" element={<Landing cart={cart} onProductSynced={addToCart} />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/business/:slug" element={<BusinessDetail onProductSynced={addToCart} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  )
}

// Checkout Modal Component
function CheckoutModal({ cart, onClose, onCheckout, onUpdateQuantity, onRemoveItem, loading, total }) {
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerData.customer_name || !customerData.customer_email || !customerData.customer_phone) {
      alert('Please fill in all required fields');
      return;
    }
    onCheckout(customerData);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '2rem'
    }}>
      <div className="glass" style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Checkout</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Your Items</h3>
          {cart.map(item => (
            <div key={item.code} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: '1px solid #E5E7EB',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.5rem'
            }}>
              <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{item.business_name}</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>₦{item.price.toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => onUpdateQuantity(item.code, item.quantity - 1)} style={{ width: '30px', height: '30px', border: '1px solid #E5E7EB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.code, item.quantity + 1)} style={{ width: '30px', height: '30px', border: '1px solid #E5E7EB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                <button onClick={() => onRemoveItem(item.code)} style={{ marginLeft: '0.5rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Form */}
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1rem' }}>Customer Information</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={customerData.customer_name}
                onChange={(e) => setCustomerData({ ...customerData, customer_name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', outline: 'none' }}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={customerData.customer_email}
                onChange={(e) => setCustomerData({ ...customerData, customer_email: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', outline: 'none' }}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone Number *</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                value={customerData.customer_phone}
                onChange={(e) => setCustomerData({ ...customerData, customer_phone: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', outline: 'none' }}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          {/* Total and Submit */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>₦{total.toLocaleString()}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : (
                <><CreditCard size={20} /> Complete Order - ₦{total.toLocaleString()}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App
