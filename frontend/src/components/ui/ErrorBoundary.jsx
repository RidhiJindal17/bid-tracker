import React, { Component } from 'react';
import Button from './Button';
import GlassCard from './GlassCard';
import { AlertOctagon, RotateCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[UI CRITICAL ERROR] React Error Boundary caught an exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6">
          <GlassCard className="max-w-md p-8 border border-red-500/20 text-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 -z-10" />
            <AlertOctagon className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Component Execution Failed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              An unexpected runtime error occurred while rendering this interface component. This has been intercepted to keep the core workspace stable.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 text-xs py-2 px-4 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reload Page
              </Button>
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="text-xs py-2 px-4 cursor-pointer"
              >
                Try Again
              </Button>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
