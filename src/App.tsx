
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import AdminLayout from './components/admin/AdminLayout';

import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SolutionsPage from './pages/SolutionsPage';
import ClientsPage from './pages/ClientsPage';
import ContactPage from './pages/ContactPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import NotFound from './pages/NotFound';
import PlaceholderPage from './pages/PlaceholderPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import ArticleFormPage from './pages/admin/ArticleFormPage';

import './App.css';
import { setupArticlesStorage } from './integrations/supabase/storage-setup';

function App() {
  useEffect(() => {
    // Initialize storage for articles
    setupArticlesStorage().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tentang-kami" element={<AboutUsPage />} />
          <Route path="produk-layanan" element={<ProductsPage />} />
          <Route path="produk-layanan/:productSlug" element={<ProductDetailPage />} />
          <Route path="jasa-layanan" element={<ServicesPage />} />
          <Route path="jasa-layanan/:serviceSlug" element={<ServiceDetailPage />} />
          <Route path="solusi" element={<SolutionsPage />} />
          <Route path="klien" element={<ClientsPage />} />
          <Route path="kontak" element={<ContactPage />} />
          <Route path="artikel" element={<ArticlesPage />} />
          <Route path="artikel/:slug" element={<ArticleDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="articles/new" element={<ArticleFormPage />} />
          <Route path="articles/edit/:id" element={<ArticleFormPage />} />
          <Route path="settings" element={<PlaceholderPage title="Pengaturan" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
