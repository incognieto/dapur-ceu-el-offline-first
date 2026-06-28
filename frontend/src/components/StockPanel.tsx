import { Boxes, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { Ingredient, StockAdjustmentPayload } from '../lib/types';

type Props = {
  ingredients: Ingredient[];
  onAdjustStock: (payload: StockAdjustmentPayload) => Promise<void>;
};

export function StockPanel({ ingredients, onAdjustStock }: Props) {
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('1000');

  const selected = ingredientId || ingredients[0]?.id || '';

  async function submitMasuk(event: FormEvent) {
    event.preventDefault();
    await onAdjustStock({
      ingredient_id: selected,
      kind: 'masuk',
      quantity,
      note: 'Restock manual dari UI offline-first'
    });
  }

  async function submitKeluar(event: FormEvent) {
    event.preventDefault();
    await onAdjustStock({
      ingredient_id: selected,
      kind: 'keluar',
      quantity,
      note: 'Dikurangi manual dari UI offline-first'
    });
  }

  const criticalIngredients = ingredients.filter(ing => Number(ing.stock_current) <= Number(ing.stock_minimum));
  const safeIngredients = ingredients.filter(ing => Number(ing.stock_current) > Number(ing.stock_minimum));

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Stok Bahan Baku</h2>
        </div>
        <Boxes aria-hidden="true" />
      </div>
      <div className="stock-list">
        {criticalIngredients.length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #d32f2f', borderRadius: '4px', background: '#ffebee' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828' }}>Stok Kritis</h4>
            {criticalIngredients.map((ingredient) => (
              <div className="stock-row" key={ingredient.id}>
                <span>{ingredient.name}</span>
                <strong style={{ color: '#c62828' }}>{ingredient.stock_current} {ingredient.unit}</strong>
                <meter value={Number(ingredient.stock_current)} min={0} low={Number(ingredient.stock_minimum)} max={Math.max(Number(ingredient.stock_minimum) * 4, Number(ingredient.stock_current))} />
              </div>
            ))}
          </div>
        )}
        
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Stok Aman</h4>
        {safeIngredients.map((ingredient) => (
          <div className="stock-row" key={ingredient.id}>
            <span>{ingredient.name}</span>
            <strong>{ingredient.stock_current} {ingredient.unit}</strong>
            <meter value={Number(ingredient.stock_current)} min={0} low={Number(ingredient.stock_minimum)} max={Math.max(Number(ingredient.stock_minimum) * 4, Number(ingredient.stock_current))} />
          </div>
        ))}
        {safeIngredients.length === 0 && <p style={{ fontSize: '0.9rem', color: 'gray' }}>Tidak ada stok aman.</p>}
      </div>
      <form className="stock-form">
        <select value={selected} onChange={(event) => setIngredientId(event.target.value)}>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </option>
          ))}
        </select>
        <input min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={submitMasuk}>
            <Plus size={16} />
            Restock
          </button>
          <button type="button" onClick={submitKeluar} style={{ background: '#f57c00' }}>
            Kurangi
          </button>
        </div>
      </form>
    </section>
  );
}

