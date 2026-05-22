import { useState, useCallback } from 'react';
import bidService from '../api/bidService';
import { toast } from 'react-hot-toast';

/**
 * Reusable Hook for Bid Management State and Operations
 * Exposes core states, async handlers, and built-in toast notifications.
 */
export const useBids = () => {
  const [bids, setBids] = useState([]);
  const [currentBid, setCurrentBid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  /**
   * Fetch all bids matching parameters
   */
  const fetchBids = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bidService.getBids(params);
      setBids(data.bids);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      });
      return data;
    } catch (err) {
      console.error('Failed to fetch bids:', err);
      const msg = err.response?.data?.message || 'Failed to fetch bids';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch details of a single bid
   */
  const fetchBidDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bidService.getBidById(id);
      setCurrentBid(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch bid detail:', err);
      const msg = err.response?.data?.message || 'Failed to load bid details';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new bid
   */
  const createBid = useCallback(async (bidData) => {
    setActionLoading(true);
    try {
      const data = await bidService.createBid(bidData);
      toast.success('Bid created successfully!');
      // Refetch or update state locally if needed
      setBids((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to create bid:', err);
      const msg = err.response?.data?.message || 'Failed to create bid';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /**
   * Update an existing bid
   */
  const updateBid = useCallback(async (id, updateData) => {
    setActionLoading(true);
    try {
      const data = await bidService.updateBid(id, updateData);
      toast.success('Bid updated successfully!');
      // Sync local state
      setBids((prev) => prev.map((b) => (b._id === id ? data : b)));
      if (currentBid && currentBid._id === id) {
        setCurrentBid(data);
      }
      return data;
    } catch (err) {
      console.error('Failed to update bid:', err);
      const msg = err.response?.data?.message || 'Failed to update bid';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [currentBid]);

  /**
   * Delete a bid
   */
  const deleteBid = useCallback(async (id) => {
    setActionLoading(true);
    try {
      await bidService.deleteBid(id);
      toast.success('Bid deleted successfully!');
      // Remove from local list
      setBids((prev) => prev.filter((b) => b._id !== id));
      if (currentBid && currentBid._id === id) {
        setCurrentBid(null);
      }
    } catch (err) {
      console.error('Failed to delete bid:', err);
      const msg = err.response?.data?.message || 'Failed to delete bid';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [currentBid]);

  return {
    bids,
    currentBid,
    loading,
    actionLoading,
    error,
    pagination,
    fetchBids,
    fetchBidDetail,
    createBid,
    updateBid,
    deleteBid,
  };
};
