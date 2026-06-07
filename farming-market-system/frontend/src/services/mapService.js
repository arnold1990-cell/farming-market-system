import api from './api';

export const getFarmerMapListings = async (params) => (await api.get('/farmers/map', { params })).data;
export const getNearbyFarmers = async (params) => (await api.get('/farmers/nearby', { params })).data;
