import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout-wrapper">
            <Navbar />
            <main className="main-content" style={{ minHeight: '80vh', padding: '20px', backgroundColor: '#f4f6f9' }}>
                <Outlet /> {/* KUNCI AGAR HALAMAN MUNCUL */}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;