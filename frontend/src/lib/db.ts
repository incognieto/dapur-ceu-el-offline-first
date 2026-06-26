import Dexie, { type Table } from 'dexie';
import type { Ingredient, Order, OrderPayload, Product, StockAdjustmentPayload } from './types';

type OutboxAction =
  | { id?: number; type: 'create-order'; payload: OrderPayload; createdAt: string }
  | { id?: number; type: 'stock-adjustment'; payload: StockAdjustmentPayload; createdAt: string };

class DapurDb extends Dexie {
  products!: Table<Product, string>;
  ingredients!: Table<Ingredient, string>;
  orders!: Table<Order, string>;
  outbox!: Table<OutboxAction, number>;

  constructor() {
    super('dapur-ceu-el-offline-first');
    this.version(1).stores({
      products: 'id, name, category',
      ingredients: 'id, name',
      orders: 'id, customer_name, status, created_at',
      outbox: '++id, type, createdAt'
    });
  }
}

export const localDb = new DapurDb();
export type { OutboxAction };

