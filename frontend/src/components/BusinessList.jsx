import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingBag } from 'lucide-react';

export default function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/businesses')
      .then(res => res.json())
      .then(data => {
        setBusinesses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch businesses", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-state">Loading amazing businesses...</div>;

  return (
    <div className="business-grid">
      {businesses.map(biz => (
        <div key={biz.id} className="business-card-enhanced glass-panel">
          {/* Image Section */}
          <div className="business-card-image-wrapper">
            <img
              src={biz.hero_image}
              alt={biz.name}
              className="business-card-image"
            />
            <div className="business-card-overlay">
              <img src={biz.logo} alt={`${biz.name} logo`} className="business-card-logo" />
            </div>
          </div>

          {/* Content Section */}
          <div className="business-card-content">
            <h3 className="business-card-title">{biz.name}</h3>
            <p className="business-card-description">{biz.description}</p>

            <div className="business-card-actions">
              <Link
                to={`/business/${biz.slug}`}
                className="btn-secondary"
              >
                <ShoppingBag size={18} />
                View Details
              </Link>
              <a
                href={biz.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink size={18} />
                WhatsApp Catalog
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
