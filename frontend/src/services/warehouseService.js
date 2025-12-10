import api from './api';

const warehouseService = {
    getAll: async () => {
        const response = await api.get('/warehouse');
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post('/warehouse', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/warehouse/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/warehouse/${id}`);
        return response.data;
    }
};

export default warehouseService;