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

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onAdjustStock({
      ingredient_id: selected,
      kind: 'masuk',
      quantity,
      note: 'Restock manual dari UI offline-first'
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Stok Bahan Baku</h2>
        </div>
        <Boxes aria-hidden="true" />
      </div>
      <div className="stock-list">
        {ingredients.map((ingredient) => (
          <div className="stock-row" key={ingredient.id}>
            <span>{ingredient.name}</span>
            <strong>{ingredient.stock_current} {ingredient.unit}</strong>
            <meter value={Number(ingredient.stock_current)} min={0} low={Number(ingredient.stock_minimum)} max={Math.max(Number(ingredient.stock_minimum) * 4, Number(ingredient.stock_current))} />
          </div>
        ))}
      </div>
      <form className="stock-form" onSubmit={submit}>
        <select value={selected} onChange={(event) => setIngredientId(event.target.value)}>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </option>
          ))}
        </select>
        <input min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        <button type="submit">
          <Plus size={16} />
          Restock
        </button>
      </form>
    </section>
  );
}

