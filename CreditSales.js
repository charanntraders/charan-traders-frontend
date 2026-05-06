import React, { useState, useEffect, useCallback } from 'react';
import api, { formatCurrency, formatDate, todayIST } from '../utils/api';
import { ConfirmDialog, AutocompleteInput, Loading, EmptyState, QuickFilters, Modal, ActionButtons, StatCard } from '../components/common';
import { useMaterials, useUnits } from '../hooks/useMaterials';
import toast from 'react-hot-toast';

const BLANK_ITEM = { materialName: '', quantity: '', unit: 'kg', rate: '', amount: 0 };
const DEFAULT_FORM = { date: todayIST(), partyName: '', notes: '', loading: '', transport: '', items: [{ ...BLANK_ITEM }] };

export default function CreditSales() {
  const [sales, setSales] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [filter, setFilter] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [parties, setParties] = useState([]);
  const [oldDue, setOldDue] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const { materials, addMaterial } = useMaterials();
  const { units, addUnit } = useUnits();

  useEffect(() => { fetchParties(); }, []);

  const fetchParties = async () => {
    try { const res = await api.get('/parties/customers-with-balance'); setParties(res.data); } catch {}
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter === 'today') params.today = true;
      else if (filter === 'month') params.thisMonth = true;
      else if (filter === 'custom') { if (from) params.from = from; if (to) params.to = to; }
      if (search) params.search = search;
      const res = await api.get('/credit-sales', { params });
      setSales(res.data.sales);
      setTotalAmount(res.data.totalAmount);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [filter, from, to, search]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const fetchOldDue = async (name) => {
    if (!name) { setOldDue(0); return; }
    try { const res = await api.get(`/credit-sales/balance/${encodeURIComponent(name)}`); setOldDue(res.data.balance || 0); }
    catch { setOldDue(0); }
  };

  const updateItem = (index, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(field === 'quantity' ? value : items[index].quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : items[index].rate) || 0;
        items[index].amount = qty * rate;
      }
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...BLANK_ITEM }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const itemsTotal = form.items.reduce((s, i) => s + (i.amount || 0), 0);
  const loadingAmt = parseFloat(form.loading) || 0;
  const transportAmt = parseFloat(form.transport) || 0;
  const grandTotal = itemsTotal + loadingAmt + transportAmt;
  const newTotalDue = oldDue + grandTotal;

  const handlePartySelect = (party) => {
    const name = typeof party === 'string' ? party : party.name;
    setForm(f => ({ ...f, partyName: name }));
    fetchOldDue(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.partyName) return toast.error('Enter party name');
    if (form.items.some(i => !i.materialName || !i.quantity || !i.rate)) return toast.error('Fill all item details');

    const primaryItem = form.items[0];
    const payload = {
      date: form.date,
      partyName: form.partyName,
      materialName: form.items.map(i => i.materialName).join(', '),
      quantity: parseFloat(primaryItem.quantity),
      unit: primaryItem.unit,
      rate: parseFloat(primaryItem.rate),
      amount: grandTotal,
      notes: form.notes,
      items: form.items.map(i => ({ ...i, quantity: parseFloat(i.quantity), rate: parseFloat(i.rate), amount: i.amount })),
      loading: loadingAmt,
      transport: transportAmt
    };

    try {
      if (editItem) { await api.put(`/credit-sales/${editItem._id}`, payload); toast.success('Updated'); }
      else { await api.post('/credit-sales', payload); toast.success('Credit sale recorded'); }
      form.items.forEach(i => { addMaterial(i.materialName); addUnit(i.unit); });
      setShowForm(false); setEditItem(null); setForm(DEFAULT_FORM); setOldDue(0);
      fetchSales(); fetchParties();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const items = item.items?.length > 0 ? item.items : [{ materialName: item.materialName, quantity: item.quantity, unit: item.unit, rate: item.rate, amount: item.amount }];
    setForm({ date: item.date?.split('T')[0], partyName: item.partyName, notes: item.notes || '', loading: item.loading || '', transport: item.transport || '', items });
    fetchOldDue(item.partyName);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try { await api.delete(`/credit-sales/${deleteItem._id}`); toast.success('Moved to trash'); setDeleteItem(null); fetchSales(); fetchParties(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Credit Sales</h1><p>Sales on credit — customer ledger entries</p></div>
        <button className="btn btn-primary btn-lg" onClick={() => { setEditItem(null); setForm(DEFAULT_FORM); setOldDue(0); setShowForm(true); }}>+ New Credit Sale</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginBottom: 16 }}>
        <StatCard icon="📋" label="Total Credit Sales (Period)" value={formatCurrency(totalAmount)} color="blue" />
        <StatCard icon="⏳" label="Active Customers" value={parties.filter(p => p.balance > 0).length} color="red" />
      </div>

      <div className="card">
        <QuickFilters active={filter} onChange={setFilter} from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <div className="filter-bar" style={{ borderTop: 'none' }}>
          <input className="form-control" placeholder="🔍 Search party or material..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        </div>
        <div className="table-wrapper">
          {loading ? <Loading /> : sales.length === 0 ? <EmptyState icon="📋" text="No credit sales" /> : (
            <table>
              <thead><tr><th>Date</th><th>Party</th><th>Items</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s._id}>
                    <td>{formatDate(s.date)}</td>
                    <td><strong>{s.partyName}</strong></td>
                    <td>{s.materialName}</td>
                    <td className="td-amount">{formatCurrency(s.amount)}</td>
                    <td><ActionButtons onEdit={() => handleEdit(s)} onDelete={() => setDeleteItem(s)} /></td>
                  </tr>
                ))}
                <tr className="table-summary-row">
                  <td colSpan={3}><strong>Total ({sales.length})</strong></td>
                  <td className="td-amount"><strong>{formatCurrency(totalAmount)}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? '✏️ Edit Credit Sale' : '+ New Credit Sale'} size="xl">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Party Name *</label>
              <AutocompleteInput value={form.partyName} onChange={v => { setForm(f => ({...f, partyName: v})); fetchOldDue(v); }} suggestions={parties} placeholder="Customer name..." onSelect={handlePartySelect} showBalance />
            </div>
          </div>

          {form.partyName && (
            <div style={{ background: oldDue > 0 ? 'var(--warning-bg)' : 'var(--success-bg)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Old Due</span><div style={{ fontWeight: 700, color: oldDue > 0 ? 'var(--warning)' : 'var(--success)', fontSize: 16 }}>{formatCurrency(oldDue)}</div></div>
              {grandTotal > 0 && <>
                <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>This Bill</span><div style={{ fontWeight: 700, fontSize: 16 }}>{formatCurrency(grandTotal)}</div></div>
                <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>New Total Due</span><div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 18 }}>{formatCurrency(newTotalDue)}</div></div>
              </>}
            </div>
          )}

          {/* Items Table */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Items</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Add Item</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--dark)' }}>
                  <th style={{ padding: '8px 10px', color: 'white', fontSize: 12, textAlign: 'left', width: '35%' }}>Material</th>
                  <th style={{ padding: '8px 10px', color: 'white', fontSize: 12, textAlign: 'right', width: '12%' }}>Qty</th>
                  <th style={{ padding: '8px 10px', color: 'white', fontSize: 12, textAlign: 'left', width: '12%' }}>Unit</th>
                  <th style={{ padding: '8px 10px', color: 'white', fontSize: 12, textAlign: 'right', width: '15%' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', color: 'white', fontSize: 12, textAlign: 'right', width: '15%' }}>Amount (₹)</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 4px' }}>
                      <AutocompleteInput value={item.materialName} onChange={v => updateItem(idx, 'materialName', v)} suggestions={materials} placeholder="Material name..." onSelect={v => { updateItem(idx, 'materialName', v); addMaterial(v); }} />
                    </td>
                    <td style={{ padding: '6px 4px' }}>
                      <input type="number" className="form-control" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} placeholder="0" step="any" min="0" style={{ textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '6px 4px' }}>
                      <AutocompleteInput value={item.unit} onChange={v => { updateItem(idx, 'unit', v); addUnit(v); }} suggestions={['kg','ton','piece','bundle','bag','meter','litre','set','feet','roll']} placeholder="kg" onSelect={v => updateItem(idx, 'unit', v)} />
                    </td>
                    <td style={{ padding: '6px 4px' }}>
                      <input type="number" className="form-control" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} placeholder="0.00" step="any" min="0" style={{ textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '6px 4px' }}>
                      <input className="form-control form-control-computed" value={item.amount ? formatCurrency(item.amount) : ''} readOnly style={{ textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      {form.items.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>✕</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loading & Transport */}
          <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Loading (₹)</label>
              <input type="number" className="form-control" value={form.loading} onChange={e => setForm(f => ({...f, loading: e.target.value}))} placeholder="0" step="any" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Transport (₹)</label>
              <input type="number" className="form-control" value={form.transport} onChange={e => setForm(f => ({...f, transport: e.target.value}))} placeholder="0" step="any" min="0" />
            </div>
          </div>

          {/* Total Summary */}
          <div style={{ background: 'var(--dark)', borderRadius: 8, padding: '14px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
              <span>Items Total</span><span>{formatCurrency(itemsTotal)}</span>
            </div>
            {loadingAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
              <span>Loading</span><span>{formatCurrency(loadingAmt)}</span>
            </div>}
            {transportAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
              <span>Transport</span><span>{formatCurrency(transportAmt)}</span>
            </div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold)', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 8 }}>
              <span>TOTAL</span><span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Notes</label>
            <input className="form-control" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Optional..." />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg">{editItem ? 'Update' : 'Save Sale'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)}
        title="Delete credit sale?" message={`${deleteItem?.partyName} — ${formatCurrency(deleteItem?.amount)}`} confirmLabel="Move to Trash" />
    </div>
  );
}
