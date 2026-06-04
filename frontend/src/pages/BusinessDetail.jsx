import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShoppingBag, Zap, Star, MapPin, Clock, Package } from 'lucide-react';
import SyncStation from '../components/SyncStation';
import { API_URL } from '../config';

const Step = ({ number, color, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
    <div style={{
      background: color, color: 'white', width: '32px', height: '32px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.9rem'
    }}>{number}</div>
    <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', margin: 0 }}>{title}</h2>
  </div>
);

export default function BusinessDetail({ onProductSynced }) {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncedResults, setSyncedResults] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/businesses`)
      .then(r => r.json())
      .then(data => setBusiness(data.find(b => b.slug === slug) || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleManualSync = (product) => setSyncedResults(prev => [product, ...prev]);
  const handleAddToCart = (product) => {
    onProductSynced(product);
    setSyncedResults(prev => prev.filter(p => p.code !== product.code));
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--accent)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading Store...</p>
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
      {/* ── Hero Banner ── */}
      <div style={{
        position: 'relative',
        height: 'clamp(200px, 38vw, 400px)',
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.72)), url(${business.hero_image}) center/cover no-repeat`,
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(1rem, 4vw, 2.5rem)' }}>
          <Link to="/businesses" style={{
            color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)', width: 'fit-content', marginBottom: '1.25rem',
            fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(8px)'
          }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.6rem, 3vw, 1.25rem)' }}>
            <img src={business.logo} alt={business.name} style={{
              width: 'clamp(52px, 11vw, 80px)', height: 'clamp(52px, 11vw, 80px)',
              borderRadius: '50%', border: '3px solid white', objectFit: 'cover',
              background: 'white', flexShrink: 0
            }} />
            <div>
              <span style={{ background: 'rgba(59,130,246,0.3)', color: '#93C5FD', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>
                {business.category}
              </span>
              <h1 style={{ color: 'white', fontSize: 'clamp(1.25rem, 4.5vw, 2.5rem)', margin: '0.3rem 0 0.4rem', lineHeight: 1.1 }}>
                {business.name}
              </h1>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { icon: <Star size={13} fill="#F59E0B" color="#F59E0B" />, label: '4.9', color: 'rgba(255,255,255,0.85)' },
                  { icon: <MapPin size={13} />, label: 'Lagos, NG', color: 'rgba(255,255,255,0.85)' },
                  { icon: <Zap size={13} />, label: 'Sync Ready', color: '#34D399' },
                ].map(({ icon, label, color }) => (
                  <span key={label} style={{ color, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1rem, 4vw, 2.5rem)' }}>

        {/* On desktop: sidebar on the right. On mobile: everything stacks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: '2rem', alignItems: 'start' }} className="biz-detail-grid">

          {/* ── LEFT / MAIN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Step 1 — WhatsApp Catalog */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 3vw, 1.75rem)', border: '1.5px solid var(--accent)', boxShadow: 'var(--shadow-sm)' }}>
              <Step number="1" color="var(--accent)" title="Browse WhatsApp Catalog" />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
                Open the store's WhatsApp catalog, find a product you like, and copy its link.
              </p>
              <a href={business.whatsapp_link || '#'} target="_blank" rel="noopener noreferrer"
                className="btn" style={{ width: '100%', justifyContent: 'center', background: '#25D366', color: 'white', padding: '0.85rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}>
                <ExternalLink size={17} /> Open WhatsApp Catalog
              </a>
            </div>

            {/* Step 2 — Sync */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 3vw, 1.75rem)', border: '1.5px solid #F59E0B', boxShadow: 'var(--shadow-sm)' }}>
              <Step number="2" color="#F59E0B" title="Sync Your Selection" />
              <SyncStation onProductSynced={handleManualSync} />
            </div>

            {/* Step 3 — Synced Results */}
            {syncedResults.length > 0 && (
              <div className="animate-fade" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 3vw, 1.75rem)', border: '1.5px solid #10B981', boxShadow: 'var(--shadow-sm)' }}>
                <Step number="3" color="#10B981" title="Add to Cart" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {syncedResults.map((product, idx) => (
                    <div key={`${product.code}-${idx}`} style={{ background: '#F0FDF4', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #BBF7D0' }}>
                      <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '0.75rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{product.name}</p>
                        <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>₦{product.price.toLocaleString()}</p>
                        <button onClick={() => handleAddToCart(product)} className="btn btn-primary"
                          style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem', background: '#10B981' }}>
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Store Showcase */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 3vw, 1.75rem)', border: '1px solid #E5E7EB', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.35rem)', marginBottom: '0.35rem' }}>Store Showcase</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Sync any product ID above to add it to your cart.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {business.products.map(product => (
                  <div key={product.code} style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem', lineHeight: 1.3 }}>{product.name}</p>
                      <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>₦{product.price.toLocaleString()}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {product.whatsapp_id || product.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT / SIDEBAR ── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="biz-sidebar">
            <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Store Info */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #E5E7EB', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>Store Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Clock size={15} color="var(--accent)" /><span>Open 24/7</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Package size={15} color="var(--accent)" /><span>{business.products.length} Products Available</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Zap size={15} color="#10B981" /><span style={{ color: '#10B981', fontWeight: 600 }}>Sync Verified</span></div>
                </div>
              </div>
              {/* Policies */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #E5E7EB', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>Shop Policies</h3>
                <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.875rem' }}>
                  {['7-day return policy', 'Secure payments', 'Fast delivery', '24/7 support'].map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', flexShrink: 0 }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .biz-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .biz-sidebar > div {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
