import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LogOut, RefreshCw, Wifi, WifiOff, Store } from 'lucide-react';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { NotificationBell } from '../../components/NotificationBell';

export function PelangganLayout() {
  const navigate = useNavigate();
  const sync = useOfflineSync();
  const username = localStorage.getItem('dapur_username') || 'Pelanggan';

  const handleLogout = () => {
    localStorage.removeItem('dapur_token');
    localStorage.removeItem('dapur_role');
    localStorage.removeItem('dapur_username');
    navigate('/login');
  };

  const activeOrders = sync.orders.length;

  return (
    <div className="ecommerce-layout">
      <header className="topbar" style={{ padding: '0.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Store size={28} color="var(--color-primary-dark)" />
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Dapur Ceu El</h1>
        </div>
        
        <nav className="ecommerce-top-nav">
          <Link to="/pelanggan">Katalog Belanja</Link>
          <Link to="/pelanggan/history" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            Riwayat Pesanan
            {activeOrders > 0 && (
              <span style={{
                background: 'var(--color-primary)', color: 'white', fontSize: '0.7rem',
                padding: '2px 6px', borderRadius: '10px', marginLeft: '6px', fontWeight: 'bold'
              }}>
                {activeOrders}
              </span>
            )}
          </Link>
        </nav>

        <div className="sync-card">
          <NotificationBell />
          <span style={{ marginRight: '1rem', marginLeft: '1rem', color: 'var(--color-text-muted)' }}>Halo, {username}</span>
          {sync.online ? <Wifi aria-hidden="true" size={18} /> : <WifiOff aria-hidden="true" size={18} />}
          {sync.pendingCount > 0 && <strong>{sync.pendingCount} antrean</strong>}
          <button aria-label="Sinkronkan" onClick={() => sync.syncOutbox()} type="button" title="Sinkronkan Data">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleLogout} title="Logout" type="button" style={{ marginLeft: 8, background: 'var(--color-text-main)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <Outlet context={{ sync }} />
    </div>
  );
}
