import api from './axios';

const auditLogService = {
  /**
   * Fetch paginated audit logs with search and entity filters
   * @param {Object} params
   * @param {String} params.search - Global query matching actions or details
   * @param {String} params.entityType - Filters by ('Bid' | 'Upload' | 'User' | 'AI' | 'Auth' | 'System')
   * @param {Number} params.page - Current page index
   * @param {Number} params.limit - Size of payload records per request page
   */
  getLogs: async (params = {}) => {
    const { data } = await api.get('/audit-logs', { params });
    return data;
  },
};

export default auditLogService;
