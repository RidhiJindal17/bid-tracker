import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import { useBids } from '../../hooks/useBids';
import { toast } from 'react-hot-toast';
import { Calendar, DollarSign, User, AlertCircle, Tag, GitBranch, ArrowRight } from 'lucide-react';

const COLUMNS = [
  'New Enquiry',
  'Under Review',
  'Quotation Sent',
  'Negotiation',
  'Approved',
  'Rejected',
  'Order Processing',
  'Completed',
];

const COLUMN_COLORS = {
  'New Enquiry': 'border-t-sky-500 bg-sky-500/5',
  'Under Review': 'border-t-amber-500 bg-amber-500/5',
  'Quotation Sent': 'border-t-violet-500 bg-violet-500/5',
  'Negotiation': 'border-t-indigo-500 bg-indigo-500/5',
  'Approved': 'border-t-emerald-500 bg-emerald-500/5',
  'Rejected': 'border-t-rose-500 bg-rose-500/5',
  'Order Processing': 'border-t-blue-500 bg-blue-500/5',
  'Completed': 'border-t-teal-500 bg-teal-500/5',
};

const PRIORITY_GLOWS = {
  'Low': 'border-l-2 border-l-slate-600',
  'Medium': 'border-l-2 border-l-blue-500 shadow-[inset_3px_0_10px_rgba(59,130,246,0.05)]',
  'High': 'border-l-2 border-l-amber-500 shadow-[inset_3px_0_10px_rgba(245,158,11,0.05)]',
  'Urgent': 'border-l-2 border-l-red-500 shadow-[inset_3px_0_15px_rgba(239,68,68,0.1)]',
};

const Workflow = () => {
  const { bids, loading, fetchBids, updateBid } = useBids();
  
  // Board columns data
  const [boardData, setBoardData] = useState({});
  const [dndReady, setDndReady] = useState(false);

  // Defer mounting DND to avoid StrictMode double-rendering crash in React 18/19
  useEffect(() => {
    const animation = requestAnimationFrame(() => setDndReady(true));
    return () => {
      cancelAnimationFrame(animation);
      setDndReady(false);
    };
  }, []);

  // Fetch all bids on load (high limit for full board coverage)
  const loadBoardData = useCallback(() => {
    fetchBids({ limit: 100 });
  }, [fetchBids]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Sync board columns with loaded bids
  useEffect(() => {
    const columns = {};
    COLUMNS.forEach((col) => {
      columns[col] = [];
    });

    bids.forEach((bid) => {
      if (columns[bid.status]) {
        columns[bid.status].push(bid);
      }
    });

    setBoardData(columns);
  }, [bids]);

  /**
   * Drag End event wrapper with full Optimistic UI Updates
   */
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // 1. Exit if dropped outside columns
    if (!destination) return;

    // 2. Exit if dropped in the identical position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // 3. Clone board state to prepare optimistic updates
    const prevBoardData = JSON.parse(JSON.stringify(boardData));
    const newBoardData = JSON.parse(JSON.stringify(boardData));

    // Remove from source list
    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    const [draggedCard] = newBoardData[sourceCol].splice(source.index, 1);

    // Update status locally
    draggedCard.status = destCol;

    // Insert into destination list
    newBoardData[destCol].splice(destination.index, 0, draggedCard);

    // Set optimistic board state instantly
    setBoardData(newBoardData);

    try {
      // Trigger background server sync
      await updateBid(draggableId, { status: destCol });
    } catch (err) {
      // Revert state if sync request failed
      console.error('Failed to sync workflow card to backend:', err);
      setBoardData(prevBoardData);
      toast.error('Workflow update failed. Reverting board state.');
    }
  };

  if (!dndReady) return null;

  return (
    <PageTransition className="space-y-8 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitBranch className="h-7 w-7 text-blue-500 animate-pulse" /> Enterprise Kanban Workflow
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Drag and drop bid proposals to advance sales stages. Status changes sync dynamically in the background.
        </p>
      </div>

      {loading && Object.keys(boardData).length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-400 text-xs font-semibold mt-4 tracking-wider uppercase">Initializing Workflow Board...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Scrollable Column Container */}
          <div className="flex-1 overflow-x-auto pb-6 pr-2">
            <div className="flex gap-4 min-w-[1600px] h-[calc(100vh-250px)]">
              {COLUMNS.map((colName) => {
                const columnCards = boardData[colName] || [];

                return (
                  <div
                    key={colName}
                    className="w-80 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#060919]/60 backdrop-blur-xl h-full shadow-md dark:shadow-lg overflow-hidden transition-all duration-300"
                  >
                    {/* Column Header */}
                    <div className={`p-4 border-t-2 ${COLUMN_COLORS[colName]} flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80`}>
                      <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{colName}</span>
                      <span className="rounded-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-350 dark:border-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-650 dark:text-slate-400">
                        {columnCards.length}
                      </span>
                    </div>

                    {/* Droppable Card Area */}
                    <Droppable droppableId={colName}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-500/5 dark:bg-blue-500/5' : 'bg-transparent'
                          }`}
                        >
                          {columnCards.map((bid, index) => (
                            <Draggable key={bid._id} draggableId={bid._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                  className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d1f]/80 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700/80 cursor-grab active:cursor-grabbing group ${
                                    PRIORITY_GLOWS[bid.priority] || 'border-l-2 border-l-slate-200 dark:border-l-slate-800'
                                  } ${snapshot.isDragging ? 'shadow-2xl shadow-blue-500/10 border-blue-500/30 rotate-1 scale-[1.02] bg-slate-50/95 dark:bg-[#0c122b]' : 'shadow-sm dark:shadow-md'}`}
                                >
                                  {/* Card Header (Title & Client) */}
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                                      {bid.clientName}
                                    </h4>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">
                                      {bid.title}
                                    </h3>
                                  </div>

                                  {/* Tags */}
                                  {bid.tags && bid.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                      {bid.tags.slice(0, 2).map((tag) => (
                                        <span
                                          key={tag}
                                          className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 px-2 py-0.5 text-[9px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide"
                                        >
                                          <Tag className="h-2 w-2" /> {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Card Footer Divider */}
                                  <div className="border-t border-slate-200 dark:border-slate-800/60 my-3.5" />

                                  {/* Info Fields */}
                                  <div className="flex items-center justify-between">
                                    {/* Valuation */}
                                    <div className="flex items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                                      <DollarSign className="h-3.5 w-3.5 text-slate-500 -mr-0.5" />
                                      {bid.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                    </div>

                                    {/* Assignee Avatar */}
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5 w-5 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase" title={bid.assignedTo?.name}>
                                        {bid.assignedTo?.name?.charAt(0) || 'U'}
                                      </div>
                                      <span className="text-[10px] text-slate-500 font-semibold max-w-[80px] truncate" title={bid.assignedTo?.name}>
                                        {bid.assignedTo?.name || 'Unassigned'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Deadline */}
                                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 dark:text-slate-505 font-medium">
                                    <Calendar className="h-3 w-3" />
                                    <span>Due {new Date(bid.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      )}
    </PageTransition>
  );
};

export default Workflow;
