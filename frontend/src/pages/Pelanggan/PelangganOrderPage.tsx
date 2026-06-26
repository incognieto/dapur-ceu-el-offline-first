import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProductCatalog } from '../../components/ProductCatalog';
import { OrderForm } from '../../components/OrderForm';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';

export function PelangganOrderPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (!selectedProductId && sync.products.length > 0) setSelectedProductId(sync.products[0].id);
  }, [selectedProductId, sync.products]);

  return (
    <div className="ecommerce-container">
      <div className="ecommerce-main">
        <ProductCatalog products={sync.products} selectedProductId={selectedProductId} onSelect={setSelectedProductId} />
      </div>
      <aside className="ecommerce-sidebar">
        <OrderForm
          products={sync.products}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
          onSubmit={sync.createOrder}
        />
      </aside>
    </div>
  );
}
