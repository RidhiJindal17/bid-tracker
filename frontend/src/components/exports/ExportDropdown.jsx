import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { toast } from 'react-hot-toast';

const ExportDropdown = ({ 
  data = [], 
  fileName = 'pipeline_report', 
  title = 'Executive Pipeline Audit', 
  subtitle = 'Detailed analysis of sales pipeline and bid valuations.',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState(null); // 'excel' | 'csv' | 'pdf' | null
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    if (!data || data.length === 0) {
      toast.error('No records available to export.');
      return;
    }

    setExportingType(type);
    setIsOpen(false);
    
    const toastId = toast.loading(`Generating ${type.toUpperCase()} report...`);

    // Add a slight delay to allow the loading spinner and toast to render
    setTimeout(() => {
      try {
        if (type === 'excel') {
          exportToExcel(data, fileName);
        } else if (type === 'csv') {
          exportToCSV(data, fileName);
        } else if (type === 'pdf') {
          exportToPDF(data, title, subtitle);
        }
      } catch (err) {
        console.error(`${type} generation error:`, err);
        toast.error(`An error occurred compiling the ${type} document.`);
      } finally {
        toast.dismiss(toastId);
        setExportingType(null);
      }
    }, 800);
  };

  const isExporting = exportingType !== null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Toggle Trigger */}
      <button
        onClick={() => !isExporting && setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#090d1f]/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-slate-700 hover:text-white focus:outline-none ${
          isExporting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        ) : (
          <Download className="h-4 w-4 text-blue-400" />
        )}
        <span>{isExporting ? `Exporting...` : 'Export Data'}</span>
        <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Glass Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 z-50 rounded-2xl border border-slate-800 bg-[#090d1f]/95 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose File Format</p>
            </div>

            {/* Excel (.xlsx) Option */}
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">Microsoft Excel</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Spreadsheet (.xlsx)</p>
              </div>
            </button>

            {/* CSV Option */}
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <FileCode className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">Comma Separated</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Standard raw data (.csv)</p>
              </div>
            </button>

            {/* PDF Report Option */}
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">PDF Document</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Branded audit report (.pdf)</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportDropdown;
