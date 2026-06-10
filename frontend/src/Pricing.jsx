import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Pricing() {
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [loading, setLoading] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const hotel = JSON.parse(localStorage.getItem('hotel') || '{}');

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await fetch('http://localhost:5000/payment/plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCurrentPlan(data.plan);
    } catch (e) {}
  };

  const handlePurchase = async (plan) => {
    if (plan === currentPlan) return;
    setLoading(plan);

    try {
      const res = await fetch('http://localhost:5000/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      // Free plan
      if (data.free) {
        setCurrentPlan(plan);
        setLoading('');
        alert('Plan updated successfully!');
        return;
      }

      // Load Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'GrandPMS',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        order_id: data.order_id,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch('http://localhost:5000/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...response, plan })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setCurrentPlan(plan);
            alert(`🎉 Payment successful! You are now on the ${plan} plan.`);
            navigate('/dashboard');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: hotel.hotel_name,
          email: hotel.email,
        },
        theme: { color: '#c9a96e' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
    setLoading('');
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '₹0',
      period: '/month',
      desc: 'Perfect for trying GrandPMS',
      features: ['Up to 10 rooms', 'AI Concierge chatbot', 'Basic booking management', '1 document upload'],
      btn: 'Current Plan',
      color: '#888'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '₹2,000',
      period: '/month',
      desc: 'For hotels serious about AI',
      features: ['Unlimited rooms', 'Advanced AI with RAG', 'Full booking history', 'Unlimited documents', 'Staff dashboard', 'Priority support'],
      btn: 'Upgrade Now',
      color: '#c9a96e',
      featured: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₹5,000',
      period: '/month',
      desc: 'For hotel chains',
      features: ['Multiple properties', 'Custom AI training', 'OTA integration', 'Dedicated support', 'SLA guarantee'],
      btn: 'Upgrade Now',
      color: '#6366f1'
    }
  ];

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#fff", fontSize: "18px", fontWeight: "700" }}>Upgrade Plan</div>
          <div style={{ color: "#888", fontSize: "12px" }}>{hotel.hotel_name}</div>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>Choose Your Plan</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Current plan: <strong style={{ color: "#1a1a1a" }}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong>
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: "#fff",
              border: `2px solid ${currentPlan === plan.id ? plan.color : plan.featured ? '#e5e5e5' : '#e5e5e5'}`,
              borderRadius: "16px",
              padding: "32px 24px",
              position: "relative",
              boxShadow: plan.featured ? "0 8px 32px rgba(0,0,0,0.08)" : "none"
            }}>
              {plan.featured && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "#c9a96e", color: "#fff", borderRadius: "100px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
                  Most Popular
                </div>
              )}
              {currentPlan === plan.id && (
                <div style={{ position: "absolute", top: "-12px", right: "16px", padding: "4px 12px", background: "#16a34a", color: "#fff", borderRadius: "100px", fontSize: "11px", fontWeight: "700" }}>
                  ✓ Active
                </div>
              )}
              <div style={{ fontSize: "12px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>{plan.name}</div>
              <div style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a", marginBottom: "4px" }}>
                {plan.price}<span style={{ fontSize: "14px", color: "#888", fontWeight: "400" }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #f0f0f0" }}>{plan.desc}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: "13px", color: "#555", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={currentPlan === plan.id || loading === plan.id}
                style={{
                  width: "100%", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                  cursor: currentPlan === plan.id ? "default" : "pointer",
                  background: currentPlan === plan.id ? "#f0fdf4" : plan.id === 'professional' ? "#c9a96e" : "#1a1a1a",
                  color: currentPlan === plan.id ? "#16a34a" : "#fff",
                  border: "none", transition: "all 0.2s"
                }}
              >
                {loading === plan.id ? 'Processing...' : currentPlan === plan.id ? '✓ Current Plan' : plan.btn}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "#888", fontSize: "12px", marginTop: "32px" }}>
          🔒 Secure payments powered by Razorpay. Cancel anytime.
        </p>
      </div>
    </div>
  );
}