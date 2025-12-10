import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user_sess');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_sess');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <header className="navbar-header">

            <div className="navbar-left-section">
                <h2 className="navbar-title">Digital-BA</h2>

                <nav className="navbar-nav">

                    {/* 1. Menu Khusus Administrator (User & Gudang) */}
                    {user.role === 'administrator' && (
                        <>
                            <NavLink to="/admin/users" className="navbar-nav-link">
                                Manajemen User
                            </NavLink>
                            <NavLink to="/admin/companies" className="navbar-nav-link"> {/* Tambahkan ini */}
                                Manajemen Perusahaan
                            </NavLink>
                            <NavLink to="/admin/warehouses" className="navbar-nav-link">
                                Manajemen Gudang
                            </NavLink>
                        </>
                    )}

                    {/* 2. Menu Dashboard (Untuk Semua KECUALI Administrator) */}
                    {user.role !== 'administrator' && (
                        <NavLink to="/dashboard" className="navbar-nav-link">
                            Dashboard
                        </NavLink>
                    )}

                    {/* 3. Menu Khusus Vendor (Buat BA) */}
                    {user.role === 'vendor' && (
                        <NavLink to="/buat-ba" className="navbar-nav-link">
                            Buat Berita Acara
                        </NavLink>
                    )}

                    {/* 4. Menu Tentang Aplikasi */}
                    {user.role !== 'administrator' && (
                        <NavLink to="/tentang" className="navbar-nav-link">
                            Tentang Aplikasi
                        </NavLink>
                    )}

                </nav>
            </div>

            <div className="navbar-user-section">
                {/* Link ke Profile untuk setting 2FA */}
                <NavLink
                    to="/profile"
                    className="navbar-user-text"
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                    title="Klik untuk Pengaturan Akun & 2FA"
                >
                    Halo, {user.name} <small style={{ opacity: 0.8, fontSize: '0.85em' }}>({user.role}) ⚙️</small>
                </NavLink>

                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;