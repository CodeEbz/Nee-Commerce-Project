import { Link } from 'react-router-dom'
import { Search, Zap, ShoppingBag, CreditCard, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      title: "Discover Local Brands",
      description: "Browse through our curated list of verified WhatsApp-based businesses. From wellness and beauty to fashion and electronics.",
      icon: <Search size={40} className="text-accent" />,
      color: "#F3F4F6"
    },
    {
      title: "Sync via WhatsApp",
      description: "Found something on a WhatsApp catalog? Copy the link or the unique Product ID and paste it into our Sync Station to instantly add it to your bag.",
      icon: <Zap size={40} style={{ color: 'var(--accent)' }} />,
      color: "#F0F9FF"
    },
    {
      title: "Seamless Shopping Bag",
      description: "Manage items from multiple different businesses in one single cart. No more keeping track of multiple chats for your shopping list.",
      icon: <ShoppingBag size={40} className="text-accent" />,
      color: "#FDF2F8"
    },
    {
      title: "Secure Checkout",
      description: "Pay securely using Paystack. Your payment is processed instantly, and the order is recorded for both you and the merchant.",
      icon: <CreditCard size={40} style={{ color: 'var(--accent)' }} />,
      color: "#F0FDF4"
    }
  ]

  return (
    <div className="how-it-works-page animate-fade">
      {/* Header Section */}
      <section className="section-padding" style={{ textAlign: 'center', background: 'white', paddingBottom: '2rem' }}>
        <div className="app-container">
          <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>The Platform</div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800 }}>How Nee Commerce Works</h1>
          <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            We bridge the gap between social commerce on WhatsApp and the convenience of a modern web marketplace.
          </p>
        </div>
      </section>

      {/* Steps Grid */}
      <section className="section-padding" style={{ background: 'var(--bg-main)' }}>
        <div className="app-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {steps.map((step, idx) => (
              <div key={idx} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ marginBottom: '1.5rem', background: 'white', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.description}</p>
                <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '4rem', fontWeight: 900, opacity: 0.05, color: 'var(--accent)' }}>
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Sync Station Explained */}
      <section className="section-padding" style={{ background: 'white' }}>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>The Sync Station</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                The Sync Station is our secret sauce. It allows you to take any product you find on a merchant's WhatsApp catalog and bring it into our secure checkout environment.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  "No more 'Send a screenshot to order'",
                  "Real-time product data extraction",
                  "Consolidate orders from different vendors",
                  "Automated order tracking and payment"
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontWeight: 600 }}>
                    <CheckCircle2 color="var(--accent)" size={24} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--accent-light)', textAlign: 'center' }}>
                <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>Interactive Demo</div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1', marginBottom: '1.5rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Paste a WhatsApp link here...</p>
                  <div style={{ width: '100%', height: '40px', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}></div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }}>Sync Product</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding" style={{ background: 'var(--primary)', color: 'white', textAlign: 'center' }}>
        <div className="app-container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to start shopping?</h2>
          <p style={{ opacity: 0.9, fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Experience the future of social commerce today. Join thousands of users supporting local businesses.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/businesses" className="btn btn-primary btn-large" style={{ background: 'white', color: 'var(--primary)' }}>
              Explore All Stores <ArrowRight size={20} />
            </Link>
            <Link to="/" className="btn btn-outline btn-large" style={{ borderColor: 'white', color: 'white' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
