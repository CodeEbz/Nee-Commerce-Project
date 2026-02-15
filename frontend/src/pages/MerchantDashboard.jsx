import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Trash2, LayoutDashboard, Store, DollarSign, Upload, Image as ImageIcon, Save, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function MerchantDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'profile'
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

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      const data = await response.json();
      setBusinesses(data);
      if (data.length > 0 && !selectedBusiness) setSelectedBusiness(data[0]);
      else if (selectedBusiness) {
        const updated = data.find(b => b.id === selectedBusiness.id);
        if (updated) setSelectedBusiness(updated);
      }
    } catch (err) {
      setError(err.message);
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
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Merchant Dashboard</h1>
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
        {selectedBusiness && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Package size={20} /> Inventory
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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
