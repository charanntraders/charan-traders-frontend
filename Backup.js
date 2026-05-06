import React, { useState, useEffect, useCallback } from 'react';
import api, { formatCurrency, formatDate, todayIST } from '../utils/api';
import { ConfirmDialog, Loading, EmptyState, QuickFilters, Modal, ActionButtons, StatCard, PaymentBadge } from '../components/common';
import { useDraftForm } from '../hooks/useMaterials';
import toast from 'react-hot-toast';

const CATEGORIES = ['Transport','Labour','Office','Rent','Utilities','Salary','Maintenance','Miscellaneous','Other'];
const DEFAULT_FORM = { date: todayIST(), category: '', description: '', amount: '', paymentMode: 'Cash' };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [filter, setFilter] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const { values: form, updateField, clearDraft, setAll } = useDraftForm('expense', DEFAULT_FORM);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (filter === 'today') params.today = true;
      else if (filter === 'month') params.thisMonth = true;
      else if (filter === 'custom') { if (from) params.from = from; if (to) params.to = to; }
      if (catFilter) params.category = catFilter;
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.expenses);
      setTotalAmount(res.data.totalAmount);
      setByCategory(res.data.byCategory);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [filter, from, to, catFilter]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount) return toast.error('Fill all required fields');
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editItem) { await api.put(`/expenses/${editItem._id}`, payload); toast.success('Updated'); }
      else { await api.post('/expenses', payload); toast.success('Expense recorded'); }
      clearDraft(); setShowForm(false); setEditItem(null); fetchExpenses();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setAll({ date: item.date?.split('T')[0], category: item.category, description: item.description, amount: item.amount, paymentMode: item.paymentMode });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try { await api.delete(`/expenses/${deleteItem._id}`); toast.success('Deleted'); setDeleteItem(null); fetchExpenses(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Expenses</h1><p>Track business expenses</p></div>
        <button className="btn btn-primary btn-lg" onClick={() => { setEditItem(null); clearDraft(); setShowForm(true); }}>+ Add Expense</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <StatCard icon="💸" label="Total Expenses" value={formatCurrency(totalAmount)} color="red" />
        <StatCard icon="📊" label="Categories" value={byCategory.length} color="gold" />
        <StatCard icon="📋" label="Total Entries" value={expenses.length} color="blue" />
      </div>

      {byCategory.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">📊 By Category</span></div>
          <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap' }}>
            {byCategory.sort((a,b) => b.total - a.total).map(c => (
              <div key={c._id} onClick={() => setCatFilter(catFilter === c._id ? '' : c._id)}
                style={{ background: catFilter === c._id ? 'var(--dark)' : 'var(--bg)', color: catFilter === c._id ? 'var(--gold)' : 'var(--text-primary)', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', border: '1px solid var(--border)', minWidth: 120 }}>
                <div style={{ fontSize: 12, marginBottom: 2 }}>{c._id}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{formatCurrency(c.total)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.count} entries</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <QuickFilters active={filter} onChange={setFilter} from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <div className="table-wrapper">
          {loading ? <Loading /> : expenses.length === 0 ? <EmptyState icon="💸" text="No expenses found" /> : (
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Mode</th><th>Actions</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e._id}>
                    <td>{formatDate(e.date)}</td>
                    <td><span className="badge badge-upi">{e.category}</span></td>
                    <td>{e.description}</td>
                    <td className="td-amount">{formatCurrency(e.amount)}</td>
                    <td><PaymentBadge mode={e.paymentMode} /></td>
                    <td><ActionButtons onEdit={() => handleEdit(e)} onDelete={() => setDeleteItem(e)} /></td>
                  </tr>
                ))}
                <tr className="table-summary-row">
                  <td colSpan={3}><strong>Total ({expenses.length})</strong></td>
                  <td className="td-amount"><strong>{formatCurrency(totalAmount)}</strong></td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? '✏️ Edit Expense' : '+ Add Expense'} size="md">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => updateField('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={e => updateField('category', e.target.value)} required>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Description *</label>
            <input className="form-control" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="What was the expense for?" required />
          </div>
          <div className="form-grid form-grid-2" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className="form-control" value={form.amount} onChange={e => updateField('amount', e.target.value)} placeholder="0.00" step="any" min="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select className="form-control" value={form.paymentMode} onChange={e => updateField('paymentMode', e.target.value)}>
                {['Cash','UPI','Bank'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg">Save</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)}
        title="Delete expense?" message={`${deleteItem?.description} — ${formatCurrency(deleteItem?.amount)}`} confirmLabel="Delete" />
    </div>
  );
}
