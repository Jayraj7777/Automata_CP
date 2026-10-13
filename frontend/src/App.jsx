import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewView from './components/OverviewView';
import KeywordDetectorView from './components/KeywordDetectorView';
import DfaSimulatorView from './components/DfaSimulatorView';
import CodeAnalyzerView from './components/CodeAnalyzerView';
import VivaPrepView from './components/VivaPrepView';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [formalData, setFormalData] = useState(null);
  const [keywordsData, setKeywordsData] = useState(null);
  const [currentInput, setCurrentInput] = useState('class');

  // Verify backend connectivity and preload formal specifications
  const initApp = async () => {
    setBackendStatus('checking');
    try {
      await api.checkHealth();
      setBackendStatus('online');

      // Fetch formal definitions & keywords
      const [fData, kwData] = await Promise.all([
        api.getFormalDFA().catch(() => null),
        api.getKeywords().catch(() => null)
      ]);
      if (fData) setFormalData(fData);
      if (kwData) setKeywordsData(kwData);
    } catch (err) {
      console.warn('Backend currently offline or unreachable:', err);
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleSelectTokenForSim = (token) => {
    setCurrentInput(token);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus} 
      />

      {/* Backend Offline Warning Banner if Flask is down */}
      {backendStatus === 'offline' && (
        <div className="bg-amber-950/70 border-b border-amber-800/80 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm text-amber-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>
                Backend server is not running at <span className="font-mono font-bold">http://localhost:5000</span>. Run <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-100 font-mono">python app.py</code> in the <code className="font-mono">backend</code> folder.
              </span>
            </div>
            <button
              onClick={initApp}
              className="ml-4 px-2.5 py-1 rounded-md bg-amber-800 hover:bg-amber-700 text-amber-100 font-medium text-xs flex items-center space-x-1 flex-shrink-0"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewView 
            formalData={formalData} 
            keywordsData={keywordsData} 
            setActiveTab={setActiveTab}
            onSelectTokenForSim={handleSelectTokenForSim}
          />
        )}

        {activeTab === 'detector' && (
          <KeywordDetectorView 
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            onSimulateInGraph={handleSelectTokenForSim}
          />
        )}

        {activeTab === 'simulator' && (
          <DfaSimulatorView 
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
          />
        )}

        {activeTab === 'analyzer' && (
          <CodeAnalyzerView 
            onInspectTokenInDfa={handleSelectTokenForSim}
          />
        )}

        {activeTab === 'viva' && (
          <VivaPrepView 
            formalData={formalData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Programming Language Keyword Detector Using DFA • Theory of Computation Project
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>DFA: M = (Q, Σ, δ, q₀, F)</span>
            <span>•</span>
            <span>Subset of 37 Java Keywords</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">TOC & Compiler Design</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
