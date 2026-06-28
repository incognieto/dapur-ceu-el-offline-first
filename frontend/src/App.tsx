import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { ManageProductsPage } from './pages/Admin/ManageProductsPage';
import { ManageIngredientsPage } from './pages/Admin/ManageIngredientsPage';
import { ManageRecipesPage } from './pages/Admin/ManageRecipesPage';
import { StafLayout } from './pages/Staf/StafLayout';
import { StafDashboardPage } from './pages/Staf/StafDashboardPage';
import { StafStockPage } from './pages/Staf/StafStockPage';
import { PelangganLayout } from './pages/Pelanggan/PelangganLayout';
import { PelangganOrderPage } from './pages/Pelanggan/PelangganOrderPage';
import { PelangganHistoryPage } from './pages/Pelanggan/PelangganHistoryPage';
import { StockHistoryPage } from './pages/StockHistoryPage';

function ProtectedRoute({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
  const role = localStorage.getItem('dapur_role');
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RootRoute() {
  const role = localStorage.getItem('dapur_role');
  if (!role) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'staf_produksi') return <Navigate to="/staf" replace />;
  return <Navigate to="/pelanggan" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<ManageProductsPage />} />
          <Route path="ingredients" element={<ManageIngredientsPage />} />
          <Route path="recipes" element={<ManageRecipesPage />} />
          <Route path="history" element={<StockHistoryPage />} />
        </Route>

        <Route path="/staf" element={<ProtectedRoute allowedRoles={['staf_produksi', 'admin']}><StafLayout /></ProtectedRoute>}>
          <Route index element={<StafDashboardPage />} />
          <Route path="stock" element={<StafStockPage />} />
          <Route path="history" element={<StockHistoryPage />} />
        </Route>

        <Route path="/pelanggan" element={<ProtectedRoute allowedRoles={['pelanggan', 'admin']}><PelangganLayout /></ProtectedRoute>}>
          <Route index element={<PelangganOrderPage />} />
          <Route path="history" element={<PelangganHistoryPage />} />
        </Route>

        <Route path="/" element={<RootRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
