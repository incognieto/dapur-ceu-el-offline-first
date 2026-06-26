import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, RefreshCw, Wifi, WifiOff, ClipboardList, PenTool } from 'lucide-react';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { NotificationBell } from '../../components/NotificationBell';

export function StafLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const sync = useOfflineSync();
  const username = localStorage.getItem('dapur_username') || 'Staf Produksi';

  const handleLogout = () => {
    localStorage.removeItem('dapur_token');
    localStorage.removeItem('dapur_role');
    localStorage.removeItem('dapur_username');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" style={{ borderRightColor: 'rgba(59, 130, 246, 0.3)' }}>
        <h2 style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', WebkitBackgroundClip: 'text' }}>
          Dapur Ceu El
        </h2>
        <nav className="sidebar-nav">
          <Link to="/staf" className={isActive('/staf')}>
            <ClipboardList size={20} />
            Kebutuhan Produksi
          </Link>
          <Link to="/staf/stock" className={isActive('/staf/stock')}>
            <PenTool size={20} />
            Update Stok Manual
          </Link>
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div>
            <p>Staf Produksi</p>
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
