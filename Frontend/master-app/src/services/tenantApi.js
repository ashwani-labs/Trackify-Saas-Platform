import api from '../utils/axios';

export const fetchAllTenants = async (page = 0, size = 10) => {
  const response = await api.get(`/tenants?page=${page}&size=${size}`);
  return response.data;
};

export const fetchTenantById = async (tenantId) => {
  const response = await api.get(`/tenants/${tenantId}`);
  return response.data;
};

export const fetchDashboardStats = async (months = 6) => {
  const response = await api.get('/tenants/dashboard-stats', { params: { months } });
  return response.data;
};

export const createTenant = async (tenantData) => {
  const response = await api.post('/tenants', tenantData);
  return response.data;
};

export const updateTenantStatus = async (tenantId, status) => {
  const response = await api.patch(`/tenants/${tenantId}/status`, { status });
  return response.data;
};

export const deleteTenant = async (tenantId) => {
  const response = await api.delete(`/tenants/${tenantId}`);
  return response.data;
};
