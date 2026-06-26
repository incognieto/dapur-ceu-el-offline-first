import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { api } from '../../lib/api';

export function ManageProductsPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('kue_basah');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createProduct({ name, category: category as any, price, available: true });
    await sync.pull();
    setName('');
    setPrice('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus produk?')) {
      await api.deleteProduct(id);
      await sync.pull();
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel">
        <h2>Kelola Katalog Produk</h2>
        <form onSubmit={handleSubmit} className="form-stack" style={{ marginTop: '1rem' }}>
          <div className="two-col">
            <input type="text" placeholder="Nama Produk" value={name} onChange={e => setName(e.target.value)} required />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="kue_basah">Kue Basah</option>
              <option value="kue_kering">Kue Kering</option>
              <option value="bolu">Bolu</option>
            </select>
          </div>
          <input type="number" placeholder="Harga" value={price} onChange={e => setPrice(e.target.value)} required />
          <button className="primary-action" type="submit">Tambah Produk</button>
        </form>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '0.75rem' }}>Nama</th>
              <th style={{ padding: '0.75rem' }}>Kategori</th>
              <th style={{ padding: '0.75rem' }}>Harga</th>
              <th style={{ padding: '0.75rem' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sync.products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>{p.name}</td>
                <td style={{ padding: '0.75rem' }}>{p.category.replace('_', ' ')}</td>
                <td style={{ padding: '0.75rem' }}>Rp {Number(p.price).toLocaleString('id-ID')}</td>
                <td style={{ padding: '0.75rem' }}><button onClick={() => handleDelete(p.id)} style={{ background: 'var(--color-secondary)', color: '#fff', padding: '0.4rem 0.8rem' }}>Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
