import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency, formatDate, paymentModeBadge } from '../../utils/api';

// ── Confirm Dialog ──────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Delete', danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <div className="confirm-dialog">
            <div className="icon">{danger ? '⚠️' : '❓'}</div>
            <h3>{title || 'Are you sure?'}</h3>
            <p>{message || 'This action cannot be undone.'}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Autocomplete Input ──────────────────────────────────────────
export function AutocompleteInput({ value, onChange, suggestions = [], placeholder, onSelect, showBalance = false, className = '' }) {
  const [show, setShow] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (value && value.length > 0) {
      const f = suggestions.filter(s => {
        const name = typeof s === 'string' ? s : s.name;
        return name.toLowerCase().includes(value.toLowerCase());
      });
      setFiltered(f.slice(0, 10));
      setShow(f.length > 0);
    } else {
      setShow(false);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="autocomplete-wrapper" ref={ref}>
      <input
        className={`form-control ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => value && filtered.length > 0 && setShow(true)}
        autoComplete="off"
      />
      {show && (
        <div className="autocomplete-dropdown">
          {filtered.map((s, i) => {
            const name = typeof s === 'string' ? s : s.name;
            const balance = typeof s === 'object' ? s.balance : null;
            return (
              <div key={i} className="autocomplete-item" onMouseDown={() => { onSelect ? onSelect(s) : onChange(name); setShow(false); }}>
                <span>{name}</span>
                {showBalance && balance > 0 && <span className="autocomplete-balance">Due: {formatCurrency(balance)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Date Input (IST aware) ──────────────────────────────────────
export function DateInput({ value, onChange, label, required }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && ' *'}</label>}
      <input type="date" className="form-control" value={value} onChange={e => onChange(e.target.value)} required={required} />
    </div>
  );
}

// ── Amount Input ────────────────────────────────────────────────
export function AmountDisplay({ label, value, className = '' }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className={`form-control form-control-computed ${className}`} value={formatCurrency(value)} readOnly />
    </div>
  );
}

// ── Payment Mode Select ─────────────────────────────────────────
export function PaymentModeSelect({ value, onChange, label, modes = ['Cash', 'UPI', 'Bank', 'Cheque'] }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label} *</label>}
      <select className="form-control" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select Mode</option>
        {modes.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}

// ── Badge ───────────────────────────────────────────────────────
export function PaymentBadge({ mode }) {
  return <span className={`badge ${paymentModeBadge(mode)}`}>{mode}</span>;
}

// ── Loading ─────────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</span>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────
export function EmptyState({ icon = '📭', text = 'No records found', sub }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-text">{text}</div>
      {sub && <div className="empty-state-sub">{sub}</div>}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = 'gold', onClick }) {
  return (
    <div className={`stat-card ${color}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── Quick Filters ───────────────────────────────────────────────
export function QuickFilters({ active, onChange, from, to, onFromChange, onToChange }) {
  return (
    <div className="filter-bar">
      {['all', 'today', 'month'].map(f => (
        <button key={f} className={`quick-filter-btn ${active === f ? 'active' : ''}`} onClick={() => onChange(f)}>
          {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : 'This Month'}
        </button>
      ))}
      <button className={`quick-filter-btn ${active === 'custom' ? 'active' : ''}`} onClick={() => onChange('custom')}>Custom Range</button>
      {active === 'custom' && (
        <>
          <input type="date" className="form-control" style={{ maxWidth: 150 }} value={from} onChange={e => onFromChange(e.target.value)} />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input type="date" className="form-control" style={{ maxWidth: 150 }} value={to} onChange={e => onToChange(e.target.value)} />
        </>
      )}
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Action Buttons ──────────────────────────────────────────────
export function ActionButtons({ onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {onEdit && <button className="btn btn-sm btn-outline" onClick={onEdit} title="Edit">✏️</button>}
      {onDelete && <button className="btn btn-sm btn-danger" onClick={onDelete} title="Delete">🗑️</button>}
    </div>
  );
}
