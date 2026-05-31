import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Trash2, LayoutDashboard, Store, DollarSign, Upload, Image as ImageIcon, Save, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function MerchantDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'profile', 'orders', 'analytics'
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    price: '',
    description: '',
    image: '',
    featured: false
  });

  const [newBusiness, setNewBusiness] = useState({
    name: '',
    category: '',
    description: ''
  });

  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    description: '',
    category: '',
    logo: '',
    hero_image: '',
    whatsapp_link: ''
  });
  useEffect(() => {
    fetchBusinesses();
    fetchOrders();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      setBusinessProfile({
        name: selectedBusiness.name || '',
        description: selectedBusiness.description || '',
        category: selectedBusiness.category || '',
        logo: selectedBusiness.logo || '',
        hero_image: selectedBusiness.hero_image || '',
        whatsapp_link: selectedBusiness.whatsapp_link || ''
      });
    }
  }, [selectedBusiness]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/merchant/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAnalytics(await response.json());
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${API_URL}/my-businesses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch businesses');
      const data = await response.json();
      console.log("DEBUG: Fetched businesses:", data.length, data);
      setBusinesses(data);
      if (data.length > 0 && !selectedBusiness) setSelectedBusiness(data[0]);
      else if (selectedBusiness) {
        const updated = data.find(b => b.id === selectedBusiness.id);
        if (updated) setSelectedBusiness(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // setLoading only after both businesses and orders are fetched if needed
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/merchant/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      if (type === 'product') {
        setNewProduct({ ...newProduct, image: data.url });
      } else if (type === 'logo') {
        setBusinessProfile({ ...businessProfile, logo: data.url });
      } else if (type === 'hero') {
        setBusinessProfile({ ...businessProfile, hero_image: data.url });
      }
      alert('Image uploaded successfully!');
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/businesses/${selectedBusiness.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(businessProfile)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully!');
      fetchBusinesses();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          business_id: selectedBusiness.id
        })
      });
      if (!response.ok) throw new Error('Failed to add product');

      fetchBusinesses();
      setShowAddForm(false);
      setNewProduct({ code: '', name: '', price: '', description: '', image: '', featured: false });
      alert('Product added successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productCode) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${selectedBusiness.id}/${productCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');

      fetchBusinesses();
      alert('Product deleted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBusiness)
      });
      if (!response.ok) throw new Error('Failed to create business');
      
      alert('Shop created successfully! It is pending admin approval.');
      setNewBusiness({ name: '', category: '', description: '' });
      fetchBusinesses();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div className="merchant-dashboard" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header */}
      <header style={{ background: 'var(--primary)', color: 'white', padding: '2rem' }}>
        <div className="app-container">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={20} /> Back to Store
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>
                Merchant Dashboard
                {selectedBusiness && selectedBusiness.is_approved === false && (
                  <span style={{ marginLeft: '1rem', fontSize: '0.875rem', background: '#FEF08A', color: '#854D0E', padding: '0.25rem 0.75rem', borderRadius: '9999px', verticalAlign: 'middle' }}>Pending Approval</span>
                )}
              </h1>
              <p style={{ opacity: 0.8, margin: '0.5rem 0 0' }}>Manage your products and shop details</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Logged in as <strong>{user?.full_name}</strong></span>
              <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={18} /> Logout
              </button>
              <select
                value={selectedBusiness?.id}
                onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === e.target.value))}
                style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id} style={{ color: 'black' }}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="app-container" style={{ padding: '2rem' }}>
        {!selectedBusiness ? (
          <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Store size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Your Shop</h2>
              <p style={{ color: 'var(--text-muted)' }}>You haven't set up a shop yet. Let's get started!</p>
            </div>
            
            <form onSubmit={handleCreateBusiness}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Shop Name *</label>
                <input
                  type="text" required value={newBusiness.name}
                  onChange={e => setNewBusiness({...newBusiness, name: e.target.value})}
                  placeholder="e.g. Apinke Herbs"
                  className="input-field"
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category *</label>
                <input
                  type="text" required value={newBusiness.category}
                  onChange={e => setNewBusiness({...newBusiness, category: e.target.value})}
                  placeholder="e.g. Wellness, Fashion, Beauty"
                  className="input-field"
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Short Description</label>
                <textarea
                  value={newBusiness.description}
                  onChange={e => setNewBusiness({...newBusiness, description: e.target.value})}
                  rows="3"
                  placeholder="Tell customers what your shop is about..."
                  className="input-field"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
                Create My Shop
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <Package size={20} /> Inventory
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <DollarSign size={20} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <Store size={20} /> Shop Profile
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="animate-fade">
                {/* Products Control */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Product Inventory ({selectedBusiness.products.length})</h3>
                  <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> {showAddForm ? 'Cancel' : 'Add New Product'}
                  </button>
                </div>

                {/* Add Product Form */}
                {showAddForm && (
                  <div className="glass" style={{ background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New Product</h4>
                    <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Name *</label>
                        <input
                          type="text" required value={newProduct.name}
                          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g. Slim Tea Detox"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Code (SKU) *</label>
                        <input
                          type="text" required value={newProduct.code}
                          onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                          placeholder="e.g. HERB-001"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price (₦) *</label>
                        <input
                          type="number" required value={newProduct.price}
                          onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="5000"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Image *</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text" value={newProduct.image}
                            onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                            placeholder="Image URL or upload..."
                            className="input-field"
                            style={{ flex: 1 }}
                          />
                          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                            <Upload size={18} />
                            <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'product')} accept="image/*" />
                          </label>
                        </div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                        <textarea
                          value={newProduct.description}
                          onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                          rows="3"
                          placeholder="Tell customers about your product..."
                          className="input-field"
                        ></textarea>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Create Product</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#F9FAFB' }}>
                      <tr>
                        <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600 }}>Product</th>
                        <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600 }}>Code</th>
                        <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600 }}>Price</th>
                        <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBusiness.products.map(product => (
                        <tr key={product.code} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                              <div style={{ fontWeight: 600 }}>{product.name}</div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#6B7280' }}>{product.code}</td>
                          <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent)' }}>₦{product.price.toLocaleString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteProduct(product.id || product.code)}
                              style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                              className="hover-bg-red"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Personal Shop Orders ({orders.length})</h3>
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {orders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No orders recorded for your products yet.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#F9FAFB' }}>
                        <tr>
                          <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600 }}>Order ID</th>
                          <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                          <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600 }}>Your Items</th>
                          <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{order.id}</td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {order.items.filter(i => i.business_slug === selectedBusiness?.slug).map((item, idx) => (
                                <div key={idx} style={{ fontSize: '0.875rem' }}>{item.quantity}x {item.name}</div>
                              ))}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <span style={{
                                padding: '0.2rem 0.6rem',
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
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                  Store Analytics
                </h3>
                
                {!analytics ? (
                  <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                    Loading analytics data...
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
                    
                    {/* Key Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Sales Revenue</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>₦{analytics.totalRevenue?.toLocaleString()}</div>
                      </div>
                      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Orders Completed</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{analytics.totalOrders}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
                      {/* Daily Revenue CSS Chart */}
                      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Revenue Trends (Last 30 Days)</h4>
                        {analytics.dailyRevenue?.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent sales data.</div>
                        ) : (
                          <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
                            {analytics.dailyRevenue.map((day, idx) => {
                              const maxRev = Math.max(...analytics.dailyRevenue.map(d => d.revenue)) || 1;
                              const heightPct = (day.revenue / maxRev) * 100;
                              
                              return (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                  <div 
                                    style={{ 
                                      width: '100%', 
                                      height: `${heightPct}%`, 
                                      minHeight: '4px',
                                      background: 'linear-gradient(to top, #10B981, #34D399)',
                                      borderRadius: '4px 4px 0 0',
                                      transition: 'height 0.5s ease',
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

                      {/* Top Products */}
                      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Top Products</h4>
                        {analytics.topProducts?.length === 0 ? (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products sold yet.</div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {analytics.topProducts.map((prod, idx) => (
                              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                  <div style={{ width: '20px', height: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>{idx + 1}</div>
                                  <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</span>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{prod.sales}</span>
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

            {activeTab === 'profile' && (
              <div className="animate-fade">
                <div className="glass" style={{ background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>Shop Profile Settings</h3>
                  <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Business Name</label>
                      <input
                        type="text" value={businessProfile.name}
                        onChange={e => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                      <input
                        type="text" value={businessProfile.category}
                        onChange={e => setBusinessProfile({ ...businessProfile, category: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                      <textarea
                        value={businessProfile.description}
                        onChange={e => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                        rows="4"
                        className="input-field"
                      ></textarea>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>WhatsApp Catalog Link</label>
                      <input
                        type="text" value={businessProfile.whatsapp_link}
                        onChange={e => setBusinessProfile({ ...businessProfile, whatsapp_link: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Logo Image</label>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={businessProfile.logo} alt="logo preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', background: '#f8fafc' }} />
                        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text" value={businessProfile.logo}
                            onChange={e => setBusinessProfile({ ...businessProfile, logo: e.target.value })}
                            className="input-field"
                            style={{ flex: 1 }}
                          />
                          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                            <Upload size={18} />
                            <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'logo')} accept="image/*" />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hero Banner Image</label>
                      <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '150px' }}>
                        <img src={businessProfile.hero_image} alt="hero preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text" value={businessProfile.hero_image}
                          onChange={e => setBusinessProfile({ ...businessProfile, hero_image: e.target.value })}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                          <Upload size={18} />
                          <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'hero')} accept="image/*" />
                        </label>
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Save size={20} /> Save Profile Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #E5E7EB;
          border-radius: var(--radius-md);
          outline: none;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .hover-bg-red:hover {
          background-color: #FEF2F2 !important;
        }
      `}} />
    </div>
  );
}
