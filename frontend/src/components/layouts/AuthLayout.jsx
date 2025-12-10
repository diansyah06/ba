import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            <div style={{ width: '100%', maxWidth: '450px', padding: '40px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                <Outlet /> {/* KUNCI AGAR HALAMAN MUNCUL */}
            </div>
        </div>
    );
};

export default AuthLayout;