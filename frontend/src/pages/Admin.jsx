import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Users, TrendingUp, Calendar, Store, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const StatCard = ({ icon, value, label, color }) => (
  <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ background: color, color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span style={{
    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
    fontSize: '0.7rem', fontWeight: 700,
    background: status === 'completed' ? '#ECFDF5' : '#FEF2F2',
    color: status === 'completed' ? '#10B981' : '#EF4444'
  }}>
    {status?.toUpperCase()}
  </span>
);

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 });
  const [activeView, setActiveView] = useState('overview');
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchOrders(), fetchAdminData(), fetchAnalytics()]).finally(() => setLoading(false));
    const mockId = new URLSearchParams(window.location.search).get('mock_success');
    if (mockId) simulateWebhook(mockId);
  }, []);

  const authFetch = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { 'Authorization': `Bearer ${token}`, ...opts.headers } });

  const fetchAnalytics = async () => {
    try {
      const r = await authFetch(`${API_URL}/admin/analytics`);
      if (r.ok) setAnalytics(await r.json());
    } catch (e) { console.error(e); }
  };

  const fetchAdminData = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        authFetch(`${API_URL}/admin/users`),
        authFetch(`${API_URL}/admin/businesses`)
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (bRes.ok) setBusinesses(await bRes.json());
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    setError(null);
    try {
      const r = await authFetch(`${API_URL}/orders`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error('Invalid response');
      setOrders(data);
      setStats({
        totalOrders: data.length,
        totalRevenue: data.reduce((s, o) => s + (o.total_amount || 0), 0),
        totalCustomers: new Set(data.filter(o => o.customer_email).map(o => o.customer_email)).size,
        totalProducts: data.reduce((s, o) => s + (o.items || []).reduce((is, i) => is + (i.quantity || 0), 0), 0)
      });
    } catch (e) { setError(e.message); }
  };

  const simulateWebhook = async (orderId) => {
    try {
      await authFetch(`${API_URL}/webhook/paystack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'charge.success', data: { reference: orderId } })
      });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (businessId) => {
    try {
      const r = await authFetch(`${API_URL}/admin/businesses/${businessId}/approve`, { method: 'PUT' });
      if (!r.ok) throw new Error('Failed');
      alert('Business approved!');
      fetchAdminData();
    } catch (e) { alert(e.message); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { key: 'analytics', label: 'Analytics', icon: <Package size={16} /> },
    { key: 'users', label: `Users (${users.length})`, icon: <Users size={16} /> },
    { key: 'businesses', label: `Businesses (${businesses.length})`, icon: <Store size={16} /> },
  ];

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--accent)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
        <button onClick={() => { setError(null); fetchOrders(); }} className="btn btn-primary" style={{ width: '100%' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', margin: '0 0 0.25rem' }}>Admin Dashboard</h1>
              <p style={{ opacity: 0.75, margin: 0, fontSize: '0.875rem' }}>Logged in as <strong>{user?.full_name}</strong></p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
              <LogOut size={15} /> Logout
            </button>
          </div>

          {/* Tab Nav */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.25rem' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveView(tab.key)} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
                background: activeView === tab.key ? 'white' : 'rgba(255,255,255,0.12)',
                color: activeView === tab.key ? 'var(--primary)' : 'rgba(255,255,255,0.85)',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem)' }}>

        {/* ── OVERVIEW ── */}
        {activeView === 'overview' && (
          <div className="animate-fade">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon={<Package size={22} />} value={stats.totalOrders} label="Total Orders" color="var(--accent)" />
              <StatCard icon={<TrendingUp size={22} />} value={`₦${stats.totalRevenue.toLocaleString()}`} label="Total Revenue" color="#10B981" />
              <StatCard icon={<Users size={22} />} value={stats.totalCustomers} label="Unique Customers" color="#F59E0B" />
              <StatCard icon={<Package size={22} />} value={stats.totalProducts} label="Products Sold" color="#8B5CF6" />
            </div>

            {/* Orders */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--accent)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Orders</h2>
              </div>

              {orders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>No orders yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                          {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Status'].map(h => (
                            <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.id?.slice(-8)}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {(order.items || []).map((item, i) => (
                                <div key={i} style={{ fontSize: '0.8rem' }}>{item.quantity}× {item.name}</div>
                              ))}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>₦{order.total_amount?.toLocaleString()}</td>
                            <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(order.created_at)}</td>
                            <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={order.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="admin-cards-mobile" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {(order.items || []).slice(0, 2).map((item, i) => (
                              <span key={i}>{item.quantity}× {item.name}{i < Math.min(order.items.length, 2) - 1 ? ', ' : ''}</span>
                            ))}
                            {order.items?.length > 2 && <span> +{order.items.length - 2} more</span>}
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>₦{order.total_amount?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.5rem' }}>{formatDate(order.created_at)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeView === 'analytics' && (
          <div className="animate-fade">
            {!analytics ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading analytics...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Chart */}
                <div style={{ background: 'white', padding: 'clamp(1rem, 3vw, 1.75rem)', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Revenue Trend (Last 30 Days)</h3>
                  {analytics.dailyRevenue?.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No revenue data yet.</p>
                  ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '4px', borderBottom: '1px solid #E5E7EB', paddingBottom: '2rem' }}>
                      {analytics.dailyRevenue.map((day, idx) => {
                        const max = Math.max(...analytics.dailyRevenue.map(d => d.revenue)) || 1;
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', height: `${(day.revenue / max) * 100}%`, minHeight: '4px', background: 'linear-gradient(to top, var(--accent), var(--accent-light))', borderRadius: '3px 3px 0 0' }} title={`₦${day.revenue.toLocaleString()}`} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top products & businesses */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB' }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Top Products</h3>
                    {(analytics.topProducts || []).length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>None yet.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analytics.topProducts.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.name}</span>
                            <span className="badge badge-accent">{p.sales} sold</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB' }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Top Businesses</h3>
                    {(analytics.topBusinesses || []).length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>None yet.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analytics.topBusinesses.map((b, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '22px', height: '22px', background: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{b.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>₦{b.revenue?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeView === 'users' && (
          <div className="animate-fade">
            <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Users ({users.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {users.map(u => (
                <div key={u.email} style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>{formatDate(u.created_at)}</div>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: u.is_admin ? '#EEF2FF' : u.is_merchant ? '#F0FDF4' : '#F3F4F6', color: u.is_admin ? '#4F46E5' : u.is_merchant ? '#16A34A' : '#6B7280', whiteSpace: 'nowrap' }}>
                    {u.is_admin ? 'Admin' : u.is_merchant ? 'Merchant' : 'Customer'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BUSINESSES ── */}
        {activeView === 'businesses' && (
          <div className="animate-fade">
            <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Store size={18} /> Businesses ({businesses.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1rem' }}>
              {businesses.map(b => (
                <div key={b.id || b._id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ height: '100px', overflow: 'hidden' }}>
                    <img src={b.hero_image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400'} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>{b.category}</div>
                      </div>
                      {b.is_approved !== false ? (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, background: '#DCFCE7', color: '#166534', whiteSpace: 'nowrap' }}>Approved</span>
                      ) : (
                        <button onClick={() => handleApprove(b.id || b._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>Approve</button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {b.owner_email ? <span>Owner: {b.owner_email}</span> : <span style={{ opacity: 0.5 }}>No owner assigned</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{b.products?.length || 0} products</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-table-desktop { display: none !important; }
          .admin-cards-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
