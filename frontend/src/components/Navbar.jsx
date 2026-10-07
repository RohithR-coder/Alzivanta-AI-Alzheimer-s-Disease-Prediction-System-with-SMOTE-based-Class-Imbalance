import React, { useState } from 'react';
import { Brain, BarChart3, ClipboardList, Stethoscope, QrCode, Menu, X, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, appStatus = "ANN v2.4 · Live" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Data & Model Analytics', icon: BarChart3 },
    { id: 'intake', label: 'Patient Intake', icon: ClipboardList },
    { id: 'diagnostic', label: 'Diagnostic Output', icon: Stethoscope },
    { id: 'mobile-qr', label: 'Mobile QR', icon: QrCode, isSpecial: true },
  ];

  return (
    <header className="no-print" style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 16, 28, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)',
          }}>
            <Brain size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                NeuroPredict AI
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#A5B4FC',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}>
                ANN MLP
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Laptop & Mobile Clinical System
            </p>
          </div>
        </div>

        {/* Center / Right: Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0B101C',
            padding: '4px 6px',
            borderRadius: '32px',
            border: '1px solid var(--border-color)',
          }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-pill ${isActive ? 'active' : ''} ${item.isSpecial ? 'nav-pill-special' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Simple App Status Indicator (Replaced Doctor Header) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginLeft: '8px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              display: 'inline-block',
            }}></span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6EE7B7' }}>
              Model: {appStatus}
            </span>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="mobile-nav-toggle" style={{ display: 'none' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 24px',
          background: '#0B101C',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`nav-pill ${isActive ? 'active' : ''} ${item.isSpecial ? 'nav-pill-special' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 18px' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginTop: '8px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6EE7B7' }}>
              Model: {appStatus}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
