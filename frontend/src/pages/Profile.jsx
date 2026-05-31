import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Save, ArrowLeft, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Profile() {
  const { user, token, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    nickname: user?.nickname || '',
    profile_picture: user?.profile_picture || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        nickname: user.nickname || '',
        profile_picture: user.profile_picture || ''
      });
    }
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const result = await response.json();
      setFormData(prev => ({ ...prev, profile_picture: result.url }));
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Update local auth context
      await fetchUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Update error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '2rem 1rem' }}>
      <div className="app-container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          <Link to="/store" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem' }}>
            <ArrowLeft size={18} /> Back to Store
          </Link>

          <div className="glass animate-fade" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            {/* Cover Header */}
            <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '-50px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'white',
                    padding: '4px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}>
                    {formData.profile_picture ? (
                      <img
                        src={formData.profile_picture.startsWith('http') ? formData.profile_picture : `${API_URL}${formData.profile_picture}`}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <label style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    background: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    color: 'var(--primary)'
                  }}>
                    {uploadLoading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploadLoading} />
                  </label>
                </div>
                <div style={{ paddingBottom: '1rem', color: 'white' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{user?.full_name}</h1>
                  <p style={{ margin: 0, opacity: 0.9 }}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '80px 2rem 2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                {/* Info Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Shield size={20} style={{ color: 'var(--accent)' }} />
                    Account Status: {user?.is_admin ? 'Administrator' : 'Merchant'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Mail size={18} />
                    {user?.email}
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="input-field"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Nickname</label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                        className="input-field"
                        placeholder="Display name"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ minWidth: '150px' }}>
                      {saveSuccess && (
                        <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }} className="animate-fade">
                          <CheckCircle2 size={18} /> Profile Updated
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '160px', height: '3.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .input-field {
          width: 100%;
          height: 3.2rem;
          padding: 0 1rem;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        @media (max-width: 768px) {
          .profile-page > div > div > div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}} />
    </div>
  );
}
