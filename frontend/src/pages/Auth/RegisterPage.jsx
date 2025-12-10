import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import Swal from 'sweetalert2'; // Import SweetAlert2

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            Swal.fire('Gagal', 'Password dan Konfirmasi Password tidak cocok!', 'warning');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                fullname: formData.fullname,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            await authService.register(payload);

            await Swal.fire({
                icon: 'success',
                title: 'Pendaftaran Berhasil!',
                text: 'Akun Anda berstatus "Pending". Silakan hubungi Administrator untuk aktivasi.',
                confirmButtonText: 'Ke Halaman Login'
            });
            
            navigate('/login');

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.meta?.message || "Gagal Mendaftar.";
            Swal.fire('Error', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Daftar Akun Baru</h2>
            <p className="auth-subtitle">Silakan isi data diri Anda untuk mendaftar.</p>

            <form onSubmit={handleRegister}>
                <InputField
                    label="Nama Lengkap"
                    type="text"
                    placeholder="Nama Lengkap Anda"
                    value={formData.fullname}
                    onChange={(e) => handleChange('fullname', e.target.value)}
                />

                <InputField
                    label="Username"
                    type="text"
                    placeholder="Username unik"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                />

                <InputField
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                />

                <InputField
                    label="Password"
                    type="password"
                    placeholder="Min 6 karakter, Huruf Besar & Angka"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                />

                <InputField
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />

                <div className="auth-info-box">
                    ℹ️ Info: Setelah mendaftar, akun Anda perlu diverifikasi oleh Admin.
                </div>

                <Button type="submit" isLoading={loading}>
                    Daftar Sekarang
                </Button>
            </form>

            <div className="auth-footer">
                Sudah punya akun? 
                <Link to="/login" className="auth-link">Login di sini</Link>
            </div>
        </div>
    );
};

export default RegisterPage;