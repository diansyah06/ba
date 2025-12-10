import React from 'react';
import './AuditTrail.css';

const AuditTrail = ({ data }) => {
    // Helper untuk format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    // 1. TAHAP PEMBUATAN (Selalu Ada)
    const steps = [
        {
            title: 'Dokumen Dibuat (Draft)',
            actor: data.vendor?.companyName || 'Vendor',
            pic: `PIC: ${data.vendor?.picName || '-'}`,
            date: formatDate(data.createdAt),
            status: 'completed', // Hijau
            icon: '📝',
            note: 'Dokumen diserahkan ke sistem.'
        }
    ];

    // 2. TAHAP VERIFIKASI GUDANG (Khusus BAPB)
    if (data.category === 'bapb') {
        const whCheck = data.warehouseCheck;
        if (whCheck && whCheck.checkStatus !== 'pending') {
            const isApproved = whCheck.checkStatus === 'approved';
            steps.push({
                title: isApproved ? 'Verifikasi Gudang Berhasil' : 'Ditolak Gudang',
                actor: whCheck.warehouseName,
                pic: `Checker: ${whCheck.checkerName}`,
                date: formatDate(whCheck.checkAt),
                status: isApproved ? 'completed' : 'rejected',
                icon: isApproved ? '📦' : '❌',
                note: whCheck.notes
            });
        } else {
            steps.push({
                title: 'Menunggu Verifikasi Gudang',
                actor: data.warehouse?.name || 'Gudang',
                status: 'current', // Kuning/Biru
                icon: '⏳',
                note: 'Sedang dalam antrian pemeriksaan fisik.'
            });
        }
    }

    // 3. TAHAP APPROVAL AKHIR
    // Jika status Rejected tapi bukan dari gudang, atau Approved
    const approval = data.approvalInfo;
    
    // Logika menampilkan step approval
    if (approval) {
        const isApproved = data.rawStatus === 'approved'; // Pastikan ambil rawStatus dari parent
        steps.push({
            title: isApproved ? 'Disetujui (Final)' : 'Ditolak Pihak Internal',
            actor: isApproved ? 'Disetujui Oleh:' : 'Ditolak Oleh:',
            pic: approval.approvalByName,
            date: formatDate(approval.approveAt),
            status: isApproved ? 'completed' : 'rejected',
            icon: isApproved ? '✅' : '🚫',
            note: approval.notes || '-'
        });
    } else {
        // Jika BAPB belum lolos gudang, jangan tampilkan waiting approval (biar tidak bingung)
        const isBapbPendingWarehouse = data.category === 'bapb' && (!data.warehouseCheck || data.warehouseCheck.checkStatus === 'pending');
        
        if (!isBapbPendingWarehouse && data.rawStatus !== 'rejected') {
            steps.push({
                title: 'Menunggu Persetujuan Akhir',
                actor: data.category === 'bapb' ? 'Pemesan Barang' : 'Direksi Pekerjaan',
                status: 'current',
                icon: '⏳',
                note: 'Menunggu tanda tangan digital.'
            });
        }
    }

    return (
        <div className="audit-trail-container">
            <h3 className="audit-title">Riwayat Dokumen (Audit Trail)</h3>
            <div className="timeline">
                {steps.map((step, index) => (
                    <div key={index} className={`timeline-item ${step.status}`}>
                        <div className="timeline-icon">{step.icon}</div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <span className="timeline-date">{step.date}</span>
                            </div>
                            <h4 className="timeline-title">{step.title}</h4>
                            <p className="timeline-actor">
                                <strong>{step.actor}</strong> 
                                {step.pic && <span className="timeline-pic"> ({step.pic})</span>}
                            </p>
                            {step.note && (
                                <div className="timeline-note">
                                    Catatan: "{step.note}"
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditTrail;