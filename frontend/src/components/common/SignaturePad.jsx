import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from './Button';

const SignaturePad = ({ onSave, onCancel, loading }) => {
    const sigCanvas = useRef(null);
    const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'upload'
    
    // State untuk menyimpan Base64 string (baik dari gambar canvas maupun upload file)
    const [signatureData, setSignatureData] = useState(null);
    const [canvasWidth, setCanvasWidth] = useState(450);

    // Responsive width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 500) {
                setCanvasWidth(window.innerWidth - 60); 
            } else {
                setCanvasWidth(450);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); 

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- TAB DRAWING LOGIC ---
    const clearCanvas = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setSignatureData(null);
    };

    // --- TAB UPLOAD LOGIC ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran file terlalu besar! Maksimal 2MB.");
                return;
            }

            // Baca file sebagai Base64 String agar formatnya sama dengan Canvas
            const reader = new FileReader();
            reader.onload = (evt) => {
                setSignatureData(evt.target.result); 
            };
            reader.readAsDataURL(file);
        }
    };

    // --- SUBMIT LOGIC ---
    const handleSave = () => {
        let finalData = null;

        try {
            if (activeTab === 'draw') {
                // --- LOGIKA CANVAS ---
                if (!sigCanvas.current) {
                    console.error("Canvas reference not found");
                    return;
                }

                if (sigCanvas.current.isEmpty()) {
                    alert("Silakan tanda tangan terlebih dahulu pada kotak yang tersedia!");
                    return;
                }

                // FIX: Gunakan .getCanvas() (bukan getTrimmedCanvas yang error)
                // Hasilnya adalah String Base64, sesuai kebutuhan backend
                finalData = sigCanvas.current.getCanvas().toDataURL('image/png');
            
            } else {
                // --- LOGIKA UPLOAD ---
                if (!signatureData) {
                    alert("Silakan upload gambar tanda tangan!");
                    return;
                }
                // Gunakan data Base64 dari hasil upload
                finalData = signatureData;
            }

            console.log("Mengirim Tanda Tangan (Base64)...");

            // Kirim string Base64 ke parent
            if (onSave) {
                onSave(finalData);
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
                    onClick={() => {
                        setActiveTab('draw');
                        setSignatureData(null);
                    }}
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
                    onClick={() => {
                        setActiveTab('upload');
                        if (sigCanvas.current) sigCanvas.current.clear();
                    }}
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
                    {signatureData ? (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <img src={signatureData} alt="Preview" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }} />
                            <br />
                            <button 
                                type="button" 
                                onClick={() => setSignatureData(null)}
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