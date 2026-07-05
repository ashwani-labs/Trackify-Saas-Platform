import api from '../utils/axios';

export const fetchWorkspaceBranding = async (tenantId) => {
  const response = await api.get(`/tenants/${tenantId}`);
  return response.data;
};

export const updateWorkspaceBranding = async (tenantId, branding) => {
  const response = await api.patch(`/tenants/${tenantId}/branding`, branding);
  return response.data;
};
