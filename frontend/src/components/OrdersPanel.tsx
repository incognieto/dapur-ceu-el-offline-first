import { Check, ChefHat, PackageCheck, X } from 'lucide-react';
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
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  isCustomer?: boolean;
};

export function OrdersPanel({ orders, onUpdateStatus, isCustomer = false }: Props) {
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
                <button key={action.status} type="button" onClick={() => onUpdateStatus(order.id, action.status)}>
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </article>
        ))}
        {orders.length === 0 && <p className="empty">Belum ada pesanan tersimpan.</p>}
      </div>
    </section>
  );
}
