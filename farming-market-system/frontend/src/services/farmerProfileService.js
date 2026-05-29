import api from './api';

export const upsertFarmerProfile = async (data) => (await api.put('/farmer/profile', data)).data;
