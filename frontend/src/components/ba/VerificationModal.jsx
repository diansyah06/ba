import React, { useState } from 'react';
import Button from '../common/Button';
import SignaturePad from '../common/SignaturePad';
import './VerificationModal.css';

// --- FUNGSI HELPER (Letakkan di luar component) ---
// Fungsi ini mengubah kode gambar (Base64) menjadi File Asli agar terbaca oleh Backend
const dataURLtoFile = (dataurl, filename) => {
    // Cek validitas data
    if (!dataurl || typeof dataurl !== 'string') return dataurl;

    try {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, {type:mime});
    } catch (error) {
        console.error("Gagal mengonversi gambar:", error);
        return null;
    }
}
// --------------------------------------------------

const VerificationModal = ({ isOpen, onClose, onSubmit, actionType, loading }) => {
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState([]);
    
    // State baru untuk tanda tangan
    const [step, setStep] = useState(1); // 1 = Form, 2 = Signature

    if (!isOpen) return null;

    const isApprove = actionType === 'Disetujui';

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    // Pindah ke step tanda tangan
    const handleNext = (e) => {
        e.preventDefault();
        if (!notes.trim()) {
            alert("Catatan Pemeriksaan wajib diisi!");
            return;
        }
        setStep(2); 
    };

    // --- BAGIAN INI DIPERBAIKI ---
    // Dipanggil saat SignaturePad selesai disimpan
    const handleFinalSubmit = (signatureData) => {
        // Konversi Base64 String (dari Canvas) menjadi File Object
        // Jika signatureData sudah berupa File (sangat jarang terjadi di logic ini), dia akan tetap aman.
        const signatureFile = dataURLtoFile(signatureData, 'signature-digital.png');

        // Kirim data yang SUDAH MENJADI FILE ke parent
        onSubmit(actionType, notes, files, signatureFile);
    };
    // -----------------------------

    const handleClose = () => {
        setStep(1);
        setNotes('');
        setFiles([]);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <h3 className={`modal-title ${isApprove ? 'text-approve' : 'text-reject'}`}>
                    {isApprove ? '✅ Verifikasi & Tanda Tangan' : '❌ Tolak Barang'}
                </h3>
                
                {/* STEP 1: FORM INPUT */}
                {step === 1 && (
                    <form onSubmit={handleNext}>
                        <div className="modal-form-group">
                            <label className="modal-label">Catatan Pemeriksaan (Wajib):</label>
                            <textarea
                                className="modal-textarea"
                                rows="4"
                                placeholder={isApprove 
                                    ? "Contoh: Barang lengkap, kondisi fisik baik, segel utuh..." 
                                    : "Contoh: Kemasan rusak, jumlah kurang 2 unit..."}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label className="modal-label">Bukti Foto Fisik (Opsional):</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="modal-file-input"
                            />
                            <small className="modal-hint">Maksimal 5 foto (JPG/PNG).</small>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
                            <Button 
                                type="button" 
                                onClick={handleClose} 
                                style={{ backgroundColor: '#6c757d', flex: 1 }}
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit"
                                style={{ backgroundColor: isApprove ? '#4CAF50' : '#f44336', flex: 1 }}
                            >
                                Lanjut ke Tanda Tangan &rarr;
                            </Button>
                        </div>
                    </form>
                )}

                {/* STEP 2: TANDA TANGAN */}
                {step === 2 && (
                    <div className="step-signature-container">
                        <p style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                            Silakan bubuhkan tanda tangan digital Anda:
                        </p>
                        
                        <SignaturePad 
                            loading={loading}
                            onCancel={() => setStep(1)} // Kembali ke form
                            onSave={handleFinalSubmit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationModal;