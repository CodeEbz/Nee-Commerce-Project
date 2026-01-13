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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/orders');
      const data = await response.json();
      setOrders(data);
      
      // Calculate stats
      const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0);
      const uniqueCustomers = new Set(data.map(order => order.customer_email)).size;
      const totalProducts = data.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );

      setStats({
        totalOrders: data.length,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        totalProducts
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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