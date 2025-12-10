import api from './api';

const companyService = {
    getAll: async () => {
        const response = await api.get('/company');
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post('/company', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/company/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/company/${id}`);
        return response.data;
    }
};

export default companyService;