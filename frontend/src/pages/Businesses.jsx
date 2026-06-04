import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import { API_URL } from '../config';

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(window.location.search).get('category') || '');

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
      <section style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center', padding: 'clamp(3rem, 8vw, 5rem) 1.25rem 3rem' }}>
        <h1 className="animate-fade" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', marginBottom: '0.75rem' }}>Discover Local Shops</h1>
        <p className="animate-fade" style={{ opacity: 0.8, fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', marginBottom: '2rem', maxWidth: '500px', marginInline: 'auto', lineHeight: 1.6 }}>
          Browse curated WhatsApp businesses and sync products directly to your cart.
        </p>
        <div className="glass animate-fade" style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0.25rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
          <Search size={20} color="rgba(255,255,255,0.6)" />
          <input
            type="text"
            placeholder="Search shops or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', padding: '0.85rem', color: 'white', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 3rem)' }}>
        {loading ? (
          <div className="loading-state">Loading shops...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
            {filteredBusinesses.map(biz => (
              <Link to={`/business/${biz.slug}`} key={biz.id || biz._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="biz-card animate-fade">
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img src={biz.hero_image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '1.25rem', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <img src={biz.logo} alt={biz.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }} />
                      <div>
                        <div className="biz-card-category">{biz.category || 'General'}</div>
                        <h3 style={{ fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>{biz.name}</h3>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {biz.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Star size={13} fill="#F59E0B" color="#F59E0B" /> 4.9 · <MapPin size={13} /> Lagos
                      </div>
                      <span className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View Store</span>
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
