import React, { useState } from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useNavigate, Link } from 'react-router-dom'; 
import authService from '../../services/authService';
import api from '../../services/api';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './LoginPage.css';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [otpToken, setOtpToken] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const redirectUser = (role) => {
        console.log("Mencoba redirect untuk role:", role);

        if (!role) {
            Swal.fire('Error', 'Role pengguna tidak ditemukan.', 'error');
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Login Berhasil!',
            text: `Selamat datang kembali, ${role}`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            if (role === 'administrator') {
                navigate('/admin/users');
            } else {
                navigate('/dashboard');
            }
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const responseData = await authService.login(identifier, password);

            if (responseData.require2FA) {
                setTempToken(responseData.tempToken);
                setShowOTP(true);
                Swal.fire('2FA Diperlukan', 'Silakan masukkan kode dari aplikasi authenticator Anda.', 'info');
            } else {
                const session = authService.saveSession(responseData);

                if (session && session.role) {
                    redirectUser(session.role);
                } else {
                    const userProfile = await authService.getProfile();
                    const newSession = { token: responseData.token, user: userProfile };
                    const finalSession = authService.saveSession(newSession);
                    redirectUser(finalSession.role);
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: error.response?.data?.meta?.message || "Username atau password salah."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const verifyResult = await authService.verify2FA(tempToken, otpToken);
            const token = verifyResult.token;

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const userProfile = await authService.getProfile();
            const sessionData = { token: token, user: userProfile };
            authService.saveSession(sessionData);

            redirectUser(userProfile.role);
        } catch (error) {
            console.error(error);
            Swal.fire('Gagal', 'Kode 2FA salah atau kadaluarsa.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">
                {showOTP ? 'Verifikasi 2FA' : 'Login Aplikasi'}
            </h2>
            <p className="login-subtitle">
                {showOTP ? 'Masukkan kode dari aplikasi authenticator.' : 'Silakan masuk menggunakan akun terdaftar.'}
            </p>

            {!showOTP ? (
                <form onSubmit={handleLogin}>
                    <InputField
                        label="Email / Username"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Masukkan username..."
                    />
                    <InputField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password..."
                    />
                    {/* Menggunakan Button Custom dengan prop isLoading */}
                    <Button type="submit" isLoading={loading}>
                        Masuk
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP}>
                    <InputField
                        label="Kode OTP"
                        type="text"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        placeholder="6 digit kode"
                    />
                    <Button type="submit" isLoading={loading}>
                        Verifikasi
                    </Button>
                    <div className="otp-actions">
                        <button 
                            type="button" 
                            onClick={() => setShowOTP(false)} 
                            className="link-back"
                            disabled={loading}
                        >
                            Kembali ke Login
                        </button>
                    </div>
                </form>
            )}

            {!showOTP && (
                <div className="register-link-container">
                    Belum punya akun? <Link to="/register" className="register-link">Daftar Akun Baru</Link>
                </div>
            )}
        </div>
    );
};

export default LoginPage;