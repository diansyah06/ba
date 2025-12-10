import api from './api';

const authService = {
    login: async (identifier, password) => {
        const response = await api.post('/auth/login', { identifier, password });
        let data = response.data.data;

        if (data.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            if (!data.user || !data.user.role) {
                try {
                    const meResponse = await api.get('/auth/me');
                    data.user = meResponse.data.data;
                } catch (error) {
                    console.error("Gagal mengambil profil user:", error);
                }
            }
        }
        return data;
    },

    // Ini untuk verifikasi saat LOGIN (sudah ada)
    verify2FA: async (tempToken, token) => {
        const response = await api.post('/auth/verify-2fa', { tempToken, token });
        return response.data.data;
    },

    // --- TAMBAHAN BARU (UNTUK PROFILE PAGE) ---
    
    // 1. Minta QR Code (Setup Awal)
    setup2FA: async (password) => {
        const response = await api.post('/2fa/setup', { password });
        return response.data.data; // Berisi { qrCode, secret }
    },

    // 2. Verifikasi untuk Mengaktifkan (Setup Akhir)
    verifySetup2FA: async (token) => {
        const response = await api.post('/2fa/verify', { token });
        return response.data;
    },
    
    // ------------------------------------------

    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data.data;
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    saveSession: (data) => {
        const user = data.user || {};

        const sessionData = {
            token: data.token,
            id: user._id || user.id,
            name: user.fullname,
            email: user.email,
            role: user.role, 
            companyName: user.companyName || (user.vendorId ? 'Vendor Company' : 'Internal')
        };

        localStorage.setItem('user_sess', JSON.stringify(sessionData));
        return sessionData;
    },

    logout: () => {
        localStorage.removeItem('user_sess');
        delete api.defaults.headers.common['Authorization'];
    }
};

export default authService;