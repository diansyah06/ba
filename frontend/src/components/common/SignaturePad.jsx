import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from './Button';

const SignaturePad = ({ onSave, onCancel, loading }) => {
    // FIX 1: Inisialisasi useRef dengan null, bukan object kosong
    const sigCanvas = useRef(null);
    
    const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'upload'
    const [uploadedImage, setUploadedImage] = useState(null);
    const [canvasWidth, setCanvasWidth] = useState(450);

    // Optional: Responsive width agar tidak melebar di layar HP
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 500) {
                setCanvasWidth(window.innerWidth - 60); // Padding kiri kanan
            } else {
                setCanvasWidth(450);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- TAB DRAWING LOGIC ---
    const clearCanvas = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setUploadedImage(null);
    };

    // --- TAB UPLOAD LOGIC ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (misal max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran file terlalu besar! Maksimal 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (evt) => {
                setUploadedImage(evt.target.result); // Simpan sebagai Base64
            };
            reader.readAsDataURL(file);
        }
    };

    // --- SUBMIT LOGIC ---
    const handleSave = () => {
        let signatureData = null;

        try {
            if (activeTab === 'draw') {
                // FIX 2: Cek apakah ref sudah terpasang
                if (!sigCanvas.current) {
                    console.error("Canvas reference not found");
                    return;
                }

                // Cek apakah canvas kosong
                if (sigCanvas.current.isEmpty()) {
                    alert("Silakan tanda tangan terlebih dahulu pada kotak yang tersedia!");
                    return;
                }

                // Ambil data gambar (Trimmed menghapus whitespace di sekitar tanda tangan)
                signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            
            } else {
                // Logic Tab Upload
                if (!uploadedImage) {
                    alert("Silakan upload gambar tanda tangan!");
                    return;
                }
                signatureData = uploadedImage;
            }

            // Kirim data ke parent
            if (onSave) {
                onSave(signatureData);
            }

        } catch (error) {
            console.error("Gagal menyimpan tanda tangan:", error);
            alert("Terjadi kesalahan saat memproses tanda tangan. Silakan coba lagi.");
        }
    };

    return (
        <div className="signature-pad-container" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
            
            {/* TABS HEADER */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button 
                    type="button"
                    onClick={() => setActiveTab('draw')}
                    style={{ 
                        flex: 1, 
                        padding: '8px', 
                        cursor: 'pointer',
                        border: 'none',
                        borderBottom: activeTab === 'draw' ? '2px solid #4CAF50' : '2px solid transparent',
                        background: activeTab === 'draw' ? '#e8f5e9' : 'transparent',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    ✍️ Gambar
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    style={{ 
                        flex: 1, 
                        padding: '8px', 
                        cursor: 'pointer',
                        border: 'none',
                        borderBottom: activeTab === 'upload' ? '2px solid #2196F3' : '2px solid transparent',
                        background: activeTab === 'upload' ? '#e3f2fd' : 'transparent',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    📤 Upload File
                </button>
            </div>

            {/* TAB CONTENT: DRAW */}
            {activeTab === 'draw' && (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ border: '2px dashed #ccc', background: '#fff', borderRadius: '4px' }}>
                        <SignatureCanvas 
                            ref={sigCanvas}
                            penColor="black"
                            backgroundColor="rgba(255, 255, 255, 1)"
                            canvasProps={{ 
                                width: canvasWidth, 
                                height: 200, 
                                className: 'sigCanvas' 
                            }}
                        />
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
                            *Gunakan mouse/jari untuk tanda tangan.
                        </p>
                        <button 
                            type="button" 
                            onClick={clearCanvas} 
                            style={{ 
                                fontSize: '12px', 
                                color: '#d32f2f', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                textDecoration: 'underline',
                                fontWeight: 'bold'
                            }}
                        >
                            Hapus / Ulangi
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: UPLOAD */}
            {activeTab === 'upload' && (
                <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px dashed #ccc', borderRadius: '4px' }}>
                    {uploadedImage ? (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <img src={uploadedImage} alt="Preview" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }} />
                            <br />
                            <button 
                                type="button" 
                                onClick={() => setUploadedImage(null)}
                                style={{ marginTop: '10px', fontSize: '12px', color: '#d32f2f', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                🗑️ Hapus Gambar
                            </button>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '20px'}}>
                            <input 
                                type="file" 
                                id="upload-sign"
                                accept="image/png, image/jpeg, image/jpg" 
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="upload-sign" style={{
                                cursor: 'pointer',
                                padding: '10px 20px',
                                background: '#2196F3',
                                color: 'white',
                                borderRadius: '4px',
                                display: 'inline-block',
                                marginBottom: '10px'
                            }}>
                                Pilih File Gambar
                            </label>
                            <br/>
                            <small style={{ color: '#888' }}>Format: PNG (Transparan) / JPG.</small>
                        </div>
                    )}
                </div>
            )}

            {/* ACTIONS */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <Button 
                    type="button" 
                    onClick={onCancel} 
                    style={{ backgroundColor: '#9e9e9e', flex: 1 }}
                    disabled={loading}
                >
                    Batal
                </Button>
                <Button 
                    type="button" 
                    onClick={handleSave} 
                    style={{ backgroundColor: '#4CAF50', flex: 1 }}
                    isLoading={loading}
                >
                    Konfirmasi & Tanda Tangan
                </Button>
            </div>
        </div>
    );
};

export default SignaturePad;