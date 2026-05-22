import api from './axios';

/**
 * Bid Service API Layer
 * Decouples API client requests from React state/UI components.
 */
const bidService = {
  /**
   * Fetch all bids with pagination, filtering, sorting, and search
   * @param {Object} params - Query params (page, limit, search, status, priority, etc.)
   */
  getBids: async (params = {}) => {
    const { data } = await api.get('/bids', { params });
    return data;
  },

  /**
   * Fetch a single bid by ID
   * @param {String} id - Bid document ID
   */
  getBidById: async (id) => {
    const { data } = await api.get(`/bids/${id}`);
    return data;
  },

  /**
   * Create a new bid
   * @param {Object} bidData - Schema conforming bid data
   */
  createBid: async (bidData) => {
    const { data } = await api.post('/bids', bidData);
    return data;
  },

  /**
   * Update an existing bid by ID
   * @param {String} id - Bid document ID
   * @param {Object} updateData - Modifying fields
   */
  updateBid: async (id, updateData) => {
    const { data } = await api.put(`/bids/${id}`, updateData);
    return data;
  },

  /**
   * Delete a bid by ID
   * @param {String} id - Bid document ID
   */
  deleteBid: async (id) => {
    const { data } = await api.delete(`/bids/${id}`);
    return data;
  },
};

export default bidService;
