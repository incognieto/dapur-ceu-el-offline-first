export type Product = {
  id: string;
  name: string;
  category: 'kue_basah' | 'kue_kering' | 'bolu';
  price: string;
  available: boolean;
  image_url?: string | null;
};

export type ProductPayload = Omit<Product, 'id'>;

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  stock_current: string;
  stock_minimum: string;
};

export type IngredientPayload = Omit<Ingredient, 'id' | 'stock_current'>;

export type Recipe = {
  id: string;
  product_id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity_per_unit: string;
  unit: string;
};

export type RecipePayload = {
  ingredient_id: string;
  quantity_per_unit: string;
  unit: string;
};

export type OrderItemPayload = {
  product_id: string;
  quantity: number;
  item_note?: string;
};

export type OrderPayload = {
  customer_name: string;
  customer_contact?: string;
  order_type: 'satuan' | 'bulk';
  needed_at?: string;
  note?: string;
  items: OrderItemPayload[];
};

export type Order = {
  id: string;
  customer_name: string;
  customer_contact?: string | null;
  order_type: 'satuan' | 'bulk';
  needed_at?: string | null;
  status: string;
  note?: string | null;
  stock_estimation: {
    available?: boolean;
    shortages?: Array<{ ingredient_name: string; required: string; available: string; unit: string }>;
    requirements?: Array<{ ingredient_name: string; required: string; available: string; unit: string }>;
  };
  created_at?: string;
  items: Array<{ product_id: string; product_name: string; quantity: number; item_note?: string | null }>;
};

export type StockAdjustmentPayload = {
  ingredient_id: string;
  kind: 'masuk' | 'keluar' | 'koreksi';
  quantity: string;
  note?: string;
};

