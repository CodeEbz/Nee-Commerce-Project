import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Users, TrendingUp, Calendar, Eye } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Check for mock success parameter (for local testing)
    const urlParams = new URLSearchParams(window.location.search);
    const mockId = urlParams.get('mock_success');
    if (mockId) {
      simulateWebhook(mockId);
    }
  }, []);

  const simulateWebhook = async (orderId) => {
    console.log('Simulating webhook for order:', orderId);

    const sendWebhook = async (port) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/webhook/paystack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      let response;
      try {
        response = await sendWebhook(8000);
      } catch (e) {
        try {
          response = await sendWebhook(8001);
        } catch (e2) {
          response = await sendWebhook(8002);
        }
      }

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

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching orders...');
      // Try 8000 -> 8001 -> 8002
      let response;
      try {
        response = await fetchWithTimeout('http://127.0.0.1:8000/orders');
      } catch (e) {
        try {
          console.warn('Port 8000 failed, trying 8001...');
          response = await fetchWithTimeout('http://127.0.0.1:8001/orders');
        } catch (e2) {
          console.warn('Port 8001 failed, trying 8002...');
          response = await fetchWithTimeout('http://127.0.0.1:8002/orders');
        }
      }

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
          Loading Orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px' }}>
          <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>Connection Error</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>The admin dashboard couldn't connect to the backend server. Error: {error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">Retry Connection</button>
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
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ opacity: 0.8, margin: '0.5rem 0 0' }}>Monitor your sales and orders</p>
        </div>
      </header>

      <div className="app-container" style={{ padding: '3rem 2rem' }}>
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
                  {orders.map((order, index) => (
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
    </div>
  );
}