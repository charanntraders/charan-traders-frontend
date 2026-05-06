import React, { useState, useEffect, useCallback } from 'react';
import api, { formatCurrency, formatDate, todayIST } from '../utils/api';
import { ConfirmDialog, AutocompleteInput, PaymentBadge, Loading, EmptyState, QuickFilters, Modal, ActionButtons, StatCard } from '../components/common';
import { useMaterials, useUnits, useDraftForm } from '../hooks/useMaterials';
import toast from 'react-hot-toast';

const DEFAULT_FORM = { date: todayIST(), customerName: '', materialName: '', quantity: '', unit: 'kg', rate: '', amount: '', paymentMode: '', notes: '' };

export default function CashSales() {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [filter, setFilter] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const { materials, addMaterial } = useMaterials();
  const { units, addUnit } = useUnits();
  const { values: form, updateField, clearDraft, setAll } = useDraftForm('cashsale', DEFAULT_FORM);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter === 'today') params.today = true;
      else if (filter === 'month') params.thisMonth = true;
      else if (filter === 'custom') { if (from) params.from = from; if (to) params.to = to; }
      if (search) params.search = search;
      if (paymentFilter) params.paymentMode = paymentFilter;
      const res = await api.get('/cash-sales', { params });
      setSales(res.data.sales);
      setTotal(res.data.total);
      setTotalAmount(res.data.totalAmount);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [filter, from, to, search, paymentFilter]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const computedAmount = form.quantity && form.rate ? (parseFloat(form.quantity) * parseFloat(form.rate)).toFixed(2) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.materialName || !form.quantity || !form.rate || !form.paymentMode) {
      return toast.error('Please fill all required fields');
    }
    const payload = { ...form, amount: parseFloat(computedAmount), quantity: parseFloat(form.quantity), rate: parseFloat(form.rate) };
    try {
      if (editItem) {
        await api.put(`/cash-sales/${editItem._id}`, payload);
        toast.success('Sale updated');
      } else {
        await api.post('/cash-sales', payload);
        toast.success('Sale recorded');
      }
      addMaterial(form.materialName);
      addUnit(form.unit);
      clearDraft();
      setShowForm(false);
      setEditItem(null);
      fetchSales();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setAll({ date: item.date?.split('T')[0], customerName: item.customerName, materialName: item.materialName, quantity: item.quantity, unit: item.unit, rate: item.rate, amount: item.amount, paymentMode: item.paymentMode, notes: item.notes || '' });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/cash-sales/${deleteItem._id}`);
      toast.success('Moved to trash');
      setDeleteItem(null);
      fetchSales();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Cash Sales</h1>
          <p>Record and manage all cash transactions</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => { setEditItem(null); clearDraft(); setShowForm(true); }}>
          + New Sale
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <StatCard icon="📦" label="Total Entries" value={total} color="gold" />
        <StatCard icon="💵" label="Total Amount" value={formatCurrency(totalAmount)} color="green" />
        <StatCard icon="📊" label="Avg per Sale" value={total > 0 ? formatCurrency(totalAmount / total) : '₹0'} color="blue" />
      </div>

      <div className="card">
        <QuickFilters active={filter} onChange={setFilter} from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <div className="filter-bar" style={{ borderTop: 'none' }}>
          <input className="form-control" placeholder="🔍 Search customer or material..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
          <select className="form-control" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={{ maxWidth: 150 }}>
            <option value="">All Modes</option>
            {['Cash','UPI','Bank','Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(search || paymentFilter) && <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setPaymentFilter(''); }}>Clear</button>}
        </div>

        <div className="table-wrapper">
          {loading ? <Loading /> : sales.length === 0 ? <EmptyState icon="💵" text="No cash sales found" sub="Click '+ New Sale' to add one" /> : (
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Customer</th><th>Material</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Mode</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s._id}>
                    <td>{formatDate(s.date)}</td>
                    <td>{s.customerName}</td>
                    <td><strong>{s.materialName}</strong></td>
                    <td>{s.quantity} {s.unit}</td>
                    <td>{formatCurrency(s.rate)}</td>
                    <td className="td-amount">{formatCurrency(s.amount)}</td>
                    <td><PaymentBadge mode={s.paymentMode} /></td>
                    <td><ActionButtons onEdit={() => handleEdit(s)} onDelete={() => setDeleteItem(s)} /></td>
                  </tr>
                ))}
                <tr className="table-summary-row">
                  <td colSpan={5}><strong>Total ({sales.length} entries)</strong></td>
                  <td className="td-amount"><strong>{formatCurrency(totalAmount)}</strong></td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? '✏️ Edit Cash Sale' : '+ New Cash Sale'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => updateField('date', e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Customer Name</label>
              <input className="form-control" value={form.customerName} onChange={e => updateField('customerName', e.target.value)} placeholder="Walk-in Customer (optional)" />
            </div>
          </div>
          <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Material Name *</label>
              <AutocompleteInput value={form.materialName} onChange={v => updateField('materialName', v)} suggestions={materials} placeholder="e.g. TMT 8mm, Cement..." onSelect={v => updateField('materialName', v)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <AutocompleteInput value={form.unit} onChange={v => { updateField('unit', v); addUnit(v); }} suggestions={['kg','ton','piece','bundle','box','meter','litre','set','bag','feet','roll','sheet']} placeholder="kg" onSelect={v => { updateField('unit', v); addUnit(v); }} />
            </div>
          </div>
          <div className="form-grid form-grid-4" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input type="number" className="form-control" value={form.quantity} onChange={e => updateField('quantity', e.target.value)} placeholder="0" step="any" min="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Rate (₹/{form.unit || 'unit'}) *</label>
              <input type="number" className="form-control" value={form.rate} onChange={e => updateField('rate', e.target.value)} placeholder="0.00" step="any" min="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (Auto)</label>
              <input className="form-control form-control-computed" value={computedAmount ? '₹' + parseFloat(computedAmount).toLocaleString('en-IN') : ''} readOnly placeholder="Auto-calculated" />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select className="form-control" value={form.paymentMode} onChange={e => updateField('paymentMode', e.target.value)} required>
                <option value="">Select</option>
                {['Cash','UPI','Bank','Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Notes</label>
            <input className="form-control" value={form.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Optional notes..." />
          </div>
          {computedAmount && (
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{form.quantity} {form.unit} × ₹{form.rate} =</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark)', fontFamily: 'var(--font-display)' }}>₹{parseFloat(computedAmount).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg">{editItem ? 'Update Sale' : 'Save Sale'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)}
        title="Delete this sale?" message={`${deleteItem?.materialName} — ${formatCurrency(deleteItem?.amount)} on ${formatDate(deleteItem?.date)}. Moved to trash.`} confirmLabel="Move to Trash" />
    </div>
  );
}
