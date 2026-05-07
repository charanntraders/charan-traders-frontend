import React, { useState, useEffect } from 'react';
import api, { formatCurrency, formatDate } from '../utils/api';
import { ConfirmDialog, Loading, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  cashSale: { label: 'Cash Sale', icon: '💵', color: '#2d7a4f' },
  creditSale: { label: 'Credit Sale', icon: '📋', color: '#1a6b9a' },
  customerPayment: { label: 'Customer Payment', icon: '💳', color: '#7c3aed' },
  purchase: { label: 'Purchase', icon: '🛒', color: '#b7770d' },
  vendorPayment: { label: 'Vendor Payment', icon: '🏦', color: '#c0392b' },
  expense: { label: 'Expense', icon: '💸', color: '#555' }
};

function getItemDisplay(type, item) {
  switch (type) {
    case 'cashSale': return { main: item.materialName, sub: `${item.customerName} — ${formatCurrency(item.amount)}`, date: item.date };
    case 'creditSale': return { main: item.materialName, sub: `${item.partyName} — ${formatCurrency(item.amount)}`, date: item.date };
    case 'customerPayment': return { main: `₹${item.amountReceived} received`, sub: item.partyName, date: item.date };
    case 'purchase': return { main: item.materialName, sub: `${item.vendorName} — ${formatCurrency(item.amount)}`, date: item.date };
    case 'vendorPayment': return { main: `₹${item.amountPaid} paid`, sub: item.vendorName, date: item.date };
    case 'expense': return { main: item.description, sub: `${item.category} — ${formatCurrency(item.amount)}`, date: item.date };
    default: return { main: 'Unknown', sub: '', date: item.date };
  }
}

export default function Trash() {
  const [trash, setTrash] = useState({});
  const [loading, setLoading] = useState(true);
  const [restoreItem, setRestoreItem] = useState(null);
  const [permanentDelete, setPermanentDelete] = useState(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchTrash(); }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try { const res = await api.get('/trash'); setTrash(res.data); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleRestore = async () => {
    try {
      await api.post(`/trash/restore/${restoreItem.type}/${restoreItem.item._id}`);
      toast.success('Item restored successfully');
      setRestoreItem(null); fetchTrash();
    } catch (err) { toast.error(err.message); }
  };

  const handlePermanentDelete = async () => {
    try {
      await api.delete(`/trash/permanent/${permanentDelete.type}/${permanentDelete.item._id}`);
      toast.success('Permanently deleted');
      setPermanentDelete(null); fetchTrash();
    } catch (err) { toast.error(err.message); }
  };

  const handleEmptyTrash = async () => {
    try {
      await api.delete('/trash/empty');
      toast.success('Trash emptied');
      setEmptyConfirm(false); fetchTrash();
    } catch (err) { toast.error(err.message); }
  };

  const allItems = Object.entries(trash).flatMap(([type, items]) =>
    (items || []).map(item => ({ type, item }))
  ).sort((a, b) => new Date(b.item.deletedAt || b.item.updatedAt) - new Date(a.item.deletedAt || a.item.updatedAt));

  const filteredItems = activeTab === 'all' ? allItems : allItems.filter(x => x.type === activeTab);
  const totalCount = allItems.length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Trash</h1>
          <p>{totalCount} deleted item{totalCount !== 1 ? 's' : ''} — restore or permanently delete</p>
        </div>
        {totalCount > 0 && (
          <button className="btn btn-danger" onClick={() => setEmptyConfirm(true)}>🗑️ Empty Trash</button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({totalCount})</button>
        {Object.entries(TYPE_LABELS).map(([key, meta]) => {
          const count = (trash[key] || []).length;
          if (count === 0) return null;
          return <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{meta.icon} {meta.label} ({count})</button>;
        })}
      </div>

      {loading ? <Loading /> : filteredItems.length === 0 ? (
        <div className="card"><EmptyState icon="🗑️" text="Trash is empty" sub="Deleted items appear here and can be restored" /></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Type</th><th>Details</th><th>Date</th><th>Deleted At</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredItems.map(({ type, item }, i) => {
                  const meta = TYPE_LABELS[type];
                  const display = getItemDisplay(type, item);
                  return (
                    <tr key={i}>
                      <td>
                        <span style={{ background: `${meta.color}18`, color: meta.color, borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 600 }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{display.main}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{display.sub}</div>
                      </td>
                      <td>{formatDate(display.date)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(item.deletedAt || item.updatedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-success" onClick={() => setRestoreItem({ type, item })}>↩ Restore</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setPermanentDelete({ type, item })}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!restoreItem} onConfirm={handleRestore} onCancel={() => setRestoreItem(null)}
        title="Restore this item?" message="The item will be restored and balances will be recalculated automatically." confirmLabel="Restore" danger={false} />

      <ConfirmDialog isOpen={!!permanentDelete} onConfirm={handlePermanentDelete} onCancel={() => setPermanentDelete(null)}
        title="Permanently Delete?" message="This cannot be undone. The item will be gone forever." confirmLabel="Delete Forever" />

      <ConfirmDialog isOpen={emptyConfirm} onConfirm={handleEmptyTrash} onCancel={() => setEmptyConfirm(false)}
        title="Empty Trash?" message={`This will permanently delete all ${totalCount} items. This cannot be undone.`} confirmLabel="Empty Trash" />
    </div>
  );
}
