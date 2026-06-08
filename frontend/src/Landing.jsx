import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .landing * { box-sizing: border-box; margin: 0; padding: 0; }
  .landing { font-family: 'DM Sans', sans-serif; background: #0a0a0a; color: #f0ede6; overflow-x: hidden; }

  /* Nav */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px; display: flex; justify-content: space-between; align-items: center; background: rgba(10,10,10,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 22px; color: #f0ede6; letter-spacing: 0.02em; }
  .nav-logo span { color: #c9a96e; }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a { color: #888; font-size: 14px; text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: #f0ede6; }
  .nav-cta { padding: 10px 24px; background: #c9a96e; color: #0a0a0a; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
  .nav-cta:hover { background: #d4b87a; transform: translateY(-1px); }

  /* Hero */
  .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 120px 40px 80px; position: relative; overflow: hidden; }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,110,0.08) 0%, transparent 70%); }
  .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.3); border-radius: 100px; font-size: 12px; color: #c9a96e; margin-bottom: 32px; letter-spacing: 0.08em; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(48px, 7vw, 96px); font-weight: 900; line-height: 1.0; margin-bottom: 24px; }
  .hero-title .gold { color: #c9a96e; }
  .hero-title .thin { font-weight: 400; font-style: italic; }
  .hero-sub { font-size: 18px; color: #888; max-width: 520px; margin: 0 auto 48px; line-height: 1.7; font-weight: 300; }
  .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary { padding: 16px 36px; background: #c9a96e; color: #0a0a0a; border-radius: 6px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.2s; letter-spacing: 0.02em; }
  .btn-primary:hover { background: #d4b87a; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,169,110,0.3); }
  .btn-secondary { padding: 16px 36px; background: transparent; color: #f0ede6; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 15px; font-weight: 500; text-decoration: none; transition: all 0.2s; }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }

  /* Stats */
  .stats { padding: 60px; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #c9a96e; }
  .stat-label { font-size: 13px; color: #666; margin-top: 6px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* Features */
  .features { padding: 120px 60px; max-width: 1200px; margin: 0 auto; }
  .section-label { font-size: 11px; color: #c9a96e; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 700; line-height: 1.2; margin-bottom: 60px; max-width: 600px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
  .feature-card { padding: 40px; background: #0a0a0a; transition: background 0.3s; }
  .feature-card:hover { background: #111; }
  .feature-icon { font-size: 32px; margin-bottom: 20px; }
  .feature-title { font-size: 17px; font-weight: 600; color: #f0ede6; margin-bottom: 12px; }
  .feature-desc { font-size: 14px; color: #666; line-height: 1.7; }

  /* How it works */
  .how { padding: 120px 60px; background: #060606; }
  .how-inner { max-width: 1000px; margin: 0 auto; }
  .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; margin-top: 60px; position: relative; }
  .steps::before { content: ''; position: absolute; top: 28px; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); }
  .step { text-align: center; position: relative; }
  .step-num { width: 56px; height: 56px; border-radius: 50%; background: #0a0a0a; border: 1px solid #c9a96e; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-family: 'Playfair Display', serif; font-size: 20px; color: #c9a96e; font-weight: 700; position: relative; z-index: 1; }
  .step-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .step-desc { font-size: 13px; color: #666; line-height: 1.6; }

  /* Pricing */
  .pricing { padding: 120px 60px; max-width: 1100px; margin: 0 auto; }
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
  .price-card { padding: 40px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: #0d0d0d; transition: all 0.3s; position: relative; }
  .price-card:hover { border-color: rgba(201,169,110,0.3); transform: translateY(-4px); }
  .price-card.featured { border-color: #c9a96e; background: #0f0e0b; }
  .featured-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 4px 16px; background: #c9a96e; color: #0a0a0a; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
  .plan-name { font-size: 13px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
  .plan-price { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #f0ede6; margin-bottom: 4px; }
  .plan-price span { font-size: 18px; color: #888; font-family: 'DM Sans', sans-serif; font-weight: 400; }
  .plan-desc { font-size: 13px; color: #666; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
  .plan-features li { font-size: 14px; color: #888; display: flex; gap: 10px; align-items: flex-start; }
  .plan-features li::before { content: '✓'; color: #c9a96e; font-weight: 700; flex-shrink: 0; }
  .plan-btn { display: block; text-align: center; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
  .plan-btn-outline { border: 1px solid rgba(255,255,255,0.2); color: #f0ede6; }
  .plan-btn-outline:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }
  .plan-btn-gold { background: #c9a96e; color: #0a0a0a; }
  .plan-btn-gold:hover { background: #d4b87a; }

  /* CTA */
  .cta-section { padding: 120px 60px; text-align: center; position: relative; overflow: hidden; }
  .cta-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%); }
  .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 64px); font-weight: 900; margin-bottom: 20px; position: relative; }
  .cta-sub { font-size: 16px; color: #666; margin-bottom: 40px; position: relative; }

  /* Footer */
  .footer { padding: 40px 60px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; color: #f0ede6; }
  .footer-logo span { color: #c9a96e; }
  .footer-copy { font-size: 13px; color: #444; }

  @media (max-width: 768px) {
    .nav { padding: 16px 24px; }
    .stats { grid-template-columns: repeat(2, 1fr); padding: 40px 24px; }
    .features { padding: 80px 24px; }
    .features-grid { grid-template-columns: 1fr; }
    .steps { grid-template-columns: repeat(2, 1fr); }
    .pricing-grid { grid-template-columns: 1fr; }
    .pricing { padding: 80px 24px; }
    .how { padding: 80px 24px; }
    .footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 24px; }
  }
`;

export default function Landing() {
  return (
    <div className="landing">
      <style>{css}</style>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">Grand<span>PMS</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login" className="nav-cta">Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">
            <span>✦</span> AI-Powered Property Management
          </div>
          <h1 className="hero-title">
            The Future of<br />
            <span className="gold">Hotel Management</span><br />
            <span className="thin">is here.</span>
          </h1>
          <p className="hero-sub">
            Give your hotel an AI concierge that handles bookings, answers guest questions, and manages your property — all from one elegant dashboard.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">Start Free Trial →</Link>
            <a href="#features" className="btn-secondary">See Features</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats">
        {[
          { num: "24/7", label: "AI Availability" },
          { num: "3 min", label: "Setup Time" },
          { num: "100%", label: "Data Isolation" },
          { num: "₹0", label: "To Get Started" },
        ].map(s => (
          <div key={s.label}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-label">What's included</div>
        <h2 className="section-title">Everything your hotel needs, nothing it doesn't.</h2>
        <div className="features-grid">
          {[
            { icon: "🤖", title: "AI Concierge", desc: "Guests chat with an AI that knows your hotel inside out — policies, rooms, pricing, amenities. Available 24/7 without hiring staff." },
            { icon: "📋", title: "Smart Booking", desc: "The AI collects guest details, checks availability in real-time, and creates confirmed reservations directly in your database." },
            { icon: "🏨", title: "Staff Dashboard", desc: "Real-time room status with guest details, upcoming booking warnings, and conflict detection — everything front desk needs at a glance." },
            { icon: "📄", title: "Document Intelligence", desc: "Upload your hotel policies as PDFs. The AI learns from them instantly. Update a document, the chatbot knows immediately." },
            { icon: "📊", title: "Booking History", desc: "Filter reservations by guest name, email, or date. Track confirmed bookings, amounts, and occupancy patterns." },
            { icon: "🔒", title: "Multi-Tenant Security", desc: "Every hotel's data is completely isolated. Hotel A never sees Hotel B's guests, rooms, or bookings. Enterprise-grade security." },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how" id="how">
        <div className="how-inner">
          <div className="section-label">How it works</div>
          <h2 className="section-title">Up and running in minutes.</h2>
          <div className="steps">
            {[
              { num: "1", title: "Sign Up", desc: "Create your hotel account in 30 seconds. No credit card required." },
              { num: "2", title: "Add Rooms", desc: "Enter your room types, prices, and availability through the admin panel." },
              { num: "3", title: "Upload Documents", desc: "Upload your hotel policies and menus as PDFs. AI indexes them instantly." },
              { num: "4", title: "Go Live", desc: "Embed the chatbot on your website. Guests start booking immediately." },
            ].map(s => (
              <div key={s.num} className="step">
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="section-label">Simple pricing</div>
        <h2 className="section-title">One price. Everything included.</h2>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="plan-name">Starter</div>
            <div className="plan-price">₹0 <span>/month</span></div>
            <div className="plan-desc">Perfect for trying GrandPMS before committing.</div>
            <ul className="plan-features">
              <li>Up to 10 rooms</li>
              <li>AI Concierge chatbot</li>
              <li>Basic booking management</li>
              <li>1 document upload</li>
            </ul>
            <Link to="/login" className="plan-btn plan-btn-outline">Get Started Free</Link>
          </div>
          <div className="price-card featured">
            <div className="featured-badge">Most Popular</div>
            <div className="plan-name">Professional</div>
            <div className="plan-price">₹2,000 <span>/month</span></div>
            <div className="plan-desc">For hotels serious about AI-powered guest experience.</div>
            <ul className="plan-features">
              <li>Unlimited rooms</li>
              <li>Advanced AI with RAG</li>
              <li>Full booking history</li>
              <li>Unlimited document uploads</li>
              <li>Staff dashboard</li>
              <li>Priority support</li>
            </ul>
            <Link to="/login" className="plan-btn plan-btn-gold">Start Free Trial</Link>
          </div>
          <div className="price-card">
            <div className="plan-name">Enterprise</div>
            <div className="plan-price">Custom</div>
            <div className="plan-desc">For hotel chains and large properties with specific needs.</div>
            <ul className="plan-features">
              <li>Multiple properties</li>
              <li>Custom AI training</li>
              <li>OTA integration roadmap</li>
              <li>Dedicated support</li>
              <li>SLA guarantee</li>
            </ul>
            <a href="mailto:hello@grandpms.com" className="plan-btn plan-btn-outline">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg" />
        <h2 className="cta-title">Ready to modernize<br /><span style={{ color: "#c9a96e" }}>your hotel?</span></h2>
        <p className="cta-sub">Join hotels already using GrandPMS to deliver exceptional guest experiences.</p>
        <Link to="/login" className="btn-primary" style={{ position: "relative" }}>
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">Grand<span>PMS</span></div>
        <div className="footer-copy">© 2026 GrandPMS. Built with AI for the hospitality industry.</div>
      </footer>
    </div>
  );
}
