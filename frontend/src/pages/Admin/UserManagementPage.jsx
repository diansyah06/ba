import React, { useState, useEffect } from 'react';
import './UserManagementPage.css';
import authService from '../../services/authService';
import api from '../../services/api';
// Import services tambahan
import companyService from '../../services/companyService';
import warehouseService from '../../services/warehouseService';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tambahkan state untuk data dropdown
    const [companies, setCompanies] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [formData, setFormData] = useState({
        fullname: '', username: '', email: '', password: '', role: 'pendingapproval'
    });

    // Update Edit Data State: Tambahkan vendorId dan warehouseId
    const [editData, setEditData] = useState({
        id: '', role: '', vendorId: '', warehouseId: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Ambil semua data master sekaligus
            const [usersRes, companiesRes, warehousesRes] = await Promise.all([
                api.get('/admin/users'),
                companyService.getAll(),
                warehouseService.getAll()
            ]);

            setUsers(usersRes.data.data || []);
            setCompanies(companiesRes || []);
            setWarehouses(warehousesRes || []);
        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setLoading(false);
        }
    };

    // ... (Fungsi getFilteredUsers, tabs, handleAddUser TETAP SAMA) ...

    const getFilteredUsers = () => {
        let result = users.filter(user => user.role !== 'administrator');
        if (activeTab !== 'all') {
            result = result.filter(user => user.role === activeTab);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user =>
                user.fullname.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
            );
        }
        return result;
    };

    const filteredUsers = getFilteredUsers();

    const tabs = [
        { id: 'all', label: 'Semua User' },
        { id: 'picgudang', label: 'PIC Gudang' },
        { id: 'vendor', label: 'Vendor' },
        { id: 'direksipekerjaan', label: 'Direksi' },
        { id: 'pemesanbarang', label: 'Pemesan' },
        { id: 'pendingapproval', label: 'Butuh Approval' }
    ];

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await authService.register({
                ...formData,
                confirmPassword: formData.password
            });
            alert('User berhasil dibuat!');
            setShowAddModal(false);
            setFormData({ fullname: '', username: '', email: '', password: '', role: 'pendingapproval' });
            fetchInitialData();
        } catch (error) {
            alert('Gagal: ' + (error.response?.data?.meta?.message || error.message));
        }
    };

    // --- MODIFIKASI HANDLERS: EDIT USER ---
    const openEditModal = (user) => {
        setEditData({
            id: user._id,
            role: user.role,
            vendorId: user.vendorId || '',
            warehouseId: user.warehouseId || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            // Validasi: Vendor wajib pilih perusahaan
            if (editData.role === 'vendor' && !editData.vendorId) {
                return alert("Pilih Perusahaan untuk Vendor ini!");
            }
            // Validasi: PIC Gudang wajib pilih gudang
            if (editData.role === 'picgudang' && !editData.warehouseId) {
                return alert("Pilih Gudang untuk PIC ini!");
            }

            const payload = {
                role: editData.role,
                // Kirim ID jika role sesuai, jika tidak null
                vendorId: editData.role === 'vendor' ? editData.vendorId : null,
                warehouseId: editData.role === 'picgudang' ? editData.warehouseId : null
            };

            await api.put(`/admin/users/${editData.id}/assign-role`, payload);
            alert('Data user berhasil diperbarui!');
            setShowEditModal(false);
            fetchInitialData();
        } catch (error) {
            alert('Gagal update: ' + (error.response?.data?.meta?.message || error.message));
        }
    };

    // Helper Avatar (SAMA)
    const renderAvatar = (fullname) => {
        const initial = fullname ? fullname.charAt(0).toUpperCase() : '?';
        return (
            <div style={{
                width: '35px', height: '35px', borderRadius: '50%',
                backgroundColor: '#e9ecef', color: '#555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '14px', marginRight: '10px'
            }}>
                {initial}
            </div>
        );
    };

    return (
        <div className="user-management-container">
            {/* ... (HEADER & TABS SAMA) ... */}
            <div className="admin-header">
                <div>
                    <h1>Manajemen User</h1>
                    <p>Atur role dan status user.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    + Tambah User
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div className="tabs-container" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {tab.id === 'pendingapproval' && users.filter(u => u.role === 'pendingapproval').length > 0 && (
                                <span className="badge-count">{users.filter(u => u.role === 'pendingapproval').length}</span>
                            )}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="🔍 Cari nama / email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '250px' }}
                />
            </div>

            {/* ... (TABLE SAMA) ... */}
            <div className="dashboard-card">
                <div className="card-body">
                    {loading ? <p>Memuat data...</p> : (
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>User & Status</th>
                                    <th style={{ width: '30%' }}>Role / Jabatan</th>
                                    <th style={{ width: '30%' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {renderAvatar(user.fullname)}
                                                    <div>
                                                        <strong>{user.fullname}</strong>
                                                        {user.isActive ? (
                                                            <span style={{ fontSize: '10px', color: 'green', marginLeft: '6px', background: '#d4edda', padding: '2px 6px', borderRadius: '4px' }}>Aktif</span>
                                                        ) : (
                                                            <span style={{ fontSize: '10px', color: 'red', marginLeft: '6px', background: '#f8d7da', padding: '2px 6px', borderRadius: '4px' }}>Non-Aktif</span>
                                                        )}
                                                        <br />
                                                        <small className="text-muted">{user.email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge role-${user.role}`}>
                                                    {user.role ? user.role.toUpperCase() : 'UNKNOWN'}
                                                </span>
                                                {/* Tampilkan info tambahan */}
                                                {user.role === 'vendor' && user.vendorId && (
                                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                        🏢 {companies.find(c => c._id === user.vendorId)?.companyName || 'Unknown Company'}
                                                    </div>
                                                )}
                                                {user.role === 'picgudang' && user.warehouseId && (
                                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                        🏭 {warehouses.find(w => w._id === user.warehouseId)?.warehouseName || 'Unknown Warehouse'}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => openEditModal(user)}
                                                    title="Edit Role"
                                                >
                                                    ✏️ Edit Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                            {searchTerm ? `Tidak ditemukan user dengan nama "${searchTerm}"` : "Tidak ada data user."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL 1: ADD USER (SAMA) */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Tambah User Baru</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input className="form-control-modal" required
                                    value={formData.fullname}
                                    onChange={e => setFormData({ ...formData, fullname: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input className="form-control-modal" required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control-modal" required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input className="form-control-modal" required
                                    placeholder="Min: Huruf Besar & Angka"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: EDIT ROLE (DIPERBARUI) --- */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Akses User</h3>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-group">
                                <label>Role / Jabatan</label>
                                <select
                                    className="form-control-modal"
                                    value={editData.role}
                                    onChange={e => setEditData({ ...editData, role: e.target.value })}
                                >
                                    <option value="pendingapproval">Pending Approval</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="picgudang">PIC Gudang</option>
                                    <option value="direksipekerjaan">Direksi Pekerjaan</option>
                                    <option value="pemesanbarang">Pemesan Barang</option>
                                </select>
                            </div>

                            {/* KONDISIONAL: Jika Vendor, muncul dropdown Perusahaan */}
                            {editData.role === 'vendor' && (
                                <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                                    <label>Pilih Perusahaan (Vendor)</label>
                                    <select
                                        className="form-control-modal"
                                        value={editData.vendorId}
                                        onChange={e => setEditData({ ...editData, vendorId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Pilih Perusahaan --</option>
                                        {companies.map(c => (
                                            <option key={c._id} value={c._id}>{c.companyName}</option>
                                        ))}
                                    </select>
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        *Jika kosong, buat data dulu di Manajemen Perusahaan.
                                    </small>
                                </div>
                            )}

                            {/* KONDISIONAL: Jika PIC Gudang, muncul dropdown Gudang */}
                            {editData.role === 'picgudang' && (
                                <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                                    <label>Penempatan Gudang</label>
                                    <select
                                        className="form-control-modal"
                                        value={editData.warehouseId}
                                        onChange={e => setEditData({ ...editData, warehouseId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Pilih Gudang --</option>
                                        {warehouses.map(w => (
                                            <option key={w._id} value={w._id}>{w.warehouseName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;