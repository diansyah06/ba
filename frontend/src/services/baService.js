import api from './api';

const baService = {
    getAll: async () => {
        try {
            const response = await api.get('/report-documents');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching BA data:", error);
            throw error;
        }
    },

    create: async (payload) => {
        try {
            const response = await api.post('/report-documents', payload);
            return response.data;
        } catch (error) {
            console.error("Error creating BA:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/report-documents/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching BA detail:", error);
            throw error;
        }
    },

    // --- FITUR REVISI ---
    resubmit: async (id, payload) => {
        try {
            const response = await api.patch(`/report-documents/${id}/resubmit`, payload);
            return response.data;
        } catch (error) {
            console.error("Error resubmitting BA:", error);
            throw error;
        }
    },

    // APPROVE (BAPP / Final Approval) - JSON Payload (Sudah Benar)
    approve: async (id, status, notes, signature) => {
        try {
            const payload = {
                status: status === 'Disetujui' ? 'approved' : 'rejected',
                notes: notes || (status === 'Disetujui' ? 'Dokumen disetujui.' : 'Ditolak, mohon revisi.'),
                digitalSignature: signature // Mengirim string Base64
            };
            const response = await api.patch(`/report-documents/${id}/approve`, payload);
            return response.data;
        } catch (error) {
            console.error("Error approving:", error);
            throw error;
        }
    },

    // VERIFY (BAPB / Gudang) - FormData Payload (PERBAIKAN HEADER)
    // VERIFY (BAPB / Gudang) - REVISI: Upload Dulu, Baru Submit JSON
    //
    // VERIFY (BAPB / Gudang) - REVISI: Upload Gambar Terpisah, Kirim Data sebagai JSON
    verify: async (id, status, notes, files, signature) => {
        try {
            let uploadedImages = [];

            // 1. JIKA ADA FILE BUKTI FISIK, UPLOAD TERPISAH DULU
            if (files && files.length > 0) {
                const formData = new FormData();
                // Penting: Gunakan key 'files' sesuai endpoint upload-multiple di backend
                Array.from(files).forEach((file) => {
                    formData.append('files', file);
                });

                // Upload ke endpoint media khusus
                const uploadResponse = await api.post('/media/upload-multiple', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Ambil hasil upload dan format sesuai schema database
                // Asumsi response media controller: { data: [{ secure_url, public_id }, ...] }
                if (uploadResponse.data && Array.isArray(uploadResponse.data.data)) {
                    uploadedImages = uploadResponse.data.data.map(img => ({
                        url: img.secure_url,
                        publicId: img.public_id,
                        uploadedAt: new Date()
                    }));
                }
            }

            // 2. KIRIM DATA VERIFIKASI SEBAGAI JSON (SEPERTI BAPP)
            // Karena JSON, string signature yang panjang tidak akan error/terpotong
            const payload = {
                checkStatus: status === 'Disetujui' ? 'approved' : 'rejected',
                notes: notes,
                digitalSignature: signature, // String Base64 aman di sini
                images: uploadedImages       // Array metadata gambar (hasil upload langkah 1)
            };

            // Kirim ke endpoint verify (tanpa FormData, otomatis JSON)
            const response = await api.patch(`/report-documents/${id}/verify`, payload);

            return response.data;
        } catch (error) {
            console.error("Error verifying:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/report-documents/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting BA:", error);
            throw error;
        }
    }
};

export default baService;