import api from '../../utils/axios';

export async function fetchGlobalSearch(query, limit = 8) {
  const response = await api.get('/search', {
    params: { q: query, limit },
  });
  return response.data?.data ?? { projects: [], issues: [], users: [] };
}
