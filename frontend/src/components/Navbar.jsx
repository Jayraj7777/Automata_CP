import React from 'react';
import { 
  Network, 
  Search, 
  PlayCircle, 
  Code2, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Network, desc: '5-Tuple & Architecture' },
    { id: 'detector', label: 'Keyword Detector', icon: Search, desc: 'Single Token DFA Check' },
    { id: 'simulator', label: 'DFA Simulator', icon: PlayCircle, desc: 'Interactive Graph Traversal' },
    { id: 'analyzer', label: 'Code Analyzer', icon: Code2, desc: 'Multi-Token Java Lexer' },
    { id: 'viva', label: 'About DFA & Viva', icon: GraduationCap, desc: 'TOC Concepts & Viva Guide' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 text-base tracking-tight">
                  Keyword Detector
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  DFA Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Theory of Computation & Compiler Lexical Analysis
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title={item.desc}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Health Status Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800">
              {backendStatus === 'online' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-slate-300">Backend: <span className="text-emerald-400 font-semibold">Online</span></span>
                </>
              )}
              {backendStatus === 'checking' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                  <span className="text-amber-300">Connecting...</span>
                </>
              )}
              {backendStatus === 'offline' && (
                <>
                  <AlertCircle className="h-3 w-3 text-rose-400" />
                  <span className="text-rose-400 font-semibold">Offline</span>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto space-x-1 py-2 border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
