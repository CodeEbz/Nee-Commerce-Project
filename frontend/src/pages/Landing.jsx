import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Zap, Star, TrendingUp, Dumbbell, Sparkles } from 'lucide-react';
import SyncStation from '../components/SyncStation';
import { API_URL } from '../config';

export default function Landing({ onProductSynced }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncedResults, setSyncedResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return res;
          } catch (error) {
            clearTimeout(id);
            throw error;
          }
        };

        const response = await fetchWithTimeout(`${API_URL}/businesses`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const products = [];
        const businesses = data.filter(b => b.featured);

        data.forEach(biz => {
          biz.products.forEach(prod => {
            if (prod.featured) {
              products.push({ ...prod, business_slug: biz.slug, business_name: biz.name });
            }
          });
        });

        setFeaturedProducts(products.slice(0, 4));
        setFeaturedBusinesses(businesses.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch data for landing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleManualSync = (product) => {
    setSyncedResults(prev => [product, ...prev]);
  };

  const handleAddToCart = (product) => {
    onProductSynced(product);
    setSyncedResults(prev => prev.filter(p => p.code !== product.code));
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text animate-fade">
          <div className="badge badge-accent" style={{ marginBottom: '1rem', display: 'inline-block' }}>New Way to Shop</div>
          <h1>
            Your Favorite <br />
            <span style={{ color: 'var(--accent)' }}>WhatsApp Stores</span>, <br />
            Now Synchronized.
          </h1>
          <p>
            The bridge between social browsing and secure checkout.
            Discover amazing local brands and complete your purchase seamlessly.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/businesses" className="btn btn-primary btn-large">
              Explore Shops <ArrowRight size={20} />
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-large">
              How it Works
            </Link>
          </div>
        </div>
        <div className="hero-image animate-fade" style={{ animationDelay: '0.2s' }}>
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200" alt="Premium Marketplace" />
          <div className="glass" style={{ position: 'absolute', bottom: '20px', left: '-20px', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Fast Sync</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Add items in seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Featured Products</h2>
            <p style={{ color: 'var(--text-muted)' }}>Handpicked items from our top-rated businesses.</p>
          </div>
          <Link to="/businesses" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            featuredProducts.map(product => (
              <div key={product.code} className="prod-card animate-fade">
                <div className="prod-img-wrapper">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="prod-info">
                  <div style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>{product.business_name}</div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="prod-price">₦{product.price.toLocaleString()}</div>
                    <Link to={`/business/${product.business_slug}`} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                      <ShoppingBag size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Shop by Category</h2>
        <div className="categories-grid" style={{ marginTop: '3rem' }}>
          {[
            { name: 'Wellness', icon: <Star size={32} />, color: '#ECFDF5', count: '15+ Stores' },
            { name: 'Fitness', icon: <Dumbbell size={32} />, color: '#F5F3FF', count: '8+ Stores' },
            { name: 'Fashion', icon: <ShoppingBag size={32} />, color: '#FFF7ED', count: '25+ Stores' },
            { name: 'Beauty', icon: <Sparkles size={32} />, color: '#FEF2F2', count: '12+ Stores' },
            { name: 'Electronics', icon: <TrendingUp size={32} />, color: '#F0F9FF', count: '18+ Stores' },
            { name: 'Groceries', icon: <Star size={32} />, color: '#F0FDF4', count: '10+ Stores' },
          ].map(cat => (
            <div key={cat.name} className="category-card" style={{ backgroundColor: cat.color }}>
              <div style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{cat.icon}</div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sync Section - The Problem Solver */}
      <section className="section-padding" style={{ background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
        <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem', borderRadius: 'var(--radius-xl)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>Instant Sync</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Have a Product ID?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Paste any WhatsApp Catalog link or Product ID below to sync it instantly to your bag.</p>
          </div>

          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <SyncStation onProductSynced={handleManualSync} />
          </div>

          {syncedResults.length > 0 && (
            <div className="animate-fade" style={{ marginTop: '4rem' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Ready to Add</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {syncedResults.map((product, idx) => (
                  <div key={`${product.code}-${idx}`} className="prod-card glass" style={{ border: '2px solid var(--accent)' }}>
                    <div className="prod-img-wrapper">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="prod-info">
                      <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
                      <div className="prod-price" style={{ margin: '0.5rem 0' }}>₦{product.price.toLocaleString()}</div>
                      <button onClick={() => handleAddToCart(product)} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Confirm & Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)', opacity: 0.1, pointerEvents: 'none' }}></div>
      </section>

      {/* Top Businesses */}
      <section className="section-padding">
        <h2 className="section-title" style={{ textAlign: 'center' }}>Top Rated Businesses</h2>
        <div className="business-grid" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {featuredBusinesses.map(biz => (
            <Link to={`/business/${biz.slug}`} key={biz.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="biz-card">
                <div className="biz-card-banner">
                  <img src={biz.hero_image} alt={biz.name} />
                  <img src={biz.logo} alt={biz.name} className="biz-card-logo" />
                </div>
                <div className="biz-card-body">
                  <div className="biz-card-category">{biz.category}</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{biz.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {biz.description}
                  </p>
                  <div className="btn btn-outline" style={{ width: '100%' }}>View Store</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--primary)', color: 'white', padding: '3rem 2rem 2rem', textAlign: 'center' }}>
        <div className="app-container">
          <h3 style={{ marginBottom: '1rem' }}>Nee Commerce</h3>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Bridging WhatsApp Business with seamless e-commerce</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <Link to="/businesses" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Browse Stores</Link>
            <Link to="/merchant" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Merchant Dashboard</Link>
            <Link to="/admin" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Admin Dashboard</Link>
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', opacity: 0.6 }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>&copy; 2024 Nee Commerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
