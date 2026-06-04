import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShoppingBag, Zap, Star, MapPin, Clock, Package } from 'lucide-react';
import SyncStation from '../components/SyncStation';
import { API_URL } from '../config';

export default function BusinessDetail({ onProductSynced }) {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncedResults, setSyncedResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/businesses`);
        const data = await res.json();
        setBusiness(data.find(b => b.slug === slug) || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleManualSync = (product) => setSyncedResults(prev => [product, ...prev]);
  const handleAddToCart = (product) => {
    onProductSynced(product);
    setSyncedResults(prev => prev.filter(p => p.code !== product.code));
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading Store...</p>
      </div>
    </div>
  );

  if (!business) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <h2 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Store Not Found</h2>
        <Link to="/businesses" className="btn btn-primary">Browse All Stores</Link>
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        height: 'clamp(220px, 40vw, 420px)',
        background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.7)), url(${business.hero_image}) center/cover no-repeat`,
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(1rem, 4vw, 3rem)' }}>
          <Link to="/businesses" style={{
            color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)', width: 'fit-content', marginBottom: '1.5rem',
            fontSize: '0.9rem', fontWeight: 600, backdropFilter: 'blur(8px)'
          }}>
            <ArrowLeft size={16} /> Back
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 3vw, 1.5rem)', flexWrap: 'wrap' }}>
            <img src={business.logo} alt={business.name} style={{
              width: 'clamp(56px, 12vw, 90px)', height: 'clamp(56px, 12vw, 90px)',
              borderRadius: '50%', border: '3px solid white', objectFit: 'cover',
              background: 'white', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }} />
            <div>
              <span style={{ background: 'rgba(59,130,246,0.25)', color: '#93C5FD', padding: '0.2rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                {business.category}
              </span>
              <h1 style={{ color: 'white', fontSize: 'clamp(1.4rem, 5vw, 2.75rem)', margin: '0.4rem 0 0.5rem', lineHeight: 1.1 }}>
                {business.name}
              </h1>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" /> 4.9
                </span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> Lagos, NG
                </span>
                <span style={{ color: '#34D399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={14} /> Sync Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 3rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: '2.5rem', alignItems: 'start' }} className="biz-detail-grid">

          {/* Main Column */}
          <div>
            {/* Step 1 */}
            <div className="glass" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '2px solid var(--accent)', background: 'linear-gradient(135deg, rgba(59,130,246,0.04), transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', margin: 0 }}>Browse WhatsApp Catalog</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Open the store's WhatsApp catalog, find a product you like, and copy its link.
              </p>
              <a href={business.whatsapp_link || '#'} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#25D366', padding: '0.9rem', fontSize: '1rem' }}>
                <ExternalLink size={18} /> Open WhatsApp Catalog
              </a>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#F59E0B', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', margin: 0 }}>Sync Your Selection</h2>
              </div>
              <SyncStation onProductSynced={handleManualSync} />
            </div>

            {/* Step 3 — synced results */}
            {syncedResults.length > 0 && (
              <div className="animate-fade" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#10B981', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                  <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', margin: 0 }}>Add to Cart</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                  {syncedResults.map((product, idx) => (
                    <div key={`${product.code}-${idx}`} className="prod-card" style={{ border: '2px solid #10B981' }}>
                      <div className="prod-img-wrapper">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="prod-info">
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{product.name}</h3>
                        <div className="prod-price" style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>₦{product.price.toLocaleString()}</div>
                        <button onClick={() => handleAddToCart(product)} className="btn btn-primary" style={{ width: '100%', background: '#10B981', padding: '0.65rem', fontSize: '0.9rem' }}>
                          <ShoppingBag size={16} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Store Showcase */}
            <div>
              <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', marginBottom: '0.5rem' }}>Store Showcase</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Browse available products — sync any item to add it to your cart.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {business.products.map(product => (
                  <div key={product.code} className="prod-card">
                    <div className="prod-img-wrapper">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="prod-info" style={{ padding: '1rem' }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>{product.name}</h3>
                      <div className="prod-price" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>₦{product.price.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>ID: {product.whatsapp_id || product.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Store Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Clock size={15} color="var(--accent)" /> Open 24/7</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Package size={15} color="var(--accent)" /> {business.products.length} Products</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={15} color="#10B981" /><span style={{ color: '#10B981' }}>Sync Verified</span></div>
                </div>
              </div>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Shop Policies</h3>
                <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  {['7-day return policy', 'Secure payments', 'Fast delivery', '24/7 support'].map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', flexShrink: 0 }}></div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
