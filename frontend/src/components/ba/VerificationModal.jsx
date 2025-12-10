import React, { useState } from 'react';
import Button from '../common/Button';
import SignaturePad from '../common/SignaturePad';
import './VerificationModal.css';

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
        // Jika status "Ditolak", apakah perlu tanda tangan?
        // Biasanya Gudang tetap perlu tanda tangan bukti pemeriksaan meski menolak.
        setStep(2); 
    };

    // Dipanggil saat SignaturePad selesai disimpan
    const handleFinalSubmit = (signatureData) => {
        // Kirim semua data ke parent
        onSubmit(actionType, notes, files, signatureData);
    };

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