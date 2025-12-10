import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import '../ba/VerificationModal.css'; // Kita gunakan style yang sama dengan modal verifikasi

const ResubmitModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
    const [formData, setFormData] = useState({
        contractNumber: '',
        paymentNominal: '',
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                contractNumber: initialData.contractNumber || '',
                paymentNominal: initialData.paymentNominal || '',
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pastikan nominal dikirim sebagai number
        const payload = {
            ...formData,
            paymentNominal: parseInt(formData.paymentNominal)
        };
        onSubmit(payload);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Revisi Dokumen</h3>
                <p>Silakan perbaiki data di bawah ini untuk diajukan kembali.</p>

                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <InputField
                        label="Nomor Kontrak"
                        type="text"
                        name="contractNumber" // Penting untuk handleChange
                        value={formData.contractNumber}
                        onChange={handleChange}
                    />

                    <InputField
                        label="Nominal Tagihan (Rp)"
                        type="number"
                        name="paymentNominal"
                        value={formData.paymentNominal}
                        onChange={handleChange}
                    />

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Deskripsi Pekerjaan
                        </label>
                        <textarea
                            className="form-control" // Menggunakan class bawaan input field jika ada, atau inline style
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                minHeight: '80px'
                            }}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Mengirim...' : 'Kirim Revisi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResubmitModal;