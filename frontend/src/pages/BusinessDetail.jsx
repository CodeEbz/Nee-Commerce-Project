import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Package, ShoppingBag, Info, Zap, Plus, Star, MapPin, Clock } from 'lucide-react';
import SyncStation from '../components/SyncStation';

export default function BusinessDetail({ onProductSynced }) {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
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

        let response;
        try {
          response = await fetchWithTimeout('http://127.0.0.1:8000/businesses');
        } catch (e) {
          try {
            console.warn('Port 8000 failed, trying 8001...');
            response = await fetchWithTimeout('http://127.0.0.1:8001/businesses');
          } catch (e2) {
            console.warn('Port 8001 failed, trying 8002...');
            response = await fetchWithTimeout('http://127.0.0.1:8002/businesses');
          }
        }

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const found = data.find(biz => biz.slug === slug);
        setBusiness(found);
      } catch (err) {
        console.error("Failed to fetch business", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleManualSync = (product) => {
    setSyncedResults(prev => [product, ...prev]);
  };

  const handleAddToCart = (product) => {
    onProductSynced(product);
    setSyncedResults(prev => prev.filter(p => p.code !== product.code || p.whatsapp_id !== product.whatsapp_id));
  };

  if (loading) return (
    <div className="loading-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        Loading Store Details...
      </div>
    </div>
  );

  if (!business) return (
    <div className="error-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <h2 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Store Not Found</h2>
        <Link to="/businesses" className="btn btn-primary">Browse All Stores</Link>
      </div>
    </div>
  );

  return (
    <div className="business-detail-page">
      {/* Enhanced Header */}
      <header className="biz-header" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${business.hero_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px'
      }}>
        <div className="biz-header-overlay">
          <div className="app-container" style={{ width: '100%' }}>
            <Link to="/businesses" style={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '2rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(10px)',
              width: 'fit-content',
              transition: 'all 0.3s ease'
            }}>
              <ArrowLeft size={18} /> Back to Directory
            </Link>

            <div className="biz-profile">
              <img src={business.logo} alt={business.name} className="biz-logo-lg" style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }} />
              <div className="biz-info-text">
                <div className="badge" style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60A5FA',
                  marginBottom: '1rem',
                  display: 'inline-block',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  {business.category || 'Local Business'}
                </div>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {business.name}
                </h1>
                <p style={{
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '600px',
                  margin: '0 0 2rem',
                  fontSize: '1.125rem',
                  lineHeight: 1.6,
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                }}>
                  {business.description}
                </p>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                    <Star size={18} fill="#F59E0B" color="#F59E0B" />
                    <span>4.9 Rating</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                    <MapPin size={18} />
                    <span>Lagos, NG</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Zap size={18} color="#10B981" />
                    <span style={{ color: '#10B981' }}>Sync Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="app-container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', padding: '4rem 2rem' }}>
        <main>
          {/* Enhanced Step 1 */}
          <section className="glass" style={{
            padding: '3rem',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '3rem',
            border: '2px solid var(--accent)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'var(--accent)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>1</div>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Browse WhatsApp Catalog</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Visit our official WhatsApp Business catalog to see all available products with real-time pricing and availability. Find what you love and copy the product link.
            </p>
            <a href={business.whatsapp_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large" style={{
              width: '100%',
              justifyContent: 'center',
              background: '#25D366',
              fontSize: '1.125rem',
              padding: '1.25rem 2rem'
            }}>
              <ExternalLink size={22} /> Open WhatsApp Catalog
            </a>
          </section>

          {/* Enhanced Step 2 */}
          <section id="sync-section" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                background: '#F59E0B',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>2</div>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Sync Your Selection</h2>
            </div>
            <SyncStation onProductSynced={handleManualSync} />
          </section>

          {/* Enhanced Step 3 */}
          {syncedResults.length > 0 && (
            <section className="animate-fade" style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                  background: '#10B981',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>3</div>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Confirm & Add to Cart</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {syncedResults.map((product, idx) => (
                  <div key={`${product.code}-${idx}`} className="prod-card glass" style={{
                    border: '2px solid #10B981',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))'
                  }}>
                    <div className="prod-img-wrapper">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="prod-info">
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{product.description}</p>
                      <div className="prod-price" style={{ margin: '1rem 0', fontSize: '1.5rem' }}>₦{product.price.toLocaleString()}</div>
                      <button onClick={() => handleAddToCart(product)} className="btn btn-primary" style={{
                        width: '100%',
                        background: '#10B981',
                        fontSize: '1rem',
                        padding: '0.75rem'
                      }}>
                        <ShoppingBag size={18} /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Enhanced Store Showcase */}
          <section>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Store Showcase</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Preview of available products. Use the sync station above to add items to your cart.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
              {business.products.map(product => (
                <div key={product.code} className="prod-card" style={{ opacity: 0.9 }}>
                  <div className="prod-img-wrapper" style={{ height: '200px' }}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="prod-info" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{product.description}</p>
                    <div className="prod-price" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>₦{product.price.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>ID: {product.whatsapp_id || product.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Enhanced Sidebar */}
        <aside>
          <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Store Info */}
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Store Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} color="var(--accent)" />
                  <span>Open 24/7</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={16} color="var(--accent)" />
                  <span>{business.products.length} Products Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Zap size={16} color="#10B981" />
                  <span style={{ color: '#10B981' }}>Instant Sync Enabled</span>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Shop Policies</h3>
              <ul style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></div>
                  <span>7-day return policy</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></div>
                  <span>Secure payment processing</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></div>
                  <span>Fast delivery available</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></div>
                  <span>Customer support 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
