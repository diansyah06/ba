import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import baService from '../../services/baService';
import VerificationModal from '../../components/ba/VerificationModal';
import ResubmitModal from '../../components/ba/ResubmitModal';
import AuditTrail from '../../components/ba/AuditTrail';
import Button from '../../components/common/Button'; 
import SignaturePad from '../../components/common/SignaturePad'; // Import SignaturePad
import Swal from 'sweetalert2'; 
import './DetailBAPage.css';

// Fungsi terbilang helper
const terbilang = (angka) => {
    const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let terbilang = "";
    if (angka < 12) terbilang = " " + bil[angka];
    else if (angka < 20) terbilang = terbilangFn(angka - 10) + " Belas";
    else if (angka < 100) terbilang = terbilangFn(Math.floor(angka / 10)) + " Puluh" + terbilangFn(angka % 10);
    else if (angka < 200) terbilang = " Seratus" + terbilangFn(angka - 100);
    else if (angka < 1000) terbilang = terbilangFn(Math.floor(angka / 100)) + " Ratus" + terbilangFn(angka % 100);
    else if (angka < 2000) terbilang = " Seribu" + terbilangFn(angka - 1000);
    else if (angka < 1000000) terbilang = terbilangFn(Math.floor(angka / 1000)) + " Ribu" + terbilangFn(angka % 1000);
    else if (angka < 1000000000) terbilang = terbilangFn(Math.floor(angka / 1000000)) + " Juta" + terbilangFn(angka % 1000000);
    else if (angka < 1000000000000) terbilang = terbilangFn(Math.floor(angka / 1000000000)) + " Milyar" + terbilangFn(angka % 1000000000);
    return terbilang;
}
const terbilangFn = (angka) => terbilang(angka);

const DetailBAPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Modal State Gudang
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState('Disetujui');
    
    // Modal State Revisi Vendor
    const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);

    // Modal State Approval Direksi/Pemesan
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState('');

    useEffect(() => {
        const userSess = JSON.parse(localStorage.getItem('user_sess'));
        setCurrentUser(userSess);
        loadDetailData();
    }, [id]);

    const loadDetailData = async () => {
        setLoading(true);
        try {
            const allData = await baService.getAll();
            const rawData = allData.find(item => item._id === id);

            if (rawData) {
                const formattedData = {
                    _id: rawData._id,
                    contractNumber: rawData.contractNumber,
                    category: rawData.category,
                    jenisBaLabel: rawData.category === 'bapb' ? 'PEMERIKSAAN BARANG' : 'PEMERIKSAAN PEKERJAAN',
                    vendor: {
                        companyName: rawData.vendorSnapshot?.companyName || 'Vendor',
                        picName: rawData.vendorSnapshot?.picName || '-',
                        address: '-'
                    },
                    warehouse: {
                        name: rawData.warehouseCheck?.warehouseName || '-',
                    },
                    paymentNominal: rawData.paymentNominal,
                    description: rawData.description,
                    status: mapStatusToIndonesian(rawData.status),
                    rawStatus: rawData.status,
                    paymentStatus: rawData.paymentStatus,
                    warehouseCheck: rawData.warehouseCheck,
                    approvalInfo: rawData.approvalInfo,
                    createdAt: rawData.createdAt,
                    formattedDate: getIndonesianDate(rawData.createdAt)
                };
                setData(formattedData);
            } else {
                Swal.fire('Error', 'Data tidak ditemukan!', 'error').then(() => navigate('/dashboard'));
            }
        } catch (error) {
            console.error("Gagal load detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIndonesianDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    };

    const mapStatusToIndonesian = (statusBackend) => {
        switch (statusBackend) {
            case 'pending': return 'Menunggu';
            case 'approved': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            case 'revision': return 'Revisi';
            default: return statusBackend;
        }
    };

    const handleButtonClick = async (actionType) => {
        // CASE 1: PIC GUDANG
        if (currentUser.role === 'picgudang') {
            setModalAction(actionType);
            setIsModalOpen(true);
            return;
        } 
        
        // CASE 2: DIREKSI / PEMESAN BARANG
        if (actionType === 'Ditolak') {
            // Untuk penolakan, kita pakai SweetAlert + Input Alasan
            const result = await Swal.fire({
                title: 'Tolak Dokumen?',
                text: "Dokumen akan dikembalikan ke vendor untuk revisi.",
                input: 'textarea',
                inputLabel: 'Alasan Penolakan',
                inputPlaceholder: 'Tuliskan alasan penolakan disini...',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Tolak Dokumen',
                cancelButtonText: 'Batal',
                preConfirm: (text) => {
                    if (!text) {
                        Swal.showValidationMessage('Alasan wajib diisi!');
                    }
                    return text;
                }
            });

            if (result.isConfirmed) {
                // Eksekusi Reject (tanpa signature)
                 executeAction('Ditolak', result.value, [], null);
            }
        } else {
            // Untuk Persetujuan (APPROVED) -> Buka Modal Tanda Tangan
            setApprovalActionType(actionType); // 'Disetujui'
            setIsApprovalModalOpen(true);
        }
    };

    const executeAction = async (actionType, notes = null, files = [], signatureData = null) => {
        setActionLoading(true);
        try {
            if (currentUser.role === 'picgudang') {
                // Gudang Verify + Signature
                await baService.verify(id, actionType, notes, files, signatureData); 
                setIsModalOpen(false);
                Swal.fire('Berhasil', `Verifikasi Gudang & Tanda Tangan tersimpan.`, 'success');
            } else {
                // Approval Direksi + Signature
                await baService.approve(id, actionType, notes, signatureData); 
                setIsApprovalModalOpen(false);
                Swal.fire('Berhasil', `Dokumen telah ${actionType.toLowerCase()} dan ditandatangani.`, 'success');
            }
            loadDetailData();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.meta?.message || error.message;
            Swal.fire('Gagal', msg, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResubmit = async (payload) => {
        setActionLoading(true);
        try {
            await baService.resubmit(id, payload);
            Swal.fire('Berhasil', 'Dokumen berhasil direvisi dan dikirim ulang.', 'success');
            setIsResubmitModalOpen(false);
            loadDetailData();
        } catch (error) {
            const msg = error.response?.data?.meta?.message || error.message;
            Swal.fire('Gagal', `Gagal revisi: ${msg}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBack = () => navigate('/dashboard');
    const handlePrint = () => window.print();

    if (loading && !data) return <div className="loading-container">Memuat dokumen...</div>;
    if (!data) return null;

    const isBAPB = data.category === 'bapb';
    const isBAPP = data.category === 'bapp';
    let showButtons = false;

    if (currentUser && data.status === 'Menunggu') {
        if (currentUser.role === 'picgudang' && isBAPB) {
            if (!data.warehouseCheck || data.warehouseCheck.checkStatus === 'pending') showButtons = true;
        }
        if (currentUser.role === 'direksipekerjaan' && isBAPP) showButtons = true;
        if (currentUser.role === 'pemesanbarang' && isBAPB) {
            if (data.warehouseCheck && data.warehouseCheck.checkStatus === 'approved') showButtons = true;
        }
    }

    const showResubmitButton = currentUser?.role === 'vendor' && (data.rawStatus === 'rejected' || data.rawStatus === 'revision');

    return (
        <div className="detail-ba-container">
            <div className="detail-header-nav">
                <Button 
                    onClick={handleBack} 
                    style={{ width: 'auto', backgroundColor: '#6c757d', margin: 0 }}
                >
                    &larr; Kembali
                </Button>
                <div className="header-right-actions">
                    <span className={`status-label status-${data.rawStatus}`}>{data.status}</span>
                    <Button 
                        onClick={handlePrint} 
                        style={{ width: 'auto', backgroundColor: '#007bff', margin: 0 }}
                    >
                        🖨️ Cetak PDF
                    </Button>
                </div>
            </div>

            <div className="paper-document">
                <div className="doc-title">
                    <h2>BERITA ACARA {data.jenisBaLabel}</h2>
                    <p style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                        NOMOR: {data.contractNumber}
                    </p>
                </div>

                <div className="doc-body">
                    <p>Pada hari ini, <strong>{data.formattedDate}</strong>, telah dilakukan pemeriksaan dan serah terima pekerjaan/barang dengan rincian sebagai berikut:</p>
                    
                    <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                        <table className="doc-table" style={{ border: 'none' }}>
                            <tbody>
                                <tr>
                                    <td className="label-column" style={{ width: '150px' }}>Pihak Pertama</td>
                                    <td style={{ width: '20px' }}>:</td>
                                    <td><strong>{data.vendor.companyName}</strong> (Vendor)</td>
                                </tr>
                                <tr>
                                    <td className="label-column">Pihak Kedua</td>
                                    <td>:</td>
                                    <td><strong>PT. INTERNAL PERUSAHAAN</strong> (User)</td>
                                </tr>
                                {isBAPB && (
                                    <tr>
                                        <td className="label-column">Lokasi Gudang</td>
                                        <td>:</td>
                                        <td>{data.warehouse.name}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <hr style={{ border: '0', borderTop: '1px dashed #ccc', margin: '20px 0' }} />
                        <table className="doc-table">
                            <tbody>
                                <tr>
                                    <td className="label-column" style={{ width: '150px' }}>Deskripsi</td>
                                    <td style={{ width: '20px' }}>:</td>
                                    <td>{data.description}</td>
                                </tr>
                                <tr>
                                    <td className="label-column">Nilai Pekerjaan</td>
                                    <td>:</td>
                                    <td><strong>Rp {data.paymentNominal.toLocaleString('id-ID')}</strong></td>
                                </tr>
                                <tr>
                                    <td className="label-column">Terbilang</td>
                                    <td>:</td>
                                    <td style={{ fontStyle: 'italic', textTransform: 'capitalize' }}>
                                        {terbilangFn(data.paymentNominal)} Rupiah
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <p>Demikian Berita Acara ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
                </div>

                {/* SIGNATURE SECTION */}
                <div className="signature-section">
                    <div className="signature-box">
                        <p style={{ marginBottom: '40px' }}>Pihak Pertama (Vendor),</p>
                        <div className="sign-placeholder no-border">
                            <div className="digital-sign-stamp">
                                DIGITALLY SIGNED<br />
                                <small>{new Date(data.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                        <span className="sign-name">{data.vendor.picName}</span>
                        <span style={{ fontSize: '12px', display: 'block' }}>{data.vendor.companyName}</span>
                    </div>

                    <div className="signature-box">
                        <p style={{ marginBottom: '5px' }}>Pihak Kedua (Internal),</p>
                        {isBAPB && (
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '20px' }}>
                                {data.warehouseCheck?.checkStatus === 'approved' ? (
                                    <div style={{ textAlign: 'center' }}>
                                        {/* TAMPILKAN TTD GUDANG JIKA ADA */}
                                        {data.warehouseCheck.digitalSignature && data.warehouseCheck.digitalSignature.startsWith('data:image') ? (
                                            <img 
                                                src={data.warehouseCheck.digitalSignature} 
                                                alt="TTD Gudang" 
                                                style={{ height: '60px', marginBottom: '5px', maxWidth: '100%' }} 
                                            />
                                        ) : (
                                            <div style={{ fontStyle: 'italic', color: 'green', fontWeight: 'bold' }}>[TERVERIFIKASI]</div>
                                        )}
                                        <div>(Diverifikasi Gudang: {new Date(data.warehouseCheck.checkAt).toLocaleDateString()})</div>
                                    </div>
                                ) : (
                                    '(Menunggu Verifikasi Gudang)'
                                )}
                            </div>
                        )}

                        {data.status === 'Disetujui' ? (
                            <div className="sign-placeholder no-border">
                                {/* TAMPILKAN TTD DIREKSI JIKA ADA */}
                                {data.approvalInfo?.digitalSignature && data.approvalInfo.digitalSignature.startsWith('data:image') ? (
                                    <img 
                                        src={data.approvalInfo.digitalSignature} 
                                        alt="TTD Digital" 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                    />
                                ) : (
                                    <div className="digital-sign-stamp stamp-approved">
                                        APPROVED<br />
                                        <small>{data.approvalInfo ? new Date(data.approvalInfo.approveAt).toLocaleDateString() : 'Verified'}</small>
                                    </div>
                                )}
                            </div>
                        ) : showResubmitButton ? (
                            <div className="sign-placeholder stamp-rejected" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <span>PERLU REVISI</span>
                                <Button
                                    style={{ width: '80%', padding: '5px', fontSize: '12px' }}
                                    onClick={() => setIsResubmitModalOpen(true)}
                                >
                                    ✏️ Perbaiki Data
                                </Button>
                            </div>
                        ) : data.status === 'Ditolak' ? (
                            <div className="sign-placeholder stamp-rejected">
                                <span>DITOLAK</span>
                            </div>
                        ) : showButtons ? (
                            <div className="action-btn-group" style={{ display: 'flex', gap: '5px' }}>
                                <Button
                                    style={{ backgroundColor: '#4CAF50', fontSize: '12px', padding: '10px' }}
                                    onClick={() => handleButtonClick('Disetujui')}
                                    isLoading={actionLoading}
                                >
                                    ✅ {currentUser.role === 'picgudang' ? 'Verifikasi' : 'Setujui'}
                                </Button>
                                <Button
                                    style={{ backgroundColor: '#f44336', fontSize: '12px', padding: '10px' }}
                                    onClick={() => handleButtonClick('Ditolak')}
                                    isLoading={actionLoading}
                                >
                                    ❌ Tolak
                                </Button>
                            </div>
                        ) : (
                            <div className="sign-placeholder">
                                <span>
                                    {data.warehouseCheck?.checkStatus === 'approved'
                                        ? 'Menunggu Approval Akhir...'
                                        : 'Menunggu Verifikasi...'}
                                </span>
                            </div>
                        )}

                        <span className="sign-name" style={{ marginTop: '10px' }}>
                            {data.approvalInfo?.approvalByName || (currentUser?.role === 'vendor' ? '.....' : currentUser?.fullname)}
                        </span>
                        <span style={{ fontSize: '12px', display: 'block' }}>
                            {isBAPB ? 'Pemesan Barang' : 'Direksi Pekerjaan'}
                        </span>
                    </div>
                </div>
            </div>

            {data && (
                <div className="no-print">
                    <AuditTrail data={data} />
                </div>
            )}

            {/* Modal Render (Khusus PIC Gudang) */}
            {currentUser?.role === 'picgudang' && (
                <VerificationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={executeAction}
                    actionType={modalAction}
                    loading={actionLoading}
                />
            )}

            {/* Modal Approval Khusus Direksi / Pemesan */}
            {isApprovalModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h3>✍️ Persetujuan Dokumen</h3>
                        <p style={{marginBottom: '15px', color: '#555'}}>
                            Dengan menandatangani ini, Anda menyatakan bahwa dokumen <b>{data.contractNumber}</b> adalah sah dan valid.
                        </p>
                        
                        <SignaturePad 
                            loading={actionLoading}
                            onCancel={() => setIsApprovalModalOpen(false)}
                            onSave={(signatureData) => {
                                // Default notes "Disetujui secara digital"
                                executeAction(approvalActionType, 'Disetujui Secara Digital', [], signatureData);
                            }}
                        />
                    </div>
                </div>
            )}

            <ResubmitModal
                isOpen={isResubmitModalOpen}
                onClose={() => setIsResubmitModalOpen(false)}
                onSubmit={handleResubmit}
                initialData={data}
                loading={actionLoading}
            />
        </div>
    );
};

export default DetailBAPage;