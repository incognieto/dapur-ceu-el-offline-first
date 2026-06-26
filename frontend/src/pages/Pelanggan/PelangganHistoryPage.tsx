import { useOutletContext, Link } from 'react-router-dom';
import { OrdersPanel } from '../../components/OrdersPanel';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';

export function PelangganHistoryPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  
  return (
    <div style={{ padding: '2rem clamp(1rem, 4vw, 3rem)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/pelanggan" style={{ fontWeight: 'bold' }}>&larr; Kembali ke Katalog</Link>
        </div>
        <OrdersPanel orders={sync.orders} onUpdateStatus={sync.updateStatus} isCustomer={true} />
      </div>
    </div>
  );
}
