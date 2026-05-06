import React, { useState, useEffect } from 'react';
import api, { formatCurrency, formatDate } from '../utils/api';
import { Loading, EmptyState, Modal, StatCard } from '../components/common';
import toast from 'react-hot-toast';

export default function VendorLedger() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjust, setAdjust] = useState({ adjustmentType: 'credit', amount: '', reason: '', date: '' });

  useEffect(() => { fetchVendors(); }, []);
  useEffect(() => { if (selectedVendor) fetchLedger(); }, [selectedVendor, from, to]);

  const fetchVendors = async () => {
    try { const res = await api.get('/parties?type=vendor'); setVendors(res.data); } catch {}
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get(`/purchases/ledger/${encodeURIComponent(selectedVendor)}`, { params });
      setLedger(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parties/adjust-balance', { partyName: selectedVendor, partyType: 'vendor', ...adjust, amount: parseFloat(adjust.amount) });
      toast.success('Balance adjusted'); setShowAdjust(false);
      setAdjust({ adjustmentType: 'credit', amount: '', reason: '', date: '' });
      fetchLedger();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Vendor Ledger</h1><p>Full purchase and payment history per vendor</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedVendor && <button className="btn btn-outline" onClick={() => setShowAdjust(true)}>⚖️ Adjust Balance</button>}
          {selectedVendor && <button className="btn btn-dark" onClick={() => window.open(`/api/pdf/vendor-ledger/${encodeURIComponent(selectedVendor)}`, '_blank')}>📄 Download PDF</button>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ minWidth: 250 }}>
              <label className="form-label">Select Vendor *</label>
              <select className="form-control" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
                <option value="">-- Choose Vendor --</option>
                {vendors.map(v => <option key={v._id} value={v.name}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From</label>
              <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {ledger && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
          <StatCard icon="🛒" label="Total Purchases" value={formatCurrency(ledger.totalPurchases)} color="blue" />
          <StatCard icon="✅" label="Total Paid" value={formatCurrency(ledger.totalPaid)} color="green" />
          <StatCard icon="⏳" label="Payable Balance" value={formatCurrency(ledger.totalPayable)} color={ledger.totalPayable > 0 ? 'red' : 'green'} sub={ledger.totalPayable > 0 ? '⚠️ Pending' : '✅ Cleared'} />
        </div>
      )}

      {!selectedVendor ? (
        <div className="card"><EmptyState icon="📔" text="Select a vendor to view ledger" /></div>
      ) : loading ? <Loading /> : !ledger ? null : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📔 Ledger — {selectedVendor}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ledger.ledgerEntries.length} entries</span>
          </div>
          <div className="table-wrapper">
            {ledger.ledgerEntries.length === 0 ? <EmptyState icon="📭" text="No transactions" /> : (
              <table>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Particulars</th><th style={{textAlign:'right'}}>Debit (₹)</th><th style={{textAlign:'right'}}>Credit (₹)</th><th style={{textAlign:'right'}}>Balance (₹)</th></tr>
                </thead>
                <tbody>
                  {ledger.ledgerEntries.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.formattedDate}</td>
                      <td>
                        <span className={`badge ${entry.entryType === 'purchase' ? 'badge-pending' : entry.entryType === 'payment' ? 'badge-paid' : 'badge-upi'}`}>
                          {entry.entryType === 'purchase' ? 'Purchase' : entry.entryType === 'payment' ? 'Payment' : 'Adjustment'}
                        </span>
                      </td>
                      <td>
                        {entry.entryType === 'purchase' ? (
                          <span><strong>{entry.materialName}</strong><br /><span style={{fontSize:11,color:'var(--text-muted)'}}>{entry.quantity} {entry.unit} × ₹{entry.rate}</span></span>
                        ) : entry.entryType === 'adjustment' ? entry.reason : (entry.reference || 'Payment made')}
                      </td>
                      <td style={{textAlign:'right'}} className={entry.debit > 0 ? 'td-debit' : ''}>{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
                      <td style={{textAlign:'right'}} className={entry.credit > 0 ? 'td-credit' : ''}>{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
                      <td style={{textAlign:'right'}} className={entry.runningBalance > 0 ? 'td-balance-pos' : 'td-balance-neg'}>
                        {formatCurrency(Math.abs(entry.runningBalance))} {entry.runningBalance > 0 ? 'Dr' : entry.runningBalance < 0 ? 'Cr' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-summary-row">
                    <td colSpan={3}><strong>Closing Balance</strong></td>
                    <td style={{textAlign:'right'}}><strong>{formatCurrency(ledger.totalPurchases)}</strong></td>
                    <td style={{textAlign:'right'}}><strong>{formatCurrency(ledger.totalPaid)}</strong></td>
                    <td style={{textAlign:'right', color: ledger.totalPayable > 0 ? 'var(--danger)' : 'var(--success)'}}>
                      <strong>{formatCurrency(ledger.totalPayable)} {ledger.totalPayable > 0 ? 'Dr' : ''}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title="⚖️ Adjust Vendor Balance" size="sm">
        <form onSubmit={handleAdjust}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Type</label>
            <select className="form-control" value={adjust.adjustmentType} onChange={e => setAdjust(a => ({...a, adjustmentType: e.target.value}))}>
              <option value="credit">Credit (Reduce Payable)</option>
              <option value="debit">Debit (Increase Payable)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Amount (₹) *</label>
            <input type="number" className="form-control" value={adjust.amount} onChange={e => setAdjust(a => ({...a, amount: e.target.value}))} placeholder="0.00" required />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={adjust.date} onChange={e => setAdjust(a => ({...a, date: e.target.value}))} />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Reason *</label>
            <input className="form-control" value={adjust.reason} onChange={e => setAdjust(a => ({...a, reason: e.target.value}))} placeholder="e.g. Discount, Return..." required />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAdjust(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Apply</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
