import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, User, AlertCircle, Tag, Plus, Search, Check } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../api/axios';
import { useBids } from '../../hooks/useBids';
import FileUpload from '../uploads/FileUpload';

const STATUS_OPTIONS = [
  'New Enquiry',
  'Under Review',
  'Quotation Sent',
  'Negotiation',
  'Approved',
  'Rejected',
  'Order Processing',
  'Completed',
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

const BidFormDrawer = ({ isOpen, onClose, onSuccess, editBidData = null }) => {
  const { createBid, updateBid, actionLoading } = useBids();
  
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    description: '',
    value: '',
    deadline: '',
    priority: 'Medium',
    status: 'New Enquiry',
    assignedTo: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Custom Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const toggleAssignee = (memberId) => {
    const current = formData.assignedTo || [];
    const isSelected = current.includes(memberId);
    const updated = isSelected 
      ? current.filter(id => id !== memberId) 
      : [...current, memberId];

    setFormData({ ...formData, assignedTo: updated });
    if (errors.assignedTo) {
      setErrors({ ...errors, assignedTo: null });
    }
  };

  // Fetch registered team members on mount
  useEffect(() => {
    if (isOpen) {
      const fetchTeam = async () => {
        try {
          const { data } = await api.get('/users');
          // Support both new /users array (data.data) and fallback /auth/users list
          setTeamMembers(data.data || data || []);
        } catch (err) {
          console.error('Failed to fetch team members:', err);
          setFetchError('Failed to load team members. Please reload.');
        }
      };
      fetchTeam();
    }
  }, [isOpen]);

  // Pre-fill form if editing
  useEffect(() => {
    if (isOpen && editBidData) {
      let initialAssignees = [];
      if (Array.isArray(editBidData.assignedTo)) {
        initialAssignees = editBidData.assignedTo.map(u => u._id || u);
      } else if (editBidData.assignedTo) {
        initialAssignees = [editBidData.assignedTo._id || editBidData.assignedTo];
      }

      setFormData({
        title: editBidData.title || '',
        clientName: editBidData.clientName || '',
        description: editBidData.description || '',
        value: editBidData.value || '',
        deadline: editBidData.deadline ? editBidData.deadline.split('T')[0] : '',
        priority: editBidData.priority || 'Medium',
        status: editBidData.status || 'New Enquiry',
        assignedTo: initialAssignees,
      });
      setTags(editBidData.tags || []);
      setAttachments(editBidData.attachments || []);
    } else if (isOpen) {
      // Clear form for new bid
      setFormData({
        title: '',
        clientName: '',
        description: '',
        value: '',
        deadline: '',
        priority: 'Medium',
        status: 'New Enquiry',
        assignedTo: [],
      });
      setTags([]);
      setAttachments([]);
    }
    setErrors({});
  }, [isOpen, editBidData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.value || Number(formData.value) < 0) newErrors.value = 'Valid value is required';
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline date is required';
    } else {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (formData.deadline < todayStr) {
        newErrors.deadline = 'Deadline cannot be a past date';
      }
    }
    
    if (!formData.assignedTo || formData.assignedTo.length === 0) {
      newErrors.assignedTo = 'Please assign at least one team member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editBidData) {
        // Edit mode
        await updateBid(editBidData._id, {
          ...formData,
          value: Number(formData.value),
          tags,
          attachments,
        });
      } else {
        // Create mode
        await createBid({
          ...formData,
          value: Number(formData.value),
          tags,
          attachments,
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Bid form submission error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-slate-800 bg-[#090d1f]/95 p-6 shadow-2xl backdrop-blur-xl md:p-8 flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editBidData ? 'Edit Bid Proposal' : 'Create New Bid'}
                </h2>
                <p className="text-xs text-slate-400">
                  {editBidData ? 'Update structural parameters of the proposal.' : 'Launch a new proposal in the sales pipeline.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Container */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2">
              {fetchError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Bid Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Hospital Wing Expansion"
                  className={`w-full rounded-xl border ${errors.title ? 'border-red-500' : 'border-slate-800'} bg-slate-900/40 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10`}
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              {/* Client & Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="e.g. Metro Health Systems"
                    className={`w-full rounded-xl border ${errors.clientName ? 'border-red-500' : 'border-slate-800'} bg-slate-900/40 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10`}
                  />
                  {errors.clientName && <p className="text-xs text-red-400 mt-1">{errors.clientName}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Estimated Value ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="e.g. 250000"
                      className={`w-full rounded-xl border ${errors.value ? 'border-red-500' : 'border-slate-800'} bg-slate-900/40 py-2.5 pl-9 pr-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10`}
                    />
                  </div>
                  {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Proposal Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Outline the scopes of work, parameters, and AI-enabled insights needed..."
                  className={`w-full rounded-xl border ${errors.description ? 'border-red-500' : 'border-slate-800'} bg-slate-900/40 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none`}
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              {/* Deadline & Team Assignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Deadline Date</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                      className={`w-full rounded-xl border ${errors.deadline ? 'border-red-500' : 'border-slate-800'} bg-slate-900/40 py-2.5 pl-9 pr-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 [color-scheme:dark]`}
                    />
                  </div>
                  {errors.deadline && <p className="text-xs text-red-400 mt-1">{errors.deadline}</p>}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Assigned Team Members</label>
                  
                  {/* Dropdown Toggle Button */}
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full rounded-xl border ${errors.assignedTo ? 'border-red-500' : 'border-slate-800'} bg-slate-900/40 py-2 px-3 text-slate-200 outline-none transition-all cursor-pointer hover:border-slate-700 min-h-[42px] flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="h-4 w-4 text-slate-500 shrink-0" />
                      {formData.assignedTo.length === 0 ? (
                        <span className="text-slate-500 text-sm">Select Team Members</span>
                      ) : (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {teamMembers
                            .filter(m => formData.assignedTo.includes(m._id))
                            .slice(0, 4)
                            .map((member) => (
                              <div 
                                key={member._id}
                                className="h-6 w-6 rounded-full bg-blue-500 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                                title={member.name}
                              >
                                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            ))}
                          {formData.assignedTo.length > 4 && (
                            <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-400">
                              +{formData.assignedTo.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                      {formData.assignedTo.length} Selected
                    </span>
                  </div>

                  {errors.assignedTo && <p className="text-xs text-red-400 mt-1">{errors.assignedTo}</p>}

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-1.5 z-30 bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-xl space-y-3"
                      >
                        {/* Dropdown search bar */}
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="Search team members..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg text-white outline-none"
                          />
                        </div>

                        {/* Dropdown list */}
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                          {teamMembers
                            .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                            .map((member) => {
                              const isChecked = formData.assignedTo.includes(member._id);
                              return (
                                <div 
                                  key={member._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAssignee(member._id);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-blue-600/10 hover:bg-blue-600/15' : 'hover:bg-slate-800/55'}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-[10px] uppercase">
                                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-white">{member.name}</div>
                                      <div className="text-[10px] text-slate-500">{member.role} • {member.department}</div>
                                    </div>
                                  </div>
                                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-500' : 'border-slate-800 bg-slate-950'}`}>
                                    {isChecked && <Check size={10} className="text-white font-bold" />}
                                  </div>
                                </div>
                              );
                            })}
                          {teamMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 && (
                            <div className="text-[11px] text-slate-500 text-center py-2">No members found.</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Sales Stage (Status)</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Priority Level</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attachment File Upload Area */}
              <FileUpload
                attachments={attachments}
                onChange={setAttachments}
                label="Bid Attachments"
              />

              {/* Tags Input */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Categorization Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. Infrastructure"
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-4 text-slate-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" className="shrink-0 rounded-xl px-4">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                {/* Rendered Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-[#090d1f]/95 py-4 z-10">
                <Button type="button" variant="outline" onClick={onClose} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={actionLoading}
                  className="bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all font-semibold"
                >
                  {editBidData ? 'Save Changes' : 'Create Bid Proposal'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BidFormDrawer;
