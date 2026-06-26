import type { Ingredient, IngredientPayload, Order, OrderPayload, Product, ProductPayload, Recipe, RecipePayload, StockAdjustmentPayload } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function getRole() {
  return localStorage.getItem('dapur_role') || 'admin';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Role': getRole(),
      'X-Username': localStorage.getItem('dapur_username') || '',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail?.message ?? body.detail ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (username: string, password: string) => request<{token: string, role: string, username: string}>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  signup: (username: string, password: string, role: string) => request<{token: string, role: string, username: string}>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ username, password, role }) }),
  products: () => request<Product[]>('/api/products'),
  createProduct: (payload: ProductPayload) => request<Product>('/api/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: Partial<ProductPayload>) => request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id: string) => request(`/api/products/${id}`, { method: 'DELETE' }),

  ingredients: () => request<Ingredient[]>('/api/ingredients'),
  createIngredient: (payload: IngredientPayload) => request<Ingredient>('/api/ingredients', { method: 'POST', body: JSON.stringify(payload) }),
  updateIngredient: (id: string, payload: Partial<IngredientPayload>) => request<Ingredient>(`/api/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteIngredient: (id: string) => request(`/api/ingredients/${id}`, { method: 'DELETE' }),

  recipes: () => request<Recipe[]>('/api/recipes'),
  addRecipe: (productId: string, payload: RecipePayload) => request<Recipe>(`/api/recipes/${productId}`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteRecipe: (id: string) => request(`/api/recipes/${id}`, { method: 'DELETE' }),

  criticalStock: () => request<Ingredient[]>('/api/stock/critical'),
  
  orders: () => request<Order[]>('/api/orders'),
  createOrder: (payload: OrderPayload) => request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (orderId: string, status: string) =>
    request<Order>(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  adjustStock: (payload: StockAdjustmentPayload) =>
    request('/api/stock/adjustments', { method: 'POST', body: JSON.stringify(payload) })
};

