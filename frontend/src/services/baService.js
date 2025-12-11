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
    verify: async (id, status, notes, files, signature) => {
        try {
            const formData = new FormData();

            const statusEnum = status === 'Disetujui' ? 'approved' : 'rejected';
            formData.append('checkStatus', statusEnum);
            formData.append('notes', notes);

            // Tambahkan Tanda Tangan ke FormData jika ada (Base64 String)
            if (signature) {
                formData.append('digitalSignature', signature);
            }

            if (files && files.length > 0) {
                Array.from(files).forEach((file) => {
                    formData.append('images', file);
                });
            }
            const response = await api.patch(`/report-documents/${id}/verify`, formData);
            
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