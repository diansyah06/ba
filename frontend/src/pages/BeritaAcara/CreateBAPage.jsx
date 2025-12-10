import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button'; // Pakai Custom Button
import baService from '../../services/baService';
import api from '../../services/api';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './CreateBAPage.css';

const CreateBAPage = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    const [nomorKontrak, setNomorKontrak] = useState('');
    const [jenisBa, setJenisBa] = useState('bapb');
    const [nominal, setNominal] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // State Loading

    // State untuk Gudang
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');

    useEffect(() => {
        const userSess = JSON.parse(localStorage.getItem('user_sess'));

        if (!userSess || userSess.role !== 'vendor') {
            Swal.fire('Akses Ditolak', 'Hanya Vendor yang boleh membuat Berita Acara!', 'error')
                .then(() => navigate('/dashboard'));
            return;
        }
        setCurrentUser(userSess);
        fetchWarehouses();
    }, [navigate]);

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/warehouse');
            if (response.data && response.data.data) {
                setWarehouses(response.data.data);
            }
        } catch (error) {
            console.error("Gagal memuat data gudang:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) return;

        if (jenisBa === 'bapb' && !selectedWarehouse) {
            Swal.fire('Perhatian', 'Untuk dokumen BAPB, Anda wajib memilih Gudang Tujuan!', 'warning');
            return;
        }

        // Konfirmasi sebelum kirim
        const result = await Swal.fire({
            title: 'Kirim Dokumen?',
            text: "Pastikan data yang Anda isi sudah benar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true); // Mulai Loading

        const payload = {
            contractNumber: nomorKontrak,
            category: jenisBa,
            paymentNominal: parseInt(nominal) || 0,
            description: keterangan,
            targetWarehouse: jenisBa === 'bapb' ? selectedWarehouse : null
        };

        try {
            await baService.create(payload);
            
            await Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Berita Acara telah dibuat dan dikirim.',
            });
            
            navigate('/dashboard');
        } catch (error) {
            const errorMsg = error.response?.data?.meta?.message || error.message;
            Swal.fire('Gagal', errorMsg, 'error');
        } finally {
            setIsSubmitting(false); // Selesai Loading
        }
    };

    return (
        <div className="create-ba-container">
            <div className="dashboard-header">
                <div>
                    <h1>Buat Berita Acara (Vendor)</h1>
                    <p>Silakan input data pekerjaan yang telah Anda selesaikan.</p>
                </div>
            </div>

            <div className="dashboard-card">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <div className="form-grid">

                            <InputField
                                label="Nomor Kontrak"
                                type="text"
                                placeholder="Contoh: CTR-2025-001"
                                value={nomorKontrak}
                                onChange={(e) => setNomorKontrak(e.target.value)}
                            />

                            <div>
                                <label style={{ fontWeight: 'bold', display: 'block', marginTop: '10px' }}>
                                    Jenis Berita Acara
                                </label>
                                <select
                                    className="form-select"
                                    value={jenisBa}
                                    onChange={(e) => setJenisBa(e.target.value)}
                                >
                                    <option value="bapb">BAPB (Berita Acara Pemeriksaan Barang)</option>
                                    <option value="bapp">BAPP (Berita Acara Pemeriksaan Pekerjaan)</option>
                                </select>
                            </div>

                            {jenisBa === 'bapb' && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginTop: '10px' }}>
                                        Gudang Tujuan (Wajib)
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedWarehouse}
                                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Gudang --</option>
                                        {warehouses.map((w) => (
                                            <option key={w._id} value={w._id}>
                                                {w.warehouseName} - {w.warehouseAddress}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <InputField
                                label="Nominal Tagihan (Rp)"
                                type="number"
                                placeholder="Contoh: 50000000"
                                value={nominal}
                                onChange={(e) => setNominal(e.target.value)}
                            />

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginTop: '10px' }}>
                                    Keterangan Pekerjaan
                                </label>
                                <textarea
                                    className="form-select"
                                    rows="3"
                                    placeholder="Deskripsikan barang/pekerjaan yang diserahterimakan..."
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    style={{ width: '100%', resize: 'vertical' }}
                                ></textarea>
                            </div>

                        </div>
                    </div>

                    <div className="card-footer form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        {/* Tombol Batal */}
                        <Button 
                            type="button" 
                            style={{ backgroundColor: '#6c757d', width: 'auto', flex: 1 }} 
                            onClick={() => navigate('/dashboard')}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        
                        {/* Tombol Simpan Custom dengan Loading */}
                        <Button 
                            type="submit" 
                            style={{ width: 'auto', flex: 1 }}
                            isLoading={isSubmitting}
                        >
                            Simpan & Kirim
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBAPage;