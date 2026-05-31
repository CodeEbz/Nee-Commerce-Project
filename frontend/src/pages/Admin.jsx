import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Users, TrendingUp, Calendar, Store, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'users', 'businesses', 'analytics'
  const [error, setError] = useState(null);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchAdminData();
    fetchAnalytics();

    // Check for mock success parameter (for local testing)
    const urlParams = new URLSearchParams(window.location.search);
    const mockId = urlParams.get('mock_success');
    if (mockId) {
      simulateWebhook(mockId);
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_URL}/admin/analytics`, { headers });
      if (response.ok) {
        setAnalytics(await response.json());
      }
    } catch (e) {
      console.error("Admin analytics fetch error:", e);
    }
  };

  const simulateWebhook = async (orderId) => {
    console.log('Simulating webhook for order:', orderId);

    const sendWebhook = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch(`${API_URL}/webhook/paystack`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: 'charge.success',
            data: { reference: orderId }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      await sendWebhook();

      // Refresh to show "Completed"
      fetchOrders();
    } catch (e) {
      console.error('Webhook simulation failed', e);
    }
  };

  const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const fetchAdminData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [uRes, bRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/businesses`, { headers })
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (bRes.ok) setBusinesses(await bRes.json());
    } catch (e) {
      console.error("Admin data fetch error:", e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching orders...');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetchWithTimeout(`${API_URL}/orders`, { headers });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Orders received:', data);

      if (!Array.isArray(data)) {
        throw new Error('Data received is not an array');
      }

      setOrders(data);

      // Calculate stats safely
      const totalRevenue = data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const uniqueCustomers = new Set(data.filter(o => o.customer_email).map(order => order.customer_email)).size;
      const totalProducts = data.reduce((sum, order) =>
        sum + (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
      );

      setStats({
        totalOrders: data.length,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        totalProducts
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/admin/businesses/${businessId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to approve business');
      
      alert('Business approved successfully!');
      fetchAdminData();
    } catch (err) {
      alert(`Error approving business: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px' }}>
          <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>Connection Error</h2>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>The admin dashboard couldn't connect to the backend server.</p>
          <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontSize: '0.875rem', color: '#B91C1C', textAlign: 'left' }}>
            <strong>Possible reasons:</strong>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
              <li>The backend server is not running.</li>
              <li>The server is running on a different port.</li>
              <li>A firewall is blocking the connection.</li>
            </ul>
          </div>
          <button onClick={() => { setError(null); fetchOrders(); }} className="btn btn-primary" style={{ width: '100%' }}>Retry Connection</button>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Technical error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header */}
      <header style={{ background: 'var(--primary)', color: 'white', padding: '2rem' }}>
        <div className="app-container">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={20} /> Back to Store
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin Dashboard</h1>
              <p style={{ opacity: 0.8, margin: '0.5rem 0 0' }}>Monitor platform-wide operations</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Logged in as <strong>{user?.full_name}</strong></span>
              <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="app-container" style={{ padding: '2rem' }}>
        {/* Admin Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveView('overview')}
            className={`btn ${activeView === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <TrendingUp size={20} /> Overview
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`btn ${activeView === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            Analytics
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`btn ${activeView === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <Users size={20} /> Manage Users
          </button>
          <button
            onClick={() => setActiveView('businesses')}
            className={`btn ${activeView === 'businesses' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <Store size={20} /> Manage Businesses
          </button>
        </div>

        {activeView === 'analytics' && (
          <div className="animate-fade">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Advanced Analytics
            </h2>
            
            {!analytics ? (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                 Loading analytics data...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
                
                {/* Daily Revenue Chart */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Daily Revenue (Last 30 Days)</h3>
                  
                  {analytics.dailyRevenue?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No revenue data available yet.</div>
                  ) : (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '2rem', position: 'relative', borderBottom: '1px solid #E5E7EB' }}>
                      {/* CSS Bar Chart */}
                      {analytics.dailyRevenue.map((day, idx) => {
                        const maxRev = Math.max(...analytics.dailyRevenue.map(d => d.revenue)) || 1;
                        const heightPct = (day.revenue / maxRev) * 100;
                        
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', group: 'bar' }}>
                            <div 
                              style={{ 
                                width: '100%', 
                                height: `${heightPct}%`, 
                                minHeight: '4px',
                                background: 'linear-gradient(to top, var(--accent), var(--accent-light))',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.5s ease',
                                position: 'relative',
                                cursor: 'crosshair'
                              }}
                              title={`₦${day.revenue.toLocaleString()}`}
                            />
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: '4px', whiteSpace: 'nowrap' }}>
                              {day.date}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Top Products */}
                  <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Top Selling Products</h3>
                    {analytics.topProducts?.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products sold yet.</div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analytics.topProducts.map((prod, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{prod.name}</span>
                            <span className="badge badge-accent">{prod.sales} sold</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Top Businesses */}
                  <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Top Businesses</h3>
                    {analytics.topBusinesses?.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded.</div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analytics.topBusinesses.map((biz, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '24px', height: '24px', background: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{idx + 1}</div>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{biz.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.9rem' }}>₦{biz.revenue.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {activeView === 'overview' && (
          <div className="animate-fade">
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ background: 'var(--accent)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Package size={24} />
                </div>
                <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: 'var(--accent)' }}>{stats.totalOrders}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total Orders</p>
              </div>

              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ background: '#10B981', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <TrendingUp size={24} />
                </div>
                <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#10B981' }}>₦{stats.totalRevenue.toLocaleString()}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total Revenue</p>
              </div>

              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ background: '#F59E0B', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Users size={24} />
                </div>
                <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#F59E0B' }}>{stats.totalCustomers}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Unique Customers</p>
              </div>

              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ background: '#8B5CF6', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Package size={24} />
                </div>
                <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#8B5CF6' }}>{stats.totalProducts}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Products Sold</p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={24} /> Recent Orders
              </h2>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No orders yet. Start promoting your store!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Order ID</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Items</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Total</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Date</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {order.id}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.customer_phone}</div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem' }}>
                              {order.items.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '0.25rem' }}>
                                  {item.quantity}x {item.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent)' }}>
                            ₦{order.total_amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                            {formatDate(order.created_at)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: order.status === 'completed' ? '#ECFDF5' : '#FEF2F2',
                              color: order.status === 'completed' ? '#10B981' : '#EF4444'
                            }}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="animate-fade">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} /> Platform Users ({users.length})
            </h2>
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F9FAFB' }}>
                  <tr>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>User Info</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>Role</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: u.is_admin ? '#EEF2FF' : '#F3F4F6',
                          color: u.is_admin ? '#4F46E5' : '#6B7280'
                        }}>
                          {u.is_admin ? 'Admin' : 'Merchant'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {u.created_at ? formatDate(u.created_at) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'businesses' && (
          <div className="animate-fade">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={24} /> Managed Businesses ({businesses.length})
            </h2>
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F9FAFB' }}>
                  <tr>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>Business</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>Owner</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700 }}>Products</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={b.logo} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', background: '#e2e8f0' }} />
                          <div style={{ fontWeight: 600 }}>{b.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{b.owner_email || 'Unassigned'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{b.category}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {b.is_approved !== false ? (
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#DCFCE7', color: '#166534' }}>Approved</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#FEF9C3', color: '#854D0E' }}>Pending</span>
                            <button onClick={() => handleApprove(b.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Approve</button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{b.products?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}