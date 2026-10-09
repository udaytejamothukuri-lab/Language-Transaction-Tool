import React, { useState } from 'react';
import { Languages, Menu, X, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { BackendHealthResponse } from '../types/translation';

interface HeaderProps {
  backendHealth: BackendHealthResponse | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendHealth,
  healthLoading,
  onRefreshHealth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Status badge styling and text
  const getStatusBadge = () => {
    if (healthLoading) {
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
        text: 'Checking backend...',
      };
    }
    if (!backendHealth) {
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
        text: 'Backend Offline',
      };
    }
    if (backendHealth.googleTranslateApiKeyConfigured) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        text: 'API Ready',
      };
    }
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
      text: 'API Key Needed',
    };
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#home" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Languages className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-800 bg-clip-text text-transparent">
                    LinguaFlow
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal hidden sm:block">
                  Language Translation Tool
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            <a
              href="#home"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus:text-indigo-600"
            >
              Home
            </a>
            <a
              href="#workspace"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus:text-indigo-600"
            >
              Translate
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus:text-indigo-600"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus:text-indigo-600"
            >
              About
            </a>
          </nav>

          {/* Right Status Badge & Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={onRefreshHealth}
              title="Click to re-verify backend connectivity"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${status.bg} transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {status.icon}
              <span>{status.text}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 shadow-lg space-y-3 animate-in slide-in-from-top duration-150">
          <nav className="flex flex-col space-y-2">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Home
            </a>
            <a
              href="#workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Translate
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              How It Works
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              About
            </a>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Backend Status:</span>
            <button
              type="button"
              onClick={onRefreshHealth}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg}`}
            >
              {status.icon}
              <span>{status.text}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
