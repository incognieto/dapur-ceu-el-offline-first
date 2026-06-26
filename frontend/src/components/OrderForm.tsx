import { CalendarCheck, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { OrderPayload, Product } from '../lib/types';

type Props = {
  products: Product[];
  selectedProductId: string;
  onProductChange: (id: string) => void;
  onSubmit: (payload: OrderPayload) => Promise<void>;
};

export function OrderForm({ products, selectedProductId, onProductChange, onSubmit }: Props) {
  const [customerName, setCustomerName] = useState(localStorage.getItem('dapur_username') || '');
  const [contact, setContact] = useState('+62');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'satuan' | 'bulk'>('satuan');
  const [neededAt, setNeededAt] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon isi nama pelanggan dengan benar.');
      return;
    }
    if (!contact.trim()) {
      alert('Mohon isi kontak yang bisa dihubungi.');
      return;
    }
    if (quantity < 1) {
      alert('Kuantitas minimal adalah 1.');
      return;
    }
    if (!neededAt) {
      alert('Mohon isi tanggal kebutuhan pesanan.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        customer_name: customerName.trim(),
        customer_contact: contact.trim(),
        order_type: orderType,
        needed_at: neededAt || undefined,
        items: [{ product_id: selectedProductId, quantity }]
      });
      setQuantity(1);
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan saat menyimpan pesanan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Formulir Pesanan</h2>
        </div>
        <CalendarCheck aria-hidden="true" />
      </div>
      <form className="form-stack" onSubmit={submit}>
        <label>
          Nama Pelanggan
          <input value={customerName} readOnly style={{ backgroundColor: 'var(--color-bg)' }} />
        </label>
        <label>
          Kontak
          <input value={contact} onChange={(event) => setContact(event.target.value)} />
        </label>
        <label>
          Produk
          <select value={selectedProductId} onChange={(event) => onProductChange(event.target.value)}>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <div className="two-col">
          <label>
            Jumlah
            <input min="1" type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          </label>
          <label>
            Tipe
            <select value={orderType} onChange={(event) => setOrderType(event.target.value as 'satuan' | 'bulk')}>
              <option value="satuan">Satuan</option>
              <option value="bulk">Bulk order</option>
            </select>
          </label>
        </div>
        <label>
          Tanggal kebutuhan
          <input type="date" value={neededAt} onChange={(event) => setNeededAt(event.target.value)} required />
        </label>
        <button className="primary-action" disabled={!selectedProductId || saving} type="submit">
          <Send size={18} />
          {saving ? 'Menyimpan...' : 'Kirim pesanan'}
        </button>
      </form>
    </section>
  );
}

