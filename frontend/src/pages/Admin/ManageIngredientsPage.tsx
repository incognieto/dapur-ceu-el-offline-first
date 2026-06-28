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
    try {
      await api.createIngredient({ name, unit, stock_minimum: minStock || '0' });
      await sync.pull();
      setName('');
      setMinStock('');
    } catch (err: any) {
      if (err.message === 'Bahan Baku sudah ditambahkan') {
        alert(err.message);
      } else {
        alert(err.message || 'Gagal menambahkan bahan baku');
      }
    }
  };

  const handleKurangi = async (id: string, name: string) => {
    const qtyStr = prompt(`Berapa kuantitas ${name} yang akan dikurangi?`);
    if (qtyStr !== null) {
      const qty = parseFloat(qtyStr);
      if (isNaN(qty) || qty <= 0) {
        alert('Kuantitas tidak valid.');
        return;
      }
      try {
        await api.adjustStock({ ingredient_id: id, kind: 'keluar', quantity: qty.toString(), note: 'Dikurangi manual' });
        await sync.pull();
      } catch (err: any) {
        alert(err.message || 'Gagal mengurangi stok');
      }
    }
  };

  const handleHapus = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus bahan baku ${name} sepenuhnya?`)) {
      try {
        await api.deleteIngredient(id);
        await sync.pull();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus bahan baku');
      }
    }
  };

  const criticalIngredients = sync.ingredients.filter(ing => Number(ing.stock_current) <= Number(ing.stock_minimum));
  const safeIngredients = sync.ingredients.filter(ing => Number(ing.stock_current) > Number(ing.stock_minimum));

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

      <div className="panel" style={{ overflowX: 'auto', border: '1px solid #d32f2f' }}>
        <h3 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Bahan Baku Kritis</h3>
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
            {criticalIngredients.map(ing => (
              <tr key={ing.id} style={{ borderBottom: '1px solid var(--color-border)', background: '#ffebee' }}>
                <td style={{ padding: '0.75rem' }}>{ing.name}</td>
                <td style={{ padding: '0.75rem' }}>{ing.unit}</td>
                <td style={{ padding: '0.75rem', color: '#c62828', fontWeight: 'bold' }}>{ing.stock_current}</td>
                <td style={{ padding: '0.75rem' }}>{ing.stock_minimum}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleKurangi(ing.id, ing.name)} style={{ background: '#f57c00', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Kurangi Stok</button>
                  <button onClick={() => handleHapus(ing.id, ing.name)} style={{ background: '#c62828', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {criticalIngredients.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Tidak ada stok kritis.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>Bahan Baku Aman</h3>
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
            {safeIngredients.map(ing => (
              <tr key={ing.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>{ing.name}</td>
                <td style={{ padding: '0.75rem' }}>{ing.unit}</td>
                <td style={{ padding: '0.75rem' }}>{ing.stock_current}</td>
                <td style={{ padding: '0.75rem' }}>{ing.stock_minimum}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleKurangi(ing.id, ing.name)} style={{ background: '#f57c00', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Kurangi Stok</button>
                  <button onClick={() => handleHapus(ing.id, ing.name)} style={{ background: '#c62828', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {safeIngredients.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Tidak ada stok aman.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
