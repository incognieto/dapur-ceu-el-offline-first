import { useOutletContext } from 'react-router-dom';
import { OrdersPanel } from '../../components/OrdersPanel';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';

export function StafDashboardPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  // Filter orders that are diproses
  const processingOrders = sync.orders.filter(o => o.status === 'diproses');
  
  return (
    <div style={{ width: '100%' }}>
      <h2>Daftar Pesanan yang Sedang Diproses</h2>
      <OrdersPanel orders={processingOrders} onUpdateStatus={sync.updateStatus} />
    </div>
  );
}
