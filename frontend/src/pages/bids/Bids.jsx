import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BidFormDrawer from '../../components/bids/BidFormDrawer';
import TableSkeleton from '../../components/ui/TableSkeleton';
import BidTable from '../../components/bids/BidTable';
import api from '../../api/axios';
import { useBids } from '../../hooks/useBids';
import { useAuth } from '../../context/AuthContext';
import ExportDropdown from '../../components/exports/ExportDropdown';
import { 
  Search, Plus, Calendar, DollarSign, User, AlertCircle, Filter, 
  ChevronLeft, ChevronRight, Briefcase, ArrowUpDown, Pencil, Trash2, X, SlidersHorizontal
} from 'lucide-react';

const STATUS_BADGES = {
  'New Enquiry': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Quotation Sent': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Negotiation': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Order Processing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Completed': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const PRIORITY_BADGES = {
  'Low': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Medium': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'High': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Urgent': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const Bids = () => {
  const { bids, loading, pagination, fetchBids, deleteBid } = useBids();
  const { hasPermission } = useAuth();
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  // Advanced filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadlineAfter, setDeadlineAfter] = useState('');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [teamMembers, setTeamMembers] = useState([]);

  // Fetch team members for the Assignee Filter dropdown
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setTeamMembers(data);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
      }
    };
    fetchTeam();
  }, []);

  // Debounce search input to avoid redundant database calls on keypress
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadBidsData = useCallback(() => {
    fetchBids({
      page,
      limit: 8,
      search: debouncedSearch.trim() || undefined,
      status: status || undefined,
      priority: priority || undefined,
      assignedTo: assignedTo || undefined,
      deadlineAfter: deadlineAfter || undefined,
      deadlineBefore: deadlineBefore || undefined,
      sortBy,
      order,
    });
  }, [fetchBids, page, debouncedSearch, status, priority, assignedTo, deadlineAfter, deadlineBefore, sortBy, order]);

  useEffect(() => {
    loadBidsData();
  }, [loadBidsData]);

  // Reset pagination page on filter shifts
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, assignedTo, deadlineAfter, deadlineBefore]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
    }
  };

  const handleRowClick = (bid) => {
    setSelectedBid(bid);
    setIsDrawerOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedBid(null);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this bid proposal?')) {
      await deleteBid(id);
      loadBidsData();
    }
  };

  const handleEditClick = (e, bid) => {
    e.stopPropagation();
    setSelectedBid(bid);
    setIsDrawerOpen(true);
  };

  const handleClearAll = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setPriority('');
    setAssignedTo('');
    setDeadlineAfter('');
    setDeadlineBefore('');
    setPage(1);
  };

  // Find assignee name matching current assignee ID for filter chips
  const getAssigneeName = () => {
    const member = teamMembers.find(m => m._id === assignedTo);
    return member ? member.name : 'Unknown';
  };

  const hasActiveFilters = 
    search.trim() !== '' || 
    status !== '' || 
    priority !== '' || 
    assignedTo !== '' || 
    deadlineAfter !== '' || 
    deadlineBefore !== '';

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <tr key={idx} className="border-b border-slate-800/40 bg-slate-900/5 animate-pulse">
        <td className="py-4 px-6">
          <div className="h-4 w-40 bg-slate-800 rounded-lg"></div>
          <div className="h-3 w-24 bg-slate-900 rounded-md mt-2"></div>
        </td>
        <td className="py-4 px-6">
          <div className="h-4 w-20 bg-slate-800 rounded-lg"></div>
        </td>
        <td className="py-4 px-6">
          <div className="h-5 w-24 bg-slate-800 rounded-full"></div>
        </td>
        <td className="py-4 px-6">
          <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-800"></div>
            <div className="h-3 w-16 bg-slate-800 rounded-md"></div>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="h-4 w-24 bg-slate-800 rounded-lg"></div>
        </td>
        <td className="py-4 px-6">
          <div className="h-4 w-12 bg-slate-800 rounded-lg"></div>
        </td>
      </tr>
    ));
  };

  if (loading && bids.length === 0) {
    return (
      <PageTransition className="space-y-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
            <div className="h-4 w-72 bg-slate-100 dark:bg-slate-900/50 animate-pulse rounded-md"></div>
          </div>
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        </div>
        <TableSkeleton rows={8} cols={7} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bid Intelligence Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor, query, and modify active bids and enterprise accounts.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ExportDropdown 
            data={bids} 
            fileName="filtered_bids_report" 
            title="Filtered Bids Pipeline Audit" 
            subtitle="Filtered list of active bid proposals and sales stages." 
          />
          {hasPermission('create-bid') && (
            <Button 
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Proposal
            </Button>
          )}
        </div>
      </div>

      {/* Modern Advanced Floating Filter Panel */}
      <div className="space-y-4">
        {/* Core Quick Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border border-slate-800 bg-[#090d1f]/50 backdrop-blur-xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search proposals, clients..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/30 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl px-4 py-2 text-xs flex items-center gap-2 border ${
                showFilters ? 'bg-slate-800 border-blue-500/40 text-blue-400' : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </Button>
          </div>
        </div>

        {/* Animated Advanced Parameters Drawer Sub-panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800 bg-[#060919]/40 backdrop-blur-md">
                {/* Sales Stage (Status) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sales Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="">All Stages</option>
                    {Object.keys(STATUS_BADGES).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="">All Priorities</option>
                    {Object.keys(PRIORITY_BADGES).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Team Member</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="">All Owners</option>
                    {teamMembers.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                {/* Deadlines Range */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deadline Range</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={deadlineAfter}
                      onChange={(e) => setDeadlineAfter(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-1.5 px-2 text-[10px] text-slate-300 outline-none [color-scheme:dark]"
                    />
                    <span className="text-slate-600 text-xs">-</span>
                    <input
                      type="date"
                      value={deadlineBefore}
                      onChange={(e) => setDeadlineBefore(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-1.5 px-2 text-[10px] text-slate-300 outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic dismissible Chips row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center bg-[#090d1f]/10 p-2 rounded-xl border border-slate-900">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Active Parameters:</span>
            
            {search.trim() !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400 font-medium">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {status !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400 font-medium">
                Stage: {status}
                <button onClick={() => setStatus('')} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {priority !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400 font-medium">
                Priority: {priority}
                <button onClick={() => setPriority('')} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {assignedTo !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400 font-medium">
                Owner: {getAssigneeName()}
                <button onClick={() => setAssignedTo('')} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {deadlineAfter !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400 font-medium">
                After: {deadlineAfter}
                <button onClick={() => setDeadlineAfter('')} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {deadlineBefore !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400 font-medium">
                Before: {deadlineBefore}
                <button onClick={() => setDeadlineBefore('')} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}

            <button
              onClick={handleClearAll}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider ml-auto px-2 py-1 rounded hover:bg-red-500/5 transition-colors"
            >
              Clear all parameters
            </button>
          </div>
        )}
      </div>

      {/* Main Table / Grid Container */}
      {!loading && bids.length === 0 ? (
        <Card className="min-h-[420px] flex flex-col items-center justify-center text-center border-dashed border-slate-800 bg-[#090d1f]/20 p-8 rounded-3xl">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center border border-blue-500/20 mb-6 shadow-xl shadow-blue-500/5">
            <Briefcase className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">No active proposals found</h3>
          <p className="text-slate-500 max-w-sm text-sm mt-2 mb-6">Create a bid proposal to get started with predictive AI valuations and client pipeline tracking.</p>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Bid
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <BidTable 
            bids={bids}
            sortBy={sortBy}
            order={order}
            handleSort={handleSort}
            handleRowClick={handleRowClick}
            handleEditClick={handleEditClick}
            handleDeleteClick={handleDeleteClick}
          />

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-6">
              <span className="text-xs text-slate-500">
                Showing page <strong className="text-slate-300">{pagination.page}</strong> of <strong className="text-slate-300">{pagination.pages}</strong> ({pagination.total} total bids)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                  className="rounded-xl"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unified Bid Form Drawer */}
      <BidFormDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedBid(null);
        }} 
        onSuccess={loadBidsData}
        editBidData={selectedBid}
      />
    </PageTransition>
  );
};

export default Bids;
