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
    // [GANTIKAN FUNGSI verify DENGAN INI]
    // [GANTI FUNGSI verify DENGAN KODE INI]
    
    verify: async (id, status, notes, files, signature) => {
        try {
            let uploadedImages = [];

            // LANGKAH 1: Upload Gambar Bukti Fisik (Jika Ada)
            if (files && files.length > 0) {
                const formData = new FormData();
                Array.from(files).forEach((file) => {
                    formData.append('files', file); // Key harus 'files' sesuai backend
                });

                // Panggil endpoint khusus upload media
                const uploadResponse = await api.post('/media/upload-multiple', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                // Ambil hasil upload (array url & public_id)
                if (uploadResponse.data && Array.isArray(uploadResponse.data.data)) {
                    uploadedImages = uploadResponse.data.data.map(img => ({
                        url: img.secure_url,
                        publicId: img.public_id,
                        uploadedAt: new Date()
                    }));
                }
            }

            // LANGKAH 2: Kirim Data Verifikasi sebagai JSON
            // Karena dikirim sebagai JSON, string Base64 tanda tangan AMAN (tidak akan error 500/CastError)
            const payload = {
                checkStatus: status === 'Disetujui' ? 'approved' : 'rejected',
                notes: notes,
                digitalSignature: signature, // Ini sekarang STRING Base64 (bukan File object)
                images: uploadedImages       // Array hasil upload dari Langkah 1
            };

            // Kirim ke endpoint verify
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