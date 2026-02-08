import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, ArrowLeft } from 'lucide-react';

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to fetch businesses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBusinesses = businesses.filter(biz =>
    biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (biz.category && biz.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="businesses-page">
      <section className="section-padding" style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>

        <h1 className="animate-fade" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Discover Local Shops</h1>
        <p className="animate-fade" style={{ opacity: 0.8, fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', marginInline: 'auto' }}>
          Browse curated businesses and sync products directly from their WhatsApp catalogs.
        </p>

        <div className="glass animate-fade" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0.25rem 1.5rem', borderRadius: 'var(--radius-full)' }}>
          <Search size={22} color="rgba(255,255,255,0.6)" />
          <input
            type="text"
            placeholder="Search shops or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', padding: '1rem', color: 'white', fontSize: '1.125rem', outline: 'none' }}
          />
        </div>
      </section>

      <div className="app-container section-padding">
        {loading ? (
          <div className="loading-state">Loading amazing shops...</div>
        ) : (
          <div className="business-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '3rem' }}>
            {filteredBusinesses.map(biz => (
              <Link to={`/business/${biz.slug}`} key={biz.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="biz-card animate-fade">
                  <div className="biz-card-banner">
                    <img src={biz.hero_image} alt={biz.name} />
                    <img src={biz.logo} alt={biz.name} className="biz-card-logo" />
                  </div>
                  <div className="biz-card-body">
                    <div className="biz-card-category">{biz.category || 'General'}</div>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{biz.name}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: 1.6 }}>
                      {biz.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={16} fill="#F59E0B" color="#F59E0B" />
                        4.9 (120+ reviews)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={16} />
                        Lagos, NG
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
