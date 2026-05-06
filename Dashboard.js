import React, { useState, useEffect } from 'react';
import api, { formatCurrency, formatDate } from '../utils/api';
import { Loading, EmptyState, Modal, StatCard } from '../components/common';
import toast from 'react-hot-toast';

export default function CustomerLedger() {
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjust, setAdjust] = useState({ adjustmentType: 'credit', amount: '', reason: '', date: '' });

  useEffect(() => { fetchParties(); }, []);
  useEffect(() => { if (selectedParty) fetchLedger(); }, [selectedParty, from, to]);

  const fetchParties = async () => {
    try { const res = await api.get('/parties?type=customer'); setParties(res.data); } catch {}
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get(`/credit-sales/ledger/${encodeURIComponent(selectedParty)}`, { params });
      setLedger(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjust.amount || !adjust.reason) return toast.error('Amount and reason required');
    try {
      await api.post('/parties/adjust-balance', { partyName: selectedParty, partyType: 'customer', ...adjust, amount: parseFloat(adjust.amount) });
      toast.success('Balance adjusted');
      setShowAdjust(false);
      setAdjust({ adjustmentType: 'credit', amount: '', reason: '', date: '' });
      fetchLedger();
    } catch (err) { toast.error(err.message); }
  };

  const downloadPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const url = `/api/pdf/customer-ledger/${encodeURIComponent(selectedParty)}?${params}`;
      window.open(url, '_blank');
    } catch (err) { toast.error('Failed to generate PDF'); }
  };

  const getRowClass = (entry) => {
    if (entry.entryType === 'sale' && entry.runningBalance > 50000) return 'highlight-large-due';
    return '';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Customer Ledger</h1><p>Full transaction history per customer</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedParty && <button className="btn btn-outline" onClick={() => setShowAdjust(true)}>⚖️ Adjust Balance</button>}
          {selectedParty && <button className="btn btn-dark" onClick={downloadPDF}>📄 Download PDF</button>}
        </div>
      </div>

      {/* Party selector + date filter */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ minWidth: 250 }}>
              <label className="form-label">Select Customer *</label>
              <select className="form-control" value={selectedParty} onChange={e => setSelectedParty(e.target.value)}>
                <option value="">-- Choose Customer --</option>
                {parties.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            {(from || to) && <button className="btn btn-outline" onClick={() => { setFrom(''); setTo(''); }}>Clear Dates</button>}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {ledger && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
          <StatCard icon="📊" label="Total Sales" value={formatCurrency(ledger.totalSales)} color="blue" />
          <StatCard icon="✅" label="Total Received" value={formatCurrency(ledger.totalReceived)} color="green" />
          <StatCard icon="⏳" label="Outstanding Balance" value={formatCurrency(ledger.totalDue)} color={ledger.totalDue > 0 ? 'red' : 'green'} sub={ledger.totalDue > 0 ? '⚠️ Overdue' : '✅ Cleared'} />
        </div>
      )}

      {/* Ledger table */}
      {!selectedParty ? (
        <div className="card"><EmptyState icon="📒" text="Select a customer to view ledger" /></div>
      ) : loading ? <Loading /> : !ledger ? null : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📒 Ledger — {selectedParty}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ledger.ledgerEntries.length} entries</span>
          </div>
          <div className="table-wrapper">
            {ledger.ledgerEntries.length === 0 ? <EmptyState icon="📭" text="No transactions in this period" /> : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Type</th><th>Particulars</th><th style={{textAlign:'right'}}>Debit (₹)</th><th style={{textAlign:'right'}}>Credit (₹)</th><th style={{textAlign:'right'}}>Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.ledgerEntries.map((entry, i) => (
                    <tr key={i} className={`${entry.runningBalance > 50000 ? 'highlight-large-due' : ''} ${getRowClass(entry)}`}>
                      <td>{entry.formattedDate}</td>
                      <td>
                        <span className={`badge ${entry.entryType === 'sale' ? 'badge-pending' : entry.entryType === 'payment' ? 'badge-paid' : 'badge-upi'}`}>
                          {entry.entryType === 'sale' ? 'Sale' : entry.entryType === 'payment' ? 'Payment' : 'Adjustment'}
                        </span>
                      </td>
                      <td>
                        {entry.entryType === 'sale' ? (
                          <span><strong>{entry.materialName}</strong><br /><span style={{fontSize:11,color:'var(--text-muted)'}}>{entry.quantity} {entry.unit} × ₹{entry.rate}</span></span>
                        ) : entry.entryType === 'adjustment' ? entry.reason : (entry.reference ? `Ref: ${entry.reference}` : 'Payment received')}
                      </td>
                      <td style={{textAlign:'right'}} className={entry.debit > 0 ? 'td-debit' : ''}>
                        {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                      </td>
                      <td style={{textAlign:'right'}} className={entry.credit > 0 ? 'td-credit' : ''}>
                        {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                      </td>
                      <td style={{textAlign:'right'}} className={entry.runningBalance > 0 ? 'td-balance-pos' : 'td-balance-neg'}>
                        {formatCurrency(Math.abs(entry.runningBalance))} {entry.runningBalance > 0 ? 'Dr' : entry.runningBalance < 0 ? 'Cr' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-summary-row">
                    <td colSpan={3}><strong>Closing Balance</strong></td>
                    <td style={{textAlign:'right'}}><strong>{formatCurrency(ledger.totalSales)}</strong></td>
                    <td style={{textAlign:'right'}}><strong>{formatCurrency(ledger.totalReceived)}</strong></td>
                    <td style={{textAlign:'right', color: ledger.totalDue > 0 ? 'var(--danger)' : 'var(--success)'}}>
                      <strong>{formatCurrency(ledger.totalDue)} {ledger.totalDue > 0 ? 'Dr' : ''}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title="⚖️ Manual Balance Adjustment" size="sm">
        <form onSubmit={handleAdjust}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Adjustment Type</label>
            <select className="form-control" value={adjust.adjustmentType} onChange={e => setAdjust(a => ({...a, adjustmentType: e.target.value}))}>
              <option value="credit">Credit (Reduce Due)</option>
              <option value="debit">Debit (Increase Due)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Amount (₹) *</label>
            <input type="number" className="form-control" value={adjust.amount} onChange={e => setAdjust(a => ({...a, amount: e.target.value}))} placeholder="0.00" step="any" min="0" required />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={adjust.date} onChange={e => setAdjust(a => ({...a, date: e.target.value}))} />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Reason *</label>
            <input className="form-control" value={adjust.reason} onChange={e => setAdjust(a => ({...a, reason: e.target.value}))} placeholder="e.g. Discount, Return, Write-off..." required />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAdjust(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Apply Adjustment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
