import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import CashSales from './pages/CashSales';
import CreditSales from './pages/CreditSales';
import CustomerPayments from './pages/CustomerPayments';
import Purchases from './pages/Purchases';
import VendorPayments from './pages/VendorPayments';
import Expenses from './pages/Expenses';
import QuoteMaker from './pages/QuoteMaker';
import CustomerLedger from './pages/CustomerLedger';
import VendorLedger from './pages/VendorLedger';
import Trash from './pages/Trash';
import Backup from './pages/Backup';

const NAV = [
  { section: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: '📊' },
  ]},
  { section: 'Sales', items: [
    { path: '/cash-sales', label: 'Cash Sales', icon: '💵' },
    { path: '/credit-sales', label: 'Credit Sales', icon: '📋' },
    { path: '/customer-payments', label: 'Customer Payments', icon: '💳' },
    { path: '/customer-ledger', label: 'Customer Ledger', icon: '📒' },
  ]},
  { section: 'Purchase', items: [
    { path: '/purchases', label: 'Purchases', icon: '🛒' },
    { path: '/vendor-payments', label: 'Vendor Payments', icon: '🏦' },
    { path: '/vendor-ledger', label: 'Vendor Ledger', icon: '📔' },
  ]},
  { section: 'Other', items: [
    { path: '/expenses', label: 'Expenses', icon: '💸' },
    { path: '/quote-maker', label: 'Quote Maker', icon: '📄' },
    { path: '/backup', label: 'Backup', icon: '☁️' },
    { path: '/trash', label: 'Trash', icon: '🗑️' },
  ]},
];

function Sidebar({ open, onClose }) {
  const location = useLocation();
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">
            <div className="name">Charan Traders</div>
            <div className="tagline">Business Management</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(section => (
            <div key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>
          Charan Traders © {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    const flat = NAV.flatMap(s => s.items);
    const found = flat.find(i => i.path === location.pathname);
    return found ? found.label : 'Charan Traders';
  };

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--dark)' }}
              className="menu-toggle"
            >☰</button>
            <span className="topbar-title">{getTitle()}</span>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
            </span>
          </div>
        </header>
        <main className="page-content fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cash-sales" element={<CashSales />} />
            <Route path="/credit-sales" element={<CreditSales />} />
            <Route path="/customer-payments" element={<CustomerPayments />} />
            <Route path="/customer-ledger" element={<CustomerLedger />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/vendor-payments" element={<VendorPayments />} />
            <Route path="/vendor-ledger" element={<VendorLedger />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/quote-maker" element={<QuoteMaker />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/trash" element={<Trash />} />
          </Routes>
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) { .menu-toggle { display: block !important; } }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif', fontSize: 13.5 } }} />
      <Layout />
    </BrowserRouter>
  );
}
