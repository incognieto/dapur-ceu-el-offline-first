import { useOutletContext } from 'react-router-dom';
import { OrdersPanel } from '../../components/OrdersPanel';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';

export function AdminDashboardPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  
  return (
    <div style={{ width: '100%' }}>
      <OrdersPanel orders={sync.orders} onUpdateStatus={sync.updateStatus} />
    </div>
  );
}
