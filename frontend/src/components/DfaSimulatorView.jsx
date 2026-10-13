import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Eye, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import DfaGraph from './DfaGraph';

export default function DfaSimulatorView({ currentInput, setCurrentInput }) {
  const [inputToken, setInputToken] = useState(currentInput || 'class');
  const [subgraphData, setSubgraphData] = useState(null);
  const [fullGraphData, setFullGraphData] = useState(null);
  const [viewMode, setViewMode] = useState('focused'); // 'focused' or 'full'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulation playback state
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0 = start state before processing
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step
  const timerRef = useRef(null);

  // Presets for quick evaluation
  const demoTokens = ['class', 'if', 'while', 'ifx', 'implements', 'catch', 'float', 'return', '123x'];

  const fetchSimulation = async (tokenToSim) => {
    const word = tokenToSim !== undefined ? tokenToSim : inputToken;
    if (!word) return;

    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    try {
      const data = await api.simulateToken(word);
      setSubgraphData(data);
      setCurrentInput(word);
    } catch (err) {
      setError(err.message || 'Failed to simulate DFA traversal.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullGraphIfNeeded = async () => {
    if (fullGraphData) return;
    try {
      const data = await api.getFullGraph();
      setFullGraphData(data);
    } catch (err) {
      console.error('Failed to load full DFA graph:', err);
    }
  };

  useEffect(() => {
    fetchSimulation(inputToken);
  }, []);

  useEffect(() => {
    if (viewMode === 'full') {
      fetchFullGraphIfNeeded();
    }
  }, [viewMode]);

  // Steps array from backend trace
  const steps = subgraphData?.trace?.steps || [];
  const totalSteps = steps.length;

  // Determine current active state & active transition
  const getActiveSimulationContext = () => {
    if (!subgraphData) {
      return { activeStateId: 0, activeTransition: null, visitedStateIds: [0], currentStep: null };
    }

    if (currentStepIndex === 0) {
      return {
        activeStateId: subgraphData.start_state_id || 0,
        activeTransition: null,
        visitedStateIds: [subgraphData.start_state_id || 0],
        currentStep: null
      };
    }

    const stepObj = steps[currentStepIndex - 1];
    const visitedIds = [subgraphData.start_state_id || 0];
    for (let i = 0; i < currentStepIndex; i++) {
      if (steps[i]) visitedIds.push(steps[i].to_state.id);
    }

    return {
      activeStateId: stepObj.to_state.id,
      activeTransition: {
        from: stepObj.from_state.id,
        to: stepObj.to_state.id,
        char: stepObj.char
      },
      visitedStateIds: visitedIds,
      currentStep: stepObj
    };
  };

  const { activeStateId, activeTransition, visitedStateIds, currentStep } = getActiveSimulationContext();

  // Playback timer handling
  useEffect(() => {
    if (isPlaying) {
      if (currentStepIndex >= totalSteps) {
        setIsPlaying(false);
        return;
      }
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => {
          if (prev < totalSteps) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, playbackSpeed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed]);

  const handleStepNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleTogglePlay = () => {
    if (currentStepIndex >= totalSteps) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const activeGraph = viewMode === 'focused' ? subgraphData : (fullGraphData || subgraphData);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="h-6 w-6 text-emerald-400" />
            <span>Interactive DFA Traversal Simulator</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Observe the deterministic state machine navigate character-by-character along its state transition branches.
          </p>
        </div>

        {/* Graph Mode Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('focused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'focused'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focused Subgraph & Forks
          </button>
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'full'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Keyword DFA (153 States)
          </button>
        </div>
      </div>

      {/* Input bar & Presets */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchSimulation(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Type word to simulate (e.g. class, if, implements, catch)..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputToken.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20"
          >
            <span>Load Into DFA</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-500">Quick Test:</span>
          {demoTokens.map((tok) => (
            <button
              key={tok}
              onClick={() => { setInputToken(tok); fetchSimulation(tok); }}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                inputToken === tok
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {tok}
            </button>
          ))}
        </div>
      </div>

      {/* Traversal Controls & Current Step Indicator */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Step Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Reset to Start State (q0)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleStepPrev}
              disabled={currentStepIndex === 0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition-all"
              title="Previous Step"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleTogglePlay}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>{currentStepIndex >= totalSteps ? 'Replay' : 'Play'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleStepNext}
              disabled={currentStepIndex >= totalSteps}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition-all"
              title="Next Step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Playback speed selector */}
            <div className="hidden sm:flex items-center space-x-1 pl-3 text-xs font-mono text-slate-400">
              <span className="text-slate-500">Speed:</span>
              {[500, 1000, 1800].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded text-xs ${
                    playbackSpeed === spd
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd === 500 ? 'Fast' : spd === 1000 ? 'Normal' : 'Slow'}
                </button>
              ))}
            </div>
          </div>

          {/* Token String Character Flow Bar */}
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 overflow-x-auto">
            <span className="text-xs font-mono text-slate-500 mr-2">Stream:</span>
            {inputToken.split('').map((ch, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex - 1;
              return (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded font-mono text-sm font-bold border transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 scale-110 shadow-md shadow-cyan-500/30'
                      : isPast
                      ? 'bg-slate-800 text-emerald-300 border-slate-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {ch}
                </span>
              );
            })}
          </div>

        </div>

        {/* Current State & Step Explanatory Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <div className="px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
              Step <span className="text-white font-bold">{currentStepIndex}</span> of <span className="text-slate-400">{totalSteps}</span>
            </div>
            <div className="text-slate-300">
              Active State: <span className="text-cyan-400 font-bold">
                {currentStep ? currentStep.to_state.label : (subgraphData?.start_state_id === 0 ? 'q0' : 'q0')}
              </span>
            </div>
            {currentStep && (
              <div className="text-purple-400 hidden sm:block">
                δ({currentStep.from_state.label}, '{currentStep.char}') → {currentStep.to_state.label}
              </div>
            )}
          </div>

          {currentStep && (
            <div className="text-slate-300 font-sans text-xs sm:text-right">
              {currentStep.explanation}
            </div>
          )}
          {!currentStep && (
            <div className="text-slate-400 font-sans text-xs">
              Automaton initialized at Start State q0. Click "Next" or "Play" to begin token scanning.
            </div>
          )}
        </div>
      </div>

      {/* The Visual Graph */}
      <DfaGraph
        graphData={activeGraph}
        activeStateId={activeStateId}
        activeTransition={activeTransition}
        visitedStateIds={visitedStateIds}
      />

      {/* Final Outcome Card when Traversal Reaches End */}
      {currentStepIndex === totalSteps && subgraphData?.trace && (
        <div className={`p-5 rounded-2xl border transition-all ${
          subgraphData.trace.is_keyword
            ? 'bg-emerald-950/30 border-emerald-700/60'
            : 'bg-rose-950/30 border-rose-700/60'
        }`}>
          <div className="flex items-center space-x-3">
            {subgraphData.trace.is_keyword ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {subgraphData.trace.is_keyword
                  ? `Automaton Accepted: "${inputToken}" is a Valid Java Keyword`
                  : `Automaton Rejected: "${inputToken}" is NOT a Java Keyword`}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {subgraphData.trace.reason}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
