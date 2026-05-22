import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';

const STATUS_BADGES = {
  'New Enquiry': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'Quotation Sent': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  'Negotiation': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  'Approved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  'Rejected': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  'Order Processing': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'Completed': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
};

const PRIORITY_BADGES = {
  'Low': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
  'Medium': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'High': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'Urgent': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
};

const renderAssignees = (assignedTo) => {
  const assignees = Array.isArray(assignedTo) ? assignedTo : (assignedTo ? [assignedTo] : []);
  if (assignees.length === 0) {
    return <span className="text-xs text-slate-500 dark:text-slate-500">Unassigned</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5 overflow-hidden">
        {assignees.slice(0, 3).map((u, i) => {
          const name = u.name || 'User';
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div 
              key={u._id || i} 
              className="inline-block h-6.5 w-6.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-white dark:border-[#090d1f] flex items-center justify-center text-[8px] font-bold text-white uppercase transition-transform hover:z-10 hover:scale-110 cursor-pointer"
              title={name}
            >
              {initials}
            </div>
          );
        })}
        {assignees.length > 3 && (
          <div className="inline-block h-6.5 w-6.5 rounded-full bg-slate-800 border border-white dark:border-[#090d1f] flex items-center justify-center text-[8px] font-bold text-slate-400">
            +{assignees.length - 3}
          </div>
        )}
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
        {assignees.length === 1 ? assignees[0].name : `${assignees.length} Assigned`}
      </span>
    </div>
  );
};

const BidTable = ({ 
  bids, 
  sortBy, 
  order, 
  handleSort, 
  handleRowClick, 
  handleEditClick, 
  handleDeleteClick 
}) => {
  const { hasPermission } = useAuth();
  return (
    <div className="space-y-6">
      {/* Desktop / Tablet View Table */}
      <Card className="hidden md:block overflow-hidden border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#090d1f]/40 p-0 rounded-2xl shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left relative">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th onClick={() => handleSort('title')} className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors">
                  <div className="flex items-center gap-1.5">
                    Project & Client <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('value')} className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors">
                  <div className="flex items-center gap-1.5">
                    Revenue <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </th>
                <th className="py-4 px-6 text-slate-500 dark:text-slate-400">Sales Stage</th>
                <th className="py-4 px-6 text-slate-500 dark:text-slate-400">Priority</th>
                <th className="py-4 px-6 text-slate-500 dark:text-slate-400">Assigned Team</th>
                <th onClick={() => handleSort('deadline')} className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors">
                  <div className="flex items-center gap-1.5">
                    Deadline <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </th>
                <th className="py-4 px-6 text-center text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-sm text-slate-700 dark:text-slate-300">
              {bids.map((bid, index) => (
                <motion.tr 
                  key={bid._id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  onClick={() => handleRowClick(bid)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {bid.title}
                    </div>
                    <div className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">{bid.clientName}</div>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-200">
                    ${bid.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[bid.status] || 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                      {bid.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_BADGES[bid.priority] || 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                      {bid.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {renderAssignees(bid.assignedTo)}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(bid.deadline).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => handleEditClick(e, bid)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:bg-blue-600/10 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/20 transition-all"
                        title="Edit Proposal"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {hasPermission('delete-bid') && (
                        <button
                          onClick={(e) => handleDeleteClick(e, bid._id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:bg-red-600/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/20 transition-all"
                          title="Delete Proposal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Card stack for mobile viewports */}
      <div className="grid grid-cols-1 gap-4 md:hidden animate-fade-in">
        {bids.map((bid, index) => (
          <motion.div
            key={bid._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            onClick={() => handleRowClick(bid)}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#090d1f]/40 p-5 shadow-sm space-y-4 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{bid.title}</h4>
                <span className="text-xs text-slate-500">{bid.clientName}</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-slate-200 shrink-0">
                ${bid.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGES[bid.status] || 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                {bid.status}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGES[bid.priority] || 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                {bid.priority}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                {renderAssignees(bid.assignedTo)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleEditClick(e, bid)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all"
                  title="Edit Proposal"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                {hasPermission('delete-bid') && (
                  <button
                    onClick={(e) => handleDeleteClick(e, bid._id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-all"
                    title="Delete Proposal"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BidTable;
