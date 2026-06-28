import { useOutletContext } from 'react-router-dom';
import { OrdersPanel } from '../../components/OrdersPanel';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';

export function StafDashboardPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  // Filter orders that are diproses
  const processingOrders = sync.orders.filter(o => o.status === 'diproses');
  
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2>Daftar Pesanan yang Sedang Diproses</h2>
        <OrdersPanel orders={processingOrders} onUpdateStatus={sync.updateStatus} />
      </div>
      <div>
        <h2>Rincian Bahan Baku Diperlukan</h2>
        {processingOrders.length === 0 ? (
          <p>Tidak ada pesanan yang diproses saat ini.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {processingOrders.map(order => (
              <div key={order.id} className="glass-card" style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Pesanan: {order.customer_name}</h4>
                {order.stock_estimation?.requirements ? (
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                    {order.stock_estimation.requirements.map((req: any, i: number) => (
                      <li key={i}>
                        {req.ingredient_name}: <strong>{req.required}</strong> {req.unit}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'gray' }}>Tidak ada estimasi bahan baku.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
