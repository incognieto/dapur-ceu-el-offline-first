import { ShoppingCart } from 'lucide-react';
import type { Product } from '../lib/types';

type Props = {
  products: Product[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
};

export function ProductCatalog({ products, selectedProductId, onSelect }: Props) {
  return (
    <section className="panel catalog-panel">
      <div className="panel-heading">
        <div>
          <h2>Produk Kami</h2>
        </div>
        <ShoppingCart aria-hidden="true" />
      </div>
      <div className="catalog-grid">
        {products.map((product) => (
          <button
            className={`product-tile ${selectedProductId === product.id ? 'selected' : ''} ${!product.available ? 'unavailable' : ''}`}
            key={product.id}
            onClick={() => product.available && onSelect(product.id)}
            type="button"
            disabled={!product.available}
            style={{ position: 'relative' }}
          >
            <img src={product.image_url ?? '/product-placeholder.svg'} alt="" style={{ opacity: product.available ? 1 : 0.5 }} />
            {product.available ? (
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-primary, #10b981)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Available
              </div>
            ) : (
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-danger, #ef4444)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Not Available
              </div>
            )}
            <span>{product.name}</span>
            <strong>Rp {Number(product.price).toLocaleString('id-ID')}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
