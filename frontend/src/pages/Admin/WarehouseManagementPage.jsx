import React, { useState, useEffect } from 'react';
import warehouseService from '../../services/warehouseService';
import './WarehouseManagementPage.css';

const WarehouseManagementPage = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State Form
    const [formData, setFormData] = useState({
        id: '',
        warehouseName: '',
        warehouseAddress: '',
        status: 'active'
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const data = await warehouseService.getAll();
            setWarehouses(data);
        } catch (error) {
            console.error("Gagal ambil data gudang:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({ id: '', warehouseName: '', warehouseAddress: '', status: 'active' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (warehouse) => {
        setFormData({
            id: warehouse._id,
            warehouseName: warehouse.warehouseName,
            warehouseAddress: warehouse.warehouseAddress,
            status: warehouse.status
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await warehouseService.update(formData.id, {
                    warehouseName: formData.warehouseName,
                    warehouseAddress: formData.warehouseAddress,
                    status: formData.status
                });
                alert("Gudang berhasil diperbarui!");
            } else {
                await warehouseService.create({
                    warehouseName: formData.warehouseName,
                    warehouseAddress: formData.warehouseAddress,
                    status: formData.status
                });
                alert("Gudang berhasil ditambahkan!");
            }
            setIsModalOpen(false);
            fetchWarehouses();
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data gudang.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus gudang ini?")) {
            try {
                await warehouseService.delete(id);
                fetchWarehouses();
            } catch (error) {
                alert("Gagal menghapus gudang.");
            }
        }
    };

    return (
        <div className="warehouse-container">
            <div className="header-section">
                <div>
                    <h1>Manajemen Gudang</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>Kelola daftar gudang penerimaan barang.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAdd}>
                    + Tambah Gudang
                </button>
            </div>

            <div className="table-card">
                {loading ? <p>Memuat data...</p> : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Nama Gudang</th>
                                <th>Alamat</th>
                                <th>Status</th>
                                <th style={{ width: '150px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.length > 0 ? warehouses.map((item) => (
                                <tr key={item._id}>
                                    <td><strong>{item.warehouseName}</strong></td>
                                    <td>{item.warehouseAddress}</td>
                                    <td>
                                        <span className={`status-badge ${item.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                            {item.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn btn-edit" onClick={() => handleOpenEdit(item)}>
                                            Edit
                                        </button>
                                        <button className="action-btn btn-delete" onClick={() => handleDelete(item._id)}>
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Belum ada data gudang.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Edit Gudang' : 'Tambah Gudang Baru'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Gudang</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.warehouseName}
                                    onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                                    required
                                    placeholder="Contoh: Gudang Pusat Jakarta"
                                />
                            </div>

                            <div className="form-group">
                                <label>Alamat Lengkap</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={formData.warehouseAddress}
                                    onChange={(e) => setFormData({ ...formData, warehouseAddress: e.target.value })}
                                    required
                                    placeholder="Jl. Industri No..."
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-select"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active (Aktif)</option>
                                    <option value="inactive">Inactive (Tidak Aktif)</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagementPage;