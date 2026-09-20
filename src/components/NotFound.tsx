import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] mb-6">
          <span className="text-2xl font-bold font-mono">404</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h1>
        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
          The page you are looking for might have been moved or does not exist. Explore Antonio Riyanto's work and creative production on the main portfolio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00f0ff] text-black font-bold text-sm hover:bg-[#00f0ff]/80 transition-colors shadow-lg"
          >
            <Home className="w-4 h-4" /> Return to Portfolio
          </a>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
