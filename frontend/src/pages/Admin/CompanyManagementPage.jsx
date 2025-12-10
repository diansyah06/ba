import React, { useState, useEffect } from 'react';
import companyService from '../../services/companyService';
import './CompanyManagementPage.css';

const CompanyManagementPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State Form
    const [formData, setFormData] = useState({
        id: '',
        companyName: '',
        companyAddress: '',
        picName: '',
        status: 'active'
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const data = await companyService.getAll();
            setCompanies(data);
        } catch (error) {
            console.error("Gagal ambil data perusahaan:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({ id: '', companyName: '', companyAddress: '', picName: '', status: 'active' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (company) => {
        setFormData({
            id: company._id,
            companyName: company.companyName,
            companyAddress: company.companyAddress,
            picName: company.picName,
            status: company.status
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                companyName: formData.companyName,
                companyAddress: formData.companyAddress,
                picName: formData.picName,
                status: formData.status
            };

            if (isEditing) {
                await companyService.update(formData.id, payload);
                alert("Perusahaan berhasil diperbarui!");
            } else {
                await companyService.create(payload);
                alert("Perusahaan berhasil ditambahkan!");
            }
            setIsModalOpen(false);
            fetchCompanies();
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data perusahaan.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus perusahaan ini?")) {
            try {
                await companyService.delete(id);
                fetchCompanies();
            } catch (error) {
                alert("Gagal menghapus perusahaan.");
            }
        }
    };

    return (
        <div className="company-container">
            <div className="header-section">
                <div>
                    <h1>Manajemen Perusahaan (Vendor)</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>Kelola daftar perusahaan rekanan.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAdd}>
                    + Tambah Perusahaan
                </button>
            </div>

            <div className="table-card">
                {loading ? <p>Memuat data...</p> : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Nama Perusahaan</th>
                                <th>Alamat</th>
                                <th>Nama PIC</th>
                                <th>Status</th>
                                <th style={{ width: '150px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length > 0 ? companies.map((item) => (
                                <tr key={item._id}>
                                    <td><strong>{item.companyName}</strong></td>
                                    <td>{item.companyAddress}</td>
                                    <td>{item.picName}</td>
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
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Belum ada data perusahaan.</td>
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
                        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Perusahaan (PT/CV)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                    placeholder="Contoh: PT. Sinar Mas"
                                />
                            </div>

                            <div className="form-group">
                                <label>Alamat Lengkap</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    value={formData.companyAddress}
                                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                    required
                                    placeholder="Jl. Thamrin No. 1..."
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Nama PIC (Penanggung Jawab)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.picName}
                                    onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                />
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

export default CompanyManagementPage;