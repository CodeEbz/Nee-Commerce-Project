import { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingBag, Store, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const CATEGORIES = ['All', 'Wellness', 'Beauty', 'Fashion', 'Electronics', 'Fitness', 'Groceries', 'Home & Living', 'Food & Drinks'];

export default function SearchPage({ onProductSynced }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'businesses'
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/businesses`)
      .then(r => r.json())
      .then(data => setAllData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();

  const filteredBusinesses = allData.filter(biz => {
    const matchCat = category === 'All' || biz.category === category;
    const matchQ = !q || biz.name.toLowerCase().includes(q) || biz.category?.toLowerCase().includes(q) || biz.description?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const filteredProducts = allData.flatMap(biz =>
    biz.products
      .filter(p => {
        const matchCat = category === 'All' || biz.category === category;
        const matchQ = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || biz.name.toLowerCase().includes(q);
        return matchCat && matchQ;
      })
      .map(p => ({ ...p, business_name: biz.name, business_slug: biz.slug, business_category: biz.category }))
  );

  const totalResults = filteredProducts.length + filteredBusinesses.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Search Header */}
      <div style={{ background: 'var(--primary)', padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem) 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', marginBottom: '1.25rem', fontWeight: 800 }}>
            Search Products & Stores
          </h1>
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products, brands, categories..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '1rem 3rem 1rem 3rem',
                borderRadius: 'var(--radius-full)',
                border: 'none', outline: 'none',
                fontSize: '1rem', background: 'white',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', WebkitOverflowScrolling: 'touch' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: category === cat ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                color: category === cat ? 'white' : 'rgba(255,255,255,0.8)',
              }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Searching...</div>
        ) : (
          <>
            {/* Result summary + tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {q ? <><strong style={{ color: 'var(--text-main)' }}>{totalResults}</strong> results for "<strong style={{ color: 'var(--accent)' }}>{query}</strong>"</> : <><strong style={{ color: 'var(--text-main)' }}>{totalResults}</strong> items available</>}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { key: 'products', label: `Products (${filteredProducts.length})`, icon: <ShoppingBag size={15} /> },
                  { key: 'businesses', label: `Stores (${filteredBusinesses.length})`, icon: <Store size={15} /> },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                    padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)',
                    border: '1.5px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    borderColor: activeTab === tab.key ? 'var(--accent)' : '#E5E7EB',
                    background: activeTab === tab.key ? 'rgba(59,130,246,0.08)' : 'white',
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {activeTab === 'products' && (
              filteredProducts.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                  {filteredProducts.map((product, idx) => (
                    <Link to={`/business/${product.business_slug}`} key={`${product.code}-${idx}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid #E5E7EB', transition: 'all 0.25s', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                        <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#F8FAFC' }}>
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400'; }} />
                        </div>
                        <div style={{ padding: '0.875rem' }}>
                          <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>{product.business_name}</p>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                          <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1rem' }}>₦{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Businesses Grid */}
            {activeTab === 'businesses' && (
              filteredBusinesses.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
                  {filteredBusinesses.map(biz => (
                    <Link to={`/business/${biz.slug}`} key={biz.id || biz._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid #E5E7EB', transition: 'all 0.25s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                        <div style={{ height: '140px', overflow: 'hidden' }}>
                          <img src={biz.hero_image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                        <div style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <img src={biz.logo} alt={biz.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.1rem' }}>{biz.category}</p>
                              <h3 style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{biz.name}</h3>
                            </div>
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{biz.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{biz.products.length} products</span>
                            <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              View Store <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <Search size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem' }} />
      <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No results found</h3>
      <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
        {query ? `Nothing matched "${query}". Try a different search term.` : 'No items match your filter.'}
      </p>
    </div>
  );
}
