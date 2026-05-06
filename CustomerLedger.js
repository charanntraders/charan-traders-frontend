:root {
  --gold: #C9A84C;
  --gold-light: #e8c96a;
  --gold-dark: #a07c30;
  --dark: #1a1a2e;
  --dark-mid: #16213e;
  --dark-light: #0f3460;
  --bg: #f5f4f0;
  --bg-card: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #5a5a6e;
  --text-muted: #9a9aaa;
  --border: #e8e6e0;
  --border-dark: #d0cdc6;
  --success: #2d7a4f;
  --success-bg: #e8f5ee;
  --danger: #c0392b;
  --danger-bg: #fdecea;
  --warning: #d68910;
  --warning-bg: #fef9e7;
  --info: #1a6b9a;
  --info-bg: #e8f4fb;
  --shadow-sm: 0 1px 3px rgba(26,26,46,0.08);
  --shadow-md: 0 4px 12px rgba(26,26,46,0.12);
  --shadow-lg: 0 8px 24px rgba(26,26,46,0.16);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --sidebar-width: 240px;
  --header-height: 60px;
  --font-display: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--gold-dark); }

/* Layout */
.app-layout { display: flex; min-height: 100vh; }

.sidebar {
  width: var(--sidebar-width);
  background: var(--dark);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  display: flex; flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(201,168,76,0.2);
  display: flex; align-items: center; gap: 10px;
}

.sidebar-logo img { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }

