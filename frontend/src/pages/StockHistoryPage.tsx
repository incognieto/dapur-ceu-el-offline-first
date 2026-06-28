import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { StockMovement } from '../lib/types';
import { useOfflineSync } from '../viewmodels/useOfflineSync';
import { useOutletContext } from 'react-router-dom';

export function StockHistoryPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const data = await api.stockMovements();
      setMovements(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil riwayat stok');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sync.online) {
      fetchMovements();
    } else {
      setError('Riwayat stok realtime tidak tersedia saat offline.');
      setLoading(false);
    }
  }, [sync.online]);

  return (
    <div className="panel" style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Riwayat Pergerakan Stok</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>Memantau stok masuk dan keluar secara realtime.</p>
        </div>
        <button className="btn-primary" onClick={fetchMovements} disabled={!sync.online || loading}>
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          {error}
        </div>
      ) : null}

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
              <th style={{ padding: '1rem' }}>Waktu</th>
              <th style={{ padding: '1rem' }}>Bahan Baku</th>
              <th style={{ padding: '1rem' }}>Jenis</th>
              <th style={{ padding: '1rem' }}>Jumlah</th>
              <th style={{ padding: '1rem' }}>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 && !loading && !error && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Tidak ada riwayat pergerakan stok.
                </td>
              </tr>
            )}
            {movements.map((mov) => (
              <tr key={mov.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem' }}>{new Date(mov.created_at).toLocaleString('id-ID')}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{mov.ingredient_name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: mov.kind === 'masuk' ? '#dcfce7' : (mov.kind === 'keluar' ? '#fee2e2' : '#fef9c3'),
                    color: mov.kind === 'masuk' ? '#166534' : (mov.kind === 'keluar' ? '#991b1b' : '#854d0e')
                  }}>
                    {mov.kind}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{mov.quantity} {mov.unit}</td>
                <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{mov.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
