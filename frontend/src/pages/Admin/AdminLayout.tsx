import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, RefreshCw, Wifi, WifiOff, LayoutDashboard, Package, Boxes, ScrollText, History, Menu, X } from 'lucide-react';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { NotificationBell } from '../../components/NotificationBell';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const sync = useOfflineSync();
  const username = localStorage.getItem('dapur_username') || 'Admin';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('dapur_token');
    localStorage.removeItem('dapur_role');
    localStorage.removeItem('dapur_username');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Dapur Ceu El</h2>
          <button className="mobile-only close-sidebar" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className={isActive('/admin')} onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={20} />
            Dashboard Pesanan
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products')} onClick={() => setIsSidebarOpen(false)}>
            <Package size={20} />
            Katalog
          </Link>
          <Link to="/admin/ingredients" className={isActive('/admin/ingredients')} onClick={() => setIsSidebarOpen(false)}>
            <Boxes size={20} />
            Bahan Baku
          </Link>
          <Link to="/admin/recipes" className={isActive('/admin/recipes')} onClick={() => setIsSidebarOpen(false)}>
            <ScrollText size={20} />
            BOM / Resep
          </Link>
          <Link to="/admin/history" className={isActive('/admin/history')} onClick={() => setIsSidebarOpen(false)}>
            <History size={20} />
            Riwayat Stok
          </Link>
        </nav>
      </aside>
      
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="dashboard-main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-only menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <p>Admin Workspace</p>
              <h1>Halo, {username}</h1>
            </div>
          </div>
          <div className="sync-card">
            <NotificationBell />
            <div style={{ width: 10 }}></div>
            {sync.online ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
            <span>{sync.message}</span>
            {sync.pendingCount > 0 && <strong>{sync.pendingCount} antrean</strong>}
            <button aria-label="Sinkronkan" onClick={() => sync.syncOutbox()} type="button">
              <RefreshCw size={18} />
            </button>
            <button onClick={handleLogout} title="Logout" type="button" style={{ marginLeft: 8 }}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet context={{ sync }} />
        </main>
      </div>
    </div>
  );
}