.sidebar-logo-text .name {
  font-family: var(--font-display);
  color: var(--gold);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.sidebar-logo-text .tagline {
  color: rgba(255,255,255,0.4);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-nav { flex: 1; padding: 12px 0; }

.nav-section-title {
  color: rgba(255,255,255,0.3);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 12px 16px 4px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  font-size: 13.5px;
  font-weight: 400;
  text-decoration: none;
  user-select: none;
}

.nav-item:hover { color: white; background: rgba(255,255,255,0.05); }
.nav-item.active { color: var(--gold); background: rgba(201,168,76,0.1); border-left-color: var(--gold); font-weight: 600; }
.nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

.main-content {
  margin-left: var(--sidebar-width);
  flex: 1;
  display: flex; flex-direction: column;
  min-height: 100vh;
}

.topbar {
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  position: sticky; top: 0; z-index: 50;
  box-shadow: var(--shadow-sm);
}

.topbar-title { font-family: var(--font-display); font-size: 20px; color: var(--dark); font-weight: 600; }
.topbar-right { display: flex; align-items: center; gap: 12px; }

.page-content { padding: 24px; flex: 1; }

/* Cards */
.card {
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}

.card-title { font-size: 15px; font-weight: 600; color: var(--dark); }
.card-body { padding: 20px; }

/* Stats cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}

.stat-card.gold::before { background: var(--gold); }
.stat-card.green::before { background: var(--success); }
.stat-card.red::before { background: var(--danger); }
.stat-card.blue::before { background: var(--info); }
.stat-card.purple::before { background: #7c3aed; }

.stat-icon { font-size: 24px; margin-bottom: 8px; }
.stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 22px; font-weight: 700; color: var(--dark); margin-top: 4px; font-family: var(--font-display); }
.stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: var(--font-body);
  white-space: nowrap;
  text-decoration: none;
}

.btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary { background: var(--gold); color: var(--dark); }
.btn-primary:hover:not(:disabled) { background: var(--gold-light); box-shadow: var(--shadow-md); }

.btn-dark { background: var(--dark); color: white; }
.btn-dark:hover:not(:disabled) { background: var(--dark-mid); }

.btn-outline { background: transparent; border: 1.5px solid var(--border-dark); color: var(--text-primary); }
.btn-outline:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }

.btn-danger { background: var(--danger-bg); color: var(--danger); border: 1px solid #f5c6c2; }
.btn-danger:hover:not(:disabled) { background: var(--danger); color: white; }

.btn-success { background: var(--success-bg); color: var(--success); border: 1px solid #b8dfc9; }
.btn-success:hover:not(:disabled) { background: var(--success); color: white; }

.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-lg { padding: 11px 22px; font-size: 15px; }
.btn-icon { padding: 7px; border-radius: var(--radius-sm); }

/* Forms */
.form-grid { display: grid; gap: 16px; }
.form-grid-2 { grid-template-columns: repeat(2, 1fr); }
.form-grid-3 { grid-template-columns: repeat(3, 1fr); }
.form-grid-4 { grid-template-columns: repeat(4, 1fr); }

.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }

.form-control {
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
}

.form-control.error { border-color: var(--danger); }
.form-error { font-size: 11px; color: var(--danger); }

.form-control-computed {
  background: #f8f7f4;
  border-style: dashed;
  font-weight: 600;
  color: var(--dark);
}

/* Tables */
.table-wrapper { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }

thead th {
  padding: 10px 14px;
  background: var(--dark);
  color: rgba(255,255,255,0.85);
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  text-align: left;
  white-space: nowrap;
}

thead th:first-child { border-radius: 6px 0 0 0; }
thead th:last-child { border-radius: 0 6px 0 0; }

tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
tbody tr:hover { background: #faf9f6; }
tbody tr:last-child { border-bottom: none; }

tbody td { padding: 10px 14px; font-size: 13.5px; color: var(--text-primary); }

.td-amount { font-weight: 600; font-family: var(--font-display); color: var(--dark); }
.td-credit { color: var(--success); font-weight: 600; }
.td-debit { color: var(--danger); font-weight: 600; }
.td-balance-pos { color: var(--danger); font-weight: 700; }
.td-balance-neg { color: var(--success); font-weight: 700; }

/* Badges */
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
}

.badge-cash { background: #e8f5ee; color: var(--success); }
.badge-upi { background: #e8f0fb; color: #1a5276; }
.badge-bank { background: #f0e8fb; color: #6c3483; }
.badge-cheque { background: var(--warning-bg); color: var(--warning); }
.badge-overdue { background: var(--danger-bg); color: var(--danger); }
.badge-paid { background: var(--success-bg); color: var(--success); }
.badge-pending { background: var(--warning-bg); color: var(--warning); }

/* Filter bar */
.filter-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: #faf9f6;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.filter-bar .form-control { max-width: 200px; }

.quick-filter-btn {
  padding: 5px 12px;
  border-radius: 100px;
  border: 1.5px solid var(--border-dark);
  background: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.quick-filter-btn.active, .quick-filter-btn:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--dark);
  font-weight: 600;
}

/* Autocomplete */
.autocomplete-wrapper { position: relative; }
.autocomplete-dropdown {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: white;
  border: 1.5px solid var(--gold);
  border-top: none;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  max-height: 200px;
  overflow-y: auto;
  z-index: 200;
  box-shadow: var(--shadow-md);
}

.autocomplete-item {
  padding: 9px 12px;
  cursor: pointer;
  font-size: 13.5px;
  border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}

.autocomplete-item:hover { background: #faf9f4; color: var(--gold-dark); }
.autocomplete-item:last-child { border-bottom: none; }
.autocomplete-balance { font-size: 11px; color: var(--danger); font-weight: 600; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(26,26,46,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-sm { max-width: 420px; }
.modal-md { max-width: 600px; }
.modal-lg { max-width: 860px; }
.modal-xl { max-width: 1100px; }

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--dark);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.modal-title { color: var(--gold); font-family: var(--font-display); font-size: 17px; font-weight: 600; }
.modal-close {
  background: none; border: none; color: rgba(255,255,255,0.6);
  font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 4px;
  transition: color 0.2s;
}
.modal-close:hover { color: white; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

/* Ledger */
.ledger-running-bal { text-align: right; }
.overdue-row { background: #fff8f7 !important; }
.overdue-row td { border-left: 3px solid var(--danger); }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
.empty-state-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
.empty-state-text { font-size: 15px; }
.empty-state-sub { font-size: 13px; margin-top: 4px; }

/* Tabs */
.tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 20px; gap: 0; }
.tab-btn {
  padding: 10px 20px; font-size: 13.5px; font-weight: 500;
  border: none; background: none; cursor: pointer;
  color: var(--text-secondary); border-bottom: 2px solid transparent; margin-bottom: -2px;
  transition: all 0.2s; font-family: var(--font-body);
}
.tab-btn.active { color: var(--gold-dark); border-bottom-color: var(--gold); font-weight: 600; }
.tab-btn:hover:not(.active) { color: var(--text-primary); }

/* Toast override */
.go2072408551 { font-family: var(--font-body) !important; }

/* Responsive */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin-left: 0; }
  .form-grid-2, .form-grid-3, .form-grid-4 { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .page-content { padding: 16px; }
  .topbar { padding: 0 16px; }
  .modal-overlay { padding: 10px; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn 0.25s ease; }

@keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }

/* Confirm dialog */
.confirm-dialog { text-align: center; padding: 8px 0; }
.confirm-dialog .icon { font-size: 40px; margin-bottom: 12px; }
.confirm-dialog h3 { font-size: 17px; margin-bottom: 8px; color: var(--dark); }
.confirm-dialog p { color: var(--text-secondary); font-size: 13.5px; line-height: 1.5; }

/* Amount display */
.amount-large { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.amount-gold { color: var(--gold-dark); }
.amount-danger { color: var(--danger); }
.amount-success { color: var(--success); }

/* Page header */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-header-left h1 { font-family: var(--font-display); font-size: 22px; color: var(--dark); font-weight: 700; }
.page-header-left p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

/* Print styles */
@media print {
  .sidebar, .topbar, .no-print { display: none !important; }
  .main-content { margin-left: 0; }
}

/* Overdue highlight */
.highlight-overdue { background: linear-gradient(90deg, #fff8f7, white) !important; }
.highlight-large-due { background: linear-gradient(90deg, #fff3f3, white) !important; }

/* Summary row in tables */
.table-summary-row td { background: #faf7ee; font-weight: 700; border-top: 2px solid var(--gold); }

/* Loading */
.loading-spinner {
  display: inline-block; width: 20px; height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.loading-overlay {
  display: flex; align-items: center; justify-content: center;
  padding: 40px; color: var(--text-muted);
  flex-direction: column; gap: 12px;
}
