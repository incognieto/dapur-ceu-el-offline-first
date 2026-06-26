import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { localDb } from '../lib/db';
import type { Ingredient, Order, OrderPayload, Product, StockAdjustmentPayload } from '../lib/types';

export function useOfflineSync() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState('Memuat data lokal...');

  const refreshLocal = useCallback(async () => {
    const [cachedProducts, cachedIngredients, cachedOrders, pending] = await Promise.all([
      localDb.products.toArray(),
      localDb.ingredients.toArray(),
      localDb.orders.reverse().sortBy('created_at'),
      localDb.outbox.count()
    ]);
    setProducts(cachedProducts);
    setIngredients(cachedIngredients);
    setOrders(cachedOrders);
    setPendingCount(pending);
  }, []);

  const pull = useCallback(async () => {
    // Fetch individually to avoid one failing (e.g., 403 Forbidden) ruining the rest
    const pProducts = api.products().catch(() => []);
    const pIngredients = api.ingredients().catch(() => []);
    const pOrders = api.orders().catch(() => []);

    const [remoteProducts, remoteIngredients, remoteOrders] = await Promise.all([
      pProducts, pIngredients, pOrders
    ]);

    if (remoteProducts.length > 0) await localDb.products.bulkPut(remoteProducts);
    if (remoteIngredients.length > 0) await localDb.ingredients.bulkPut(remoteIngredients);
    if (remoteOrders.length > 0) await localDb.orders.bulkPut(remoteOrders);

    await refreshLocal();
    setMessage('Data tersinkron.');
  }, [refreshLocal]);

  const syncOutbox = useCallback(async () => {
    if (!navigator.onLine) return;
    const actions = await localDb.outbox.orderBy('createdAt').toArray();
    for (const action of actions) {
      if (action.type === 'create-order') await api.createOrder(action.payload);
      if (action.type === 'stock-adjustment') await api.adjustStock(action.payload);
      if (action.id) await localDb.outbox.delete(action.id);
    }
    await pull();
  }, [pull]);

  const createOrder = useCallback(
    async (payload: OrderPayload) => {
      if (navigator.onLine) {
        const order = await api.createOrder(payload);
        await localDb.orders.put(order);
        await refreshLocal();
        return;
      }

      await localDb.outbox.add({ type: 'create-order', payload, createdAt: new Date().toISOString() });
      setMessage('Pesanan disimpan lokal dan akan dikirim saat online.');
      await refreshLocal();
    },
    [refreshLocal]
  );

  const adjustStock = useCallback(
    async (payload: StockAdjustmentPayload) => {
      if (navigator.onLine) {
        await api.adjustStock(payload);
        await pull();
        return;
      }

      await localDb.outbox.add({ type: 'stock-adjustment', payload, createdAt: new Date().toISOString() });
      setMessage('Perubahan stok disimpan lokal dan menunggu sinkronisasi.');
      await refreshLocal();
    },
    [pull, refreshLocal]
  );

  const updateStatus = useCallback(
    async (orderId: string, status: string) => {
      const updated = await api.updateOrderStatus(orderId, status);
      await localDb.orders.put(updated);
      await pull();
    },
    [pull]
  );

  useEffect(() => {
    refreshLocal().then(() => pull().catch(() => setMessage('Mode offline: memakai data lokal.')));
  }, [pull, refreshLocal]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      setMessage('Online kembali, menyinkronkan antrean...');
      syncOutbox().catch((error) => setMessage(error.message));
    };
    const onOffline = () => {
      setOnline(false);
      setMessage('Mode offline aktif.');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncOutbox]);

  return useMemo(
    () => ({
      products,
      ingredients,
      orders,
      pendingCount,
      online,
      message,
      pull,
      syncOutbox,
      createOrder,
      adjustStock,
      updateStatus
    }),
    [products, ingredients, orders, pendingCount, online, message, pull, syncOutbox, createOrder, adjustStock, updateStatus]
  );
}

