import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Hapus 'BrowserRouter' dari sini

// Import Pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import CreateBAPage from '../pages/BeritaAcara/CreateBAPage';
import DetailBAPage from '../pages/BeritaAcara/DetailBAPage';
import TentangPage from '../pages/Tentang/TentangPage';
import UserManagementPage from '../pages/Admin/UserManagementPage';
import WarehouseManagementPage from '../pages/Admin/WarehouseManagementPage';
import CompanyManagementPage from '../pages/Admin/CompanyManagementPage'; // Tambahkan ini

// Import Layouts
import AuthLayout from '../components/layouts/AuthLayout';
import MainLayout from '../components/layouts/MainLayout';
import ProfilePage from '../pages/Profile/ProfilePage';

const AppRouter = () => {
    return (
        // HAPUS <Router> DISINI. Cukup <Routes> saja.
        <Routes>
            {/* --- PUBLIC ROUTES (Login & Register) --- */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Redirect root ke login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* --- PROTECTED ROUTES (Harus Login) --- */}
            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/buat-ba" element={<CreateBAPage />} />
                <Route path="/ba/:id" element={<DetailBAPage />} />
                <Route path="/tentang" element={<TentangPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/warehouses" element={<WarehouseManagementPage />} />
                <Route path="/admin/companies" element={<CompanyManagementPage />} />
            </Route>
        </Routes>
    );
};

export default AppRouter;