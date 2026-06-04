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
        const businesses = data
          .filter(b => b.featured)
          .sort((a, b) => a.name === 'Apinke Herbs' ? -1 : b.name === 'Apinke Herbs' ? 1 : 0);

        data
          .sort((a, b) => a.name === 'Apinke Herbs' ? -1 : b.name === 'Apinke Herbs' ? 1 : 0)
          .forEach(biz => {
            biz.products.forEach(prod => {
              if (prod.featured) products.push({ ...prod, business_slug: biz.slug, business_name: biz.name });
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
          <h1>Shop WhatsApp<br /><span style={{ color: 'var(--accent)' }}>Stores</span> Seamlessly.</h1>
          <p>Browse local businesses, sync products from their WhatsApp catalog, and checkout — all in one place.</p>
          <div className="btn-group" style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/businesses" className="btn btn-primary btn-large">Explore Shops <ArrowRight size={20} /></Link>
            <Link to="/how-it-works" className="btn btn-outline btn-large">How it Works</Link>
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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Featured Products</h2>
              <p style={{ color: 'var(--text-muted)' }}>Handpicked items from our top-rated businesses.</p>
            </div>
            <Link to="/businesses" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              <p>Loading products...</p>
            ) : (
              featuredProducts.map(product => (
                <Link to={`/business/${product.business_slug}`} key={product.code} className="prod-card animate-fade" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="prod-img-wrapper">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="prod-info">
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>{product.business_name}</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="prod-price">₦{product.price.toLocaleString()}</div>
                      <div className="btn btn-primary" style={{ padding: '0.4rem 0.75rem' }}><ShoppingBag size={16} /></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Shop by Category</h2>
          <div className="categories-grid">
            {[
              { name: 'Wellness', icon: <Star size={28} />, color: '#ECFDF5', count: '15+ Stores' },
              { name: 'Fitness', icon: <Dumbbell size={28} />, color: '#F5F3FF', count: '8+ Stores' },
              { name: 'Fashion', icon: <ShoppingBag size={28} />, color: '#FFF7ED', count: '25+ Stores' },
              { name: 'Beauty', icon: <Sparkles size={28} />, color: '#FEF2F2', count: '12+ Stores' },
              { name: 'Electronics', icon: <TrendingUp size={28} />, color: '#F0F9FF', count: '18+ Stores' },
              { name: 'Groceries', icon: <Star size={28} />, color: '#F0FDF4', count: '10+ Stores' },
            ].map(cat => (
              <Link to={`/businesses?category=${cat.name}`} key={cat.name} className="category-card" style={{ backgroundColor: cat.color }}>
                <div style={{ color: 'var(--accent)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>{cat.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{cat.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sync Section */}
      <section className="section-padding" style={{ background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Instant Sync</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.5rem' }}>Have a Product Link?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Paste any WhatsApp catalog link or product ID to sync it instantly.</p>
          </div>
          <SyncStation onProductSynced={handleManualSync} />
          {syncedResults.length > 0 && (
            <div className="animate-fade" style={{ marginTop: '2rem' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Ready to Add</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
                {syncedResults.map((product, idx) => (
                  <div key={`${product.code}-${idx}`} style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--accent)', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                      <p style={{ color: 'var(--accent)', fontWeight: 800, marginBottom: '0.75rem' }}>₦{product.price.toLocaleString()}</p>
                      <button onClick={() => handleAddToCart(product)} className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem' }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Businesses */}
      <section className="section-padding" style={{ background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Top Rated Businesses</h2>
          <div className="business-grid" style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
            {featuredBusinesses.map(biz => (
              <Link to={`/business/${biz.slug}`} key={biz.id || biz._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid #E5E7EB', transition: 'transform 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-xl)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}>
                  {/* Banner image — fixed height, fully contained */}
                  <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img src={biz.hero_image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                  </div>
                  {/* Card body */}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <img src={biz.logo} alt={biz.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div className="biz-card-category">{biz.category}</div>
                        <h3 style={{ fontSize: '1.05rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{biz.name}</h3>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {biz.description}
                    </p>
                    <div className="btn btn-outline" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', fontSize: '0.875rem' }}>View Store</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
