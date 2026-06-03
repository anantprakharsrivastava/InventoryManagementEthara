import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CelebrationProvider } from './context/CelebrationContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  return (
    <AuthProvider>
      <CelebrationProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121826',
            color: '#f4f7fb',
            border: '1px solid rgba(45, 212, 191, 0.3)',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </CelebrationProvider>
    </AuthProvider>
  );
}
