import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, RefreshCw, Wifi, WifiOff, LayoutDashboard, Package, Boxes, ScrollText } from 'lucide-react';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { NotificationBell } from '../../components/NotificationBell';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const sync = useOfflineSync();
  const username = localStorage.getItem('dapur_username') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('dapur_token');
    localStorage.removeItem('dapur_role');
    localStorage.removeItem('dapur_username');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2>Dapur Ceu El</h2>
        <nav className="sidebar-nav">
          <Link to="/admin" className={isActive('/admin')}>
            <LayoutDashboard size={20} />
            Dashboard Pesanan
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products')}>
            <Package size={20} />
            Katalog
          </Link>
          <Link to="/admin/ingredients" className={isActive('/admin/ingredients')}>
            <Boxes size={20} />
            Bahan Baku
          </Link>
          <Link to="/admin/recipes" className={isActive('/admin/recipes')}>
            <ScrollText size={20} />
            BOM / Resep
          </Link>
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div>
            <p>Admin Workspace</p>
            <h1>Halo, {username}</h1>
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
