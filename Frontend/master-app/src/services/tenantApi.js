import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // API Gateway

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('trackify_master_token')}`,
  },
});

export const fetchAllTenants = async (page = 0, size = 10) => {
  const response = await axios.get(
    `${API_BASE_URL}/tenants?page=${page}&size=${size}`,
    getAuthHeaders()
  );
  return response.data;
};

export const createTenant = async (tenantData) => {
  const response = await axios.post(`${API_BASE_URL}/tenants`, tenantData, getAuthHeaders());
  return response.data;
};

export const updateTenantStatus = async (tenantId, status) => {
  const response = await axios.patch(
    `${API_BASE_URL}/tenants/${tenantId}/status`,
    { status },
    getAuthHeaders()
  );
  return response.data;
};

export const deleteTenant = async (tenantId) => {
  const response = await axios.delete(`${API_BASE_URL}/tenants/${tenantId}`, getAuthHeaders());
  return response.data;
};
