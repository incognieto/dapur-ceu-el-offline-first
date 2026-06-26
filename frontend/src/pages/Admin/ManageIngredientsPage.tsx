import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { api } from '../../lib/api';

export function ManageIngredientsPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [minStock, setMinStock] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createIngredient({ name, unit, stock_minimum: minStock || '0' });
    await sync.pull();
    setName('');
    setMinStock('');
  };

  const handleDelete = async (id: string, name: string) => {
    const qtyStr = prompt(`Berapa kuantitas ${name} yang akan dihapus/dibuang?`);
    if (qtyStr !== null) {
      const qty = parseFloat(qtyStr);
      if (isNaN(qty) || qty <= 0) {
        alert('Kuantitas tidak valid.');
        return;
      }
      try {
        await api.adjustStock({ ingredient_id: id, kind: 'keluar', quantity: qty, note: 'Dihapus manual' });
        await sync.pull();
      } catch (err: any) {
        alert(err.message || 'Gagal mengurangi stok');
      }
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel">
        <h2>Kelola Bahan Baku</h2>
        <form onSubmit={handleSubmit} className="form-stack" style={{ marginTop: '1rem' }}>
          <div className="two-col">
            <input type="text" placeholder="Nama Bahan Baku" value={name} onChange={e => setName(e.target.value)} required />
            <input type="text" placeholder="Satuan (kg, gr, pcs)" value={unit} onChange={e => setUnit(e.target.value)} required />
          </div>
          <input type="number" placeholder="Stok Minimum" value={minStock} onChange={e => setMinStock(e.target.value)} />
          <button className="primary-action" type="submit">Tambah Bahan</button>
        </form>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '0.75rem' }}>Nama</th>
              <th style={{ padding: '0.75rem' }}>Satuan</th>
              <th style={{ padding: '0.75rem' }}>Stok Saat Ini</th>
              <th style={{ padding: '0.75rem' }}>Stok Min</th>
              <th style={{ padding: '0.75rem' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sync.ingredients.map(ing => (
              <tr key={ing.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>{ing.name}</td>
                <td style={{ padding: '0.75rem' }}>{ing.unit}</td>
                <td style={{ padding: '0.75rem' }}>{ing.stock_current}</td>
                <td style={{ padding: '0.75rem' }}>{ing.stock_minimum}</td>
                <td style={{ padding: '0.75rem' }}><button onClick={() => handleDelete(ing.id, ing.name)} style={{ background: 'var(--color-secondary)', color: '#fff', padding: '0.4rem 0.8rem' }}>Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
