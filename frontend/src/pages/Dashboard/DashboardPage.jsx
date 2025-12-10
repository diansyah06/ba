import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BATable from '../../components/ba/BATable';
import baService from '../../services/baService';
import './DashboardPage.css';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('Semua');
    const [dataBA, setDataBA] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userSess = JSON.parse(localStorage.getItem('user_sess'));
        setCurrentUser(userSess);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userSess = JSON.parse(localStorage.getItem('user_sess'));
            const result = await baService.getAll();

            let filteredResult = result;

            if (userSess) {
                // SINKRONISASI: Menggunakan 'category' sesuai backend
                if (userSess.role === 'direksipekerjaan') {
                    filteredResult = result.filter(item => item.category === 'bapp');
                }
                else if (userSess.role === 'picgudang') {
                    filteredResult = result.filter(item => item.category === 'bapb');
                }
            }

            const formattedData = filteredResult.map(item => ({
                id: item._id,
                nomorKontrak: item.contractNumber,
                // SINKRONISASI: Mengambil data 'category'
                jenis: item.category ? item.category.toUpperCase() : '-',
                vendor: item.vendorSnapshot ? item.vendorSnapshot.companyName : (item.createdBy?.fullname || 'Vendor'),
                status: mapStatusToIndonesian(item.status),
                tanggal: new Date(item.createdAt).toLocaleDateString('id-ID')
            }));

            setDataBA(formattedData);

        } catch (error) {
            console.error("Gagal ambil data:", error);
        } finally {
            setLoading(false);
        }
    };

    const mapStatusToIndonesian = (statusBackend) => {
        switch (statusBackend) {
            case 'pending': return 'Menunggu';
            case 'approved': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            default: return statusBackend;
        }
    };

    const getFilteredData = () => {
        if (activeTab === 'Semua') return dataBA;
        return dataBA.filter(item => item.status === activeTab);
    };

    const filteredData = getFilteredData();

    const getWelcomeMessage = () => {
        if (currentUser?.role === 'direksipekerjaan') return "Selamat datang Pak Direksi. Ini daftar BAPP yang perlu diperiksa.";
        if (currentUser?.role === 'picgudang') return "Halo PIC Gudang, ini daftar barang masuk (BAPB).";
        if (currentUser?.role === 'pemesanbarang') return "Halo Pemesan Barang. Silakan setujui BAPB yang telah diverifikasi Gudang.";
        if (currentUser?.role === 'vendor') return "Halo Vendor, ini riwayat dokumen Anda.";
        return "Dashboard Monitoring Berita Acara";
    };
    const handleDelete = async (id, contractNumber) => {
        if (window.confirm(`Yakin ingin menghapus dokumen kontrak ${contractNumber}?`)) {
            try {
                setLoading(true);
                await baService.delete(id);
                alert("Dokumen berhasil dihapus!");
                fetchData(); // Refresh data tabel
            } catch (error) {
                alert("Gagal menghapus dokumen: " + (error.response?.data?.meta?.message || error.message));
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard Real-Time</h1>
                    <p>{getWelcomeMessage()}</p>
                </div>

                {currentUser?.role === 'vendor' && (
                    <div>
                        <Link to="/buat-ba" className="btn btn-primary">
                            + Tambah Berita Acara
                        </Link>
                    </div>
                )}
            </div>

            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Daftar Berita Acara</h3>
                </div>

                <div className="card-body" style={{ paddingTop: '20px' }}>
                    <div className="dashboard-tabs">
                        {['Semua', 'Disetujui', 'Menunggu', 'Ditolak'].map(status => (
                            <button
                                key={status}
                                className={`tab-btn ${activeTab === status ? 'active' : ''}`}
                                onClick={() => setActiveTab(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>Sedang memuat data...</p>
                        </div>
                    ) : filteredData.length > 0 ? (
                        <BATable
                            data={filteredData}
                            onDelete={handleDelete}
                            userRole={currentUser?.role}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <p>Tidak ada dokumen yang ditemukan.</p>
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <span>Menampilkan {filteredData.length} data ({activeTab})</span>
                </div>
            </div>
        </div>
    );

};

export default DashboardPage;