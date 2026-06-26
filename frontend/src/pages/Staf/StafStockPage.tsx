import { useOutletContext } from 'react-router-dom';
import { StockPanel } from '../../components/StockPanel';
import { useOfflineSync } from '../../viewmodels/useOfflineSync';

export function StafStockPage() {
  const { sync } = useOutletContext<{ sync: ReturnType<typeof useOfflineSync> }>();
  
  return (
    <div style={{ width: '100%' }}>
      <StockPanel ingredients={sync.ingredients} onAdjustStock={sync.adjustStock} />
    </div>
  );
}
