import { useState } from 'react';
import { Zap, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, Smartphone } from 'lucide-react';

export default function SyncStation({ onProductSynced }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSync = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const encodedIdentifier = encodeURIComponent(identifier.trim());
      const response = await fetch(`http://localhost:8000/sync/${encodedIdentifier}`);

      if (!response.ok) {
        throw new Error('Product not found. Check the ID or Link.');
      }

      const product = await response.json();
      onProductSynced(product);
      setIdentifier('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass sync-station animate-fade" style={{ 
      background: 'linear-gradient(135deg, var(--primary), #1E293B)', 
      color: 'white', 
      padding: '2.5rem', 
      borderRadius: 'var(--radius-xl)',
      border: '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.2)', 
            padding: '0.5rem', 
            borderRadius: '50%',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <Smartphone size={20} color="#60A5FA" />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>WhatsApp Sync Station</h3>
        </div>
        
        <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          Found something you like? Paste the <strong>WhatsApp Product Link</strong> or <strong>Product ID</strong> below to instantly sync it to your cart.
        </p>

        <form onSubmit={handleSync}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
              <LinkIcon size={18} />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="https://wa.me/p/... or Product ID"
              style={{
                width: '100%',
                padding: '1.25rem 1rem 1.25rem 3rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.target.style.background = 'rgba(255,255,255,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading || !identifier.trim()}
            style={{ 
              width: '100%', 
              background: loading ? 'rgba(245, 158, 11, 0.7)' : '#F59E0B', 
              color: 'var(--primary)', 
              fontWeight: 700,
              padding: '1rem 2rem',
              fontSize: '1.05rem',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading || !identifier.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading || !identifier.trim() ? 0.7 : 1
            }}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={20} /> Syncing...</>
            ) : (
              <><Zap size={18} /> Sync from WhatsApp</>
            )}
          </button>
        </form>

        {success && (
          <div className="animate-fade" style={{ 
            marginTop: '1.5rem', 
            color: '#10B981', 
            background: 'rgba(16, 185, 129, 0.15)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '0.9rem', 
            textAlign: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            <strong>Success!</strong> Product synced and ready to add to cart.
          </div>
        )}

        {error && (
          <div className="animate-fade" style={{ 
            marginTop: '1.5rem', 
            color: '#EF4444', 
            background: 'rgba(239, 68, 68, 0.15)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '0.9rem', 
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
