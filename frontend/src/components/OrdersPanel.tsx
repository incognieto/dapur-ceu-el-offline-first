import { Check, ChefHat, PackageCheck, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Order } from '../lib/types';

const nextActions: Record<string, Array<{ status: string; label: string; icon: ReactNode }>> = {
  menunggu_konfirmasi: [
    { status: 'dikonfirmasi', label: 'Konfirmasi', icon: <Check size={16} /> },
    { status: 'dibatalkan', label: 'Batalkan', icon: <X size={16} /> }
  ],
  dikonfirmasi: [{ status: 'diproses', label: 'Proses', icon: <ChefHat size={16} /> }],
  diproses: [{ status: 'siap_diambil', label: 'Siap', icon: <PackageCheck size={16} /> }],
  siap_diambil: [{ status: 'selesai', label: 'Selesai', icon: <Check size={16} /> }]
};

type Props = {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string, reason?: string) => Promise<void>;
  isCustomer?: boolean;
};

export function OrdersPanel({ orders, onUpdateStatus, isCustomer = false }: Props) {
  const [errorOrder, setErrorOrder] = useState<string | null>(null);

  const handleUpdate = async (orderId: string, status: string, reason?: string) => {
    try {
      await onUpdateStatus(orderId, status, reason);
      setErrorOrder(null);
    } catch (err: any) {
      if (err.message && err.message.includes('Stok tidak cukup')) {
        setErrorOrder(orderId);
      } else {
        alert(err.message || 'Gagal mengubah status pesanan');
      }
    }
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Daftar Pesanan</h2>
        </div>
      </div>
      <div className="order-list">
        {orders.map((order) => (
          <article className="order-row" key={order.id}>
            <div>
              <strong>{order.customer_name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <span>📞 {order.customer_contact || '-'}</span>
                {order.needed_at && (
                  <span style={{ marginLeft: '10px' }}>📅 Untuk: {new Date(order.needed_at).toLocaleDateString('id-ID')}</span>
                )}
              </div>
              <span style={{ display: 'block', marginTop: '4px' }}>
                {order.items.map((item) => `${item.product_name} x${item.quantity}`).join(', ')}
              </span>
              {order.stock_estimation?.available === false && <em>Ada estimasi bahan kurang, admin perlu cek restock.</em>}
            </div>
            <div className="order-actions">
              <span className={`status-pill ${order.status}`}>{order.status.replaceAll('_', ' ')}</span>
              {(nextActions[order.status] ?? [])
                .filter((action) => !isCustomer || action.status === 'dibatalkan')
                .map((action) => (
                <button key={action.status} type="button" onClick={() => handleUpdate(order.id, action.status)}>
                  {action.icon}
                  {action.label}
                </button>
              ))}
              {errorOrder === order.id && !isCustomer && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px', color: '#c62828' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <AlertTriangle size={16} /> Stok bahan baku tidak memadai!
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleUpdate(order.id, 'dibatalkan', 'pesanan melebihi stok bahan baku')}
                    style={{ background: '#d32f2f', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}
                  >
                    <X size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                    Tolak Pesanan
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {orders.length === 0 && <p className="empty">Belum ada pesanan tersimpan.</p>}
      </div>
    </section>
  );
}
