import React from 'react';
import './TentangPage.css';

const TentangPage = () => {
    return (
        <div className="tentang-container">
            <div className="tentang-header">
                <h1>Tentang Aplikasi</h1>
                <p>Informasi mengenai sistem Digital-BA</p>
            </div>

            <div className="tentang-card">

                <div className="tentang-section">
                    <h2>Apa itu Digital-BA?</h2>
                    <p>
                        <strong>Digital-BA</strong> adalah sistem informasi manajemen dokumen elektronik yang dirancang 
                        untuk mendigitalisasi proses pembuatan, pengiriman, dan persetujuan dokumen 
                        <strong>Berita Acara (BA)</strong>.
                    </p>
                    <p>
                        Aplikasi ini menggantikan cara kerja manual (kertas) menjadi sistem <em>paperless</em> yang 
                        lebih cepat, transparan, dan terpusat, memfasilitasi kolaborasi antara Pihak Eksternal (Vendor) 
                        dan Pihak Internal Perusahaan.
                    </p>
                </div>

                <div className="tentang-section">
                    <h2>Pengguna & Hak Akses</h2>
                    <p>Sistem ini membagi pengguna ke dalam 4 peran utama dengan tanggung jawab spesifik:</p>
                    <ul className="role-list">
                        <li>
                            <strong>1. Vendor (Eksternal)</strong>
                            <span>Bertugas membuat dan mengajukan draft Berita Acara baru sesuai kontrak.</span>
                        </li>
                        <li>
                            <strong>2. PIC Gudang</strong>
                            <span>Pihak internal yang khusus memeriksa fisik barang dan menyetujui dokumen <strong>BAPB</strong> (Berita Acara Pemeriksaan Barang).</span>
                        </li>
                        <li>
                            <strong>3. Direksi Pekerjaan</strong>
                            <span>Pihak internal yang memeriksa hasil pekerjaan jasa/konstruksi dan menyetujui dokumen <strong>BAPP</strong> (Berita Acara Pemeriksaan Pekerjaan).</span>
                        </li>
                        <li>
                            <strong>4. Administrator</strong>
                            <span>Pengelola sistem yang bertugas manajemen akun pengguna (tambah user, reset password, validasi vendor).</span>
                        </li>
                    </ul>
                </div>

                <div className="tentang-section">
                    <h2>Alur Kerja Sistem</h2>
                    <div className="workflow-steps">
                        <div className="step">
                            <span className="step-number">1</span>
                            <p>Vendor Input Data</p>
                        </div>
                        <div className="step-arrow">➜</div>
                        <div className="step">
                            <span className="step-number">2</span>
                            <p>Verifikasi Internal</p>
                        </div>
                        <div className="step-arrow">➜</div>
                        <div className="step">
                            <span className="step-number">3</span>
                            <p>Persetujuan Digital</p>
                        </div>
                    </div>
                    <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                        *Dokumen BAPB diverifikasi oleh PIC Gudang, sedangkan BAPP diverifikasi oleh Direksi.
                    </p>
                </div>

                <div className="tentang-section">
                    <h2>Teknologi (Tech Stack)</h2>
                    <p>Aplikasi ini dibangun menggunakan teknologi web modern (MERN Stack) untuk performa tinggi:</p>
                    <ul className="tech-grid">
                        <li>⚛️ <strong>Frontend:</strong> React.js + Vite</li>
                        <li>🚀 <strong>Backend:</strong> Node.js + Express (TypeScript)</li>
                        <li>🍃 <strong>Database:</strong> MongoDB Atlas (Cloud)</li>
                        <li>🔒 <strong>Keamanan:</strong> JWT Auth & Password Hashing</li>
                    </ul>
                </div>

                <div className="tentang-footer">
                    <p>&copy; {new Date().getFullYear()} Tim Pengembang Digital-BA. Versi 1.0.0</p>
                </div>

            </div>
        </div>
    );
};

export default TentangPage;