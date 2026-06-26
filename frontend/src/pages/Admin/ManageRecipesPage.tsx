import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';
import { api } from '../../lib/api';
import type { Recipe } from '../../lib/types';

export function ManageRecipesPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');

  const loadRecipes = async () => {
    try {
      const data = await api.recipes();
      setRecipes(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedIngredient) return;
    
    const ing = sync.ingredients.find(i => i.id === selectedIngredient);
    await api.addRecipe(selectedProduct, {
      ingredient_id: selectedIngredient,
      quantity_per_unit: quantity,
      unit: ing?.unit || 'pcs'
    });
    setQuantity('');
    loadRecipes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus BOM/Resep ini?')) {
      await api.deleteRecipe(id);
      loadRecipes();
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel">
        <h2>Kelola BOM / Resep Produk</h2>
        <form onSubmit={handleSubmit} className="form-stack" style={{ marginTop: '1rem' }}>
          <div className="two-col">
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required>
              <option value="">-- Pilih Produk --</option>
              {sync.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            
            <select value={selectedIngredient} onChange={e => setSelectedIngredient(e.target.value)} required>
              <option value="">-- Pilih Bahan --</option>
              {sync.ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>
          
          <input type="number" placeholder="Jumlah (per 1 unit produk)" value={quantity} onChange={e => setQuantity(e.target.value)} required step="0.01" />
          
          <button className="primary-action" type="submit">Tambah ke Resep</button>
        </form>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '0.75rem' }}>Produk</th>
              <th style={{ padding: '0.75rem' }}>Bahan Baku</th>
              <th style={{ padding: '0.75rem' }}>Kebutuhan</th>
              <th style={{ padding: '0.75rem' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map(r => {
              const p = sync.products.find(prod => prod.id === r.product_id);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{p?.name || r.product_id}</td>
                  <td style={{ padding: '0.75rem' }}>{r.ingredient_name}</td>
                  <td style={{ padding: '0.75rem' }}>{r.quantity_per_unit} {r.unit}</td>
                  <td style={{ padding: '0.75rem' }}><button onClick={() => handleDelete(r.id)} style={{ background: 'var(--color-secondary)', color: '#fff', padding: '0.4rem 0.8rem' }}>Hapus</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
