import React from 'react';
import { Languages, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-100">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Languages className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-900 to-indigo-700 bg-clip-text text-transparent">
                LinguaFlow
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              &ldquo;Break Language Barriers. Connect the World.&rdquo; LinguaFlow is a full-stack, responsive language translation web application built for college project demonstration with real Google Cloud Translation API integration.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#home" className="hover:text-indigo-600 transition-colors">
                  Home (Top)
                </a>
              </li>
              <li>
                <a href="#workspace" className="hover:text-indigo-600 transition-colors">
                  Translation Workspace
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Service & Security Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Service Notice &amp; Architecture
            </h4>
            <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Translations are securely processed through the configured Google Cloud Translation API v2 via an Express.js backend. User inputs are never permanently stored, and credentials remain protected on the server.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} LinguaFlow. Academic project implementation.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with React, TypeScript, Vite &amp; Node.js</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
