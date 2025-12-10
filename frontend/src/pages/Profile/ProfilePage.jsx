import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import Button from '../../components/common/Button';
import './ProfilePage.css'; // Jangan lupa import CSS baru

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [step, setStep] = useState('initial'); // initial, qr, success
    const [password, setPassword] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const sess = JSON.parse(localStorage.getItem('user_sess'));
        // Cek apakah user punya properti is2FAEnabled (jika disimpan di session)
        // Jika tidak ada di session, mungkin perlu fetch profile ulang
        setUser(sess);
    }, []);

    const handleStartSetup = async () => {
        if(!password) return alert("Masukkan password terlebih dahulu!");
        setLoading(true);
        try {
            const data = await authService.setup2FA(password);
            setQrCode(data.qrCode);
            setStep('qr');
        } catch (error) {
            alert(error.response?.data?.meta?.message || "Password salah atau gagal setup.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySetup = async () => {
        if(!otpToken) return alert("Masukkan kode OTP!");
        setLoading(true);
        try {
            await authService.verifySetup2FA(otpToken);
            setStep('success');
            setQrCode('');
            setPassword('');
        } catch (error) {
            alert("Kode salah atau kadaluarsa. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Helper untuk inisial nama (Misal: "Yohanes Barus" -> "YB")
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    };

    if (!user) return <div style={{padding: '40px', textAlign: 'center'}}>Memuat Profil...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profil & Keamanan</h1>
                <p>Kelola informasi akun dan pengaturan keamanan Anda disini.</p>
            </div>

            <div className="profile-grid">
                
                {/* --- KARTU KIRI: INFO USER --- */}
                <div className="profile-card profile-info-card">
                    <div className="profile-info-center">
                        <div className="avatar-circle">
                            {getInitials(user.name)}
                        </div>
                        <h2 className="info-name">{user.name}</h2>
                        <p className="info-email">{user.email}</p>
                        <span className={`role-badge ${user.role}`}>
                            {user.role}
                        </span>
                    </div>

                    <div className="divider"></div>

                    <div className="detail-row">
                        <span className="detail-label">Username</span>
                        <span className="detail-value">@{user.name.replace(/\s+/g, '').toLowerCase()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Perusahaan</span>
                        <span className="detail-value">{user.companyName}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">ID User</span>
                        <span className="detail-value" style={{fontFamily: 'monospace'}}>{user.id}...</span>
                    </div>
                </div>

                {/* --- KARTU KANAN: KEAMANAN 2FA --- */}
                <div className="profile-card">
                    <div className="security-header">
                        <div className={`security-icon ${step === 'success' ? 'active' : ''}`}>
                            {step === 'success' ? '🛡️' : '🔒'}
                        </div>
                        <div className="security-title">
                            <h3>Two-Factor Authentication (2FA)</h3>
                            <p>Lapisan keamanan tambahan untuk akun Anda.</p>
                        </div>
                    </div>

                    {step === 'initial' && (
                        <div className="animate-fade-in">
                            <p style={{lineHeight: '1.6', color: '#555'}}>
                                Amankan akun Anda dengan mewajibkan kode verifikasi dari aplikasi Authenticator (Google Auth / Authy) setiap kali login.
                            </p>
                            
                            <div style={{marginTop: '20px'}}>
                                <label style={{fontWeight: '600', fontSize: '14px', color: '#333'}}>
                                    Masukkan Password Anda untuk memulai:
                                </label>
                                <input 
                                    type="password" 
                                    className="custom-input"
                                    placeholder="Ketik password saat ini..." 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <Button onClick={handleStartSetup}>
                                    {loading ? 'Memproses...' : 'Mulai Aktivasi 2FA'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'qr' && (
                        <div className="animate-fade-in">
                            <p style={{textAlign: 'center', marginBottom: '10px'}}>
                                1. Buka aplikasi <strong>Google Authenticator</strong>.<br/>
                                2. Scan QR Code di bawah ini.
                            </p>
                            
                            <div className="qr-section">
                                <img src={qrCode} alt="QR Code" className="qr-image" />
                                <p style={{fontSize: '12px', color: '#888', marginTop: '10px'}}>
                                    Jika tidak bisa scan, gunakan kode secret (tersedia di backend).
                                </p>
                            </div>
                            
                            <div style={{marginTop: '20px'}}>
                                <label style={{fontWeight: '600', fontSize: '14px', color: '#333'}}>
                                    3. Masukkan 6 digit kode dari aplikasi:
                                </label>
                                <input 
                                    type="text" 
                                    className="custom-input"
                                    placeholder="Contoh: 123456" 
                                    style={{textAlign: 'center', letterSpacing: '5px', fontSize: '18px'}}
                                    value={otpToken} 
                                    onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                                />
                                <Button onClick={handleVerifySetup}>
                                    {loading ? 'Verifikasi...' : 'Verifikasi & Aktifkan'}
                                </Button>
                                <div style={{textAlign: 'center'}}>
                                    <button className="btn-cancel" onClick={() => setStep('initial')}>
                                        Batal Setup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="status-active-box animate-fade-in">
                            <div style={{fontSize: '30px'}}>✅</div>
                            <div>
                                <h4 style={{margin: '0 0 5px 0'}}>2FA Telah Aktif</h4>
                                <p style={{margin: 0, fontSize: '14px'}}>
                                    Akun Anda sekarang terlindungi. Logout dan Login kembali untuk mencoba.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;