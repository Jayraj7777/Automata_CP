import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  PlayCircle, 
  Sparkles,
  Info,
  GitBranch,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function KeywordDetectorView({ 
  currentInput, 
  setCurrentInput, 
  onSimulateInGraph 
}) {
  const [tokenInput, setTokenInput] = useState(currentInput || 'class');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = {
    keywords: ['class', 'if', 'while', 'return', 'public', 'implements', 'static', 'try'],
    identifiers: ['ifx', 'className', 'integer', '_variable', '$value', 'count1', 'isTrue'],
    invalid: ['123start', '#tag', 'var-name', '@override', 'price%'],
    prefixPairs: [
      { name: "'if' vs 'implements'", token: 'implements' },
      { name: "'class' vs 'catch'", token: 'catch' },
      { name: "'for' vs 'float'", token: 'float' },
    ]
  };

  const handleDetect = async (inputStr) => {
    const word = inputStr !== undefined ? inputStr : tokenInput;
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.detectToken(word.trim());
      setResult(data);
      setCurrentInput(word.trim());
    } catch (err) {
      setError(err.message || 'Failed to connect to detection engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDetect(tokenInput);
  }, []);

  const handleSelectPreset = (p) => {
    setTokenInput(p);
    handleDetect(p);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Search className="h-6 w-6 text-emerald-400" />
          <span>Single-Token Keyword & Identifier Detector</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Evaluates any input character-by-character through the formal Keyword DFA and Identifier State Machine.
        </p>
      </div>

      {/* Input & Action Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleDetect(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter a token (e.g., class, ifx, while, 123test)..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20"
          >
            {loading ? <span>Analyzing...</span> : <span>Run DFA Verification</span>}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Preset Badges for Viva & Instant Testing */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Curated Test Cases for Demonstration:</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-slate-500">Keywords:</span>
            {presets.keywords.map((kw) => (
              <button
                key={kw}
                onClick={() => handleSelectPreset(kw)}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-800/50 transition-all"
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-slate-500">Identifiers:</span>
            {presets.identifiers.map((id) => (
              <button
                key={id}
                onClick={() => handleSelectPreset(id)}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-sky-950/60 border border-sky-800/60 text-sky-300 hover:bg-sky-800/50 transition-all"
              >
                {id}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-slate-500">Invalid:</span>
            {presets.invalid.map((inv) => (
              <button
                key={inv}
                onClick={() => handleSelectPreset(inv)}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-800/50 transition-all"
              >
                {inv}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-slate-500">Prefix Forks:</span>
            {presets.prefixPairs.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p.token)}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-800/50 transition-all"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Detection Results */}
      {result && (
        <div className="space-y-6">
          
          {/* Classification Banner */}
          <div className={`p-6 rounded-2xl border transition-all ${
            result.classification === 'KEYWORD'
              ? 'bg-emerald-950/20 border-emerald-700/60'
              : result.classification === 'VALID_IDENTIFIER'
              ? 'bg-sky-950/20 border-sky-700/60'
              : 'bg-rose-950/20 border-rose-700/60'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {result.classification === 'KEYWORD' && (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  )}
                  {result.classification === 'VALID_IDENTIFIER' && (
                    <CheckCircle2 className="h-8 w-8 text-sky-400" />
                  )}
                  {result.classification === 'INVALID_TOKEN' && (
                    <XCircle className="h-8 w-8 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Lexical Classification</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                      result.classification === 'KEYWORD'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : result.classification === 'VALID_IDENTIFIER'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {result.classification.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-white mt-1">
                    "{result.token}"
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Jump to Visual Graph Simulator */}
              <button
                onClick={() => onSimulateInGraph(result.token)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-sm transition-all whitespace-nowrap self-start sm:self-auto"
              >
                <PlayCircle className="h-4 w-4 text-emerald-400" />
                <span>Simulate on DFA Graph</span>
              </button>
            </div>
          </div>

          {/* Dual Engine Side-by-Side Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Keyword DFA Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-emerald-400" />
                  <span>Keyword DFA (M_kw)</span>
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  result.keyword_trace.is_keyword
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {result.keyword_trace.is_keyword ? 'Accepted in F' : 'Rejected'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Final State: <span className="text-emerald-400">{result.keyword_trace.final_state.label}</span></div>
                <div>Prefix Matched: <span className="text-amber-300">"{result.keyword_trace.final_state.prefix}"</span></div>
                <div>Accepting Status: <span className={result.keyword_trace.final_state.is_accepting ? 'text-emerald-400' : 'text-slate-500'}>
                  {result.keyword_trace.final_state.is_accepting ? 'True (In F)' : 'False (Not in F)'}
                </span></div>
              </div>
              <p className="text-xs text-slate-400">
                {result.keyword_trace.reason}
              </p>
            </div>

            {/* Identifier State Machine Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-sky-400" />
                  <span>Identifier DFA (M_id)</span>
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  result.identifier_trace.is_valid
                    ? 'bg-sky-950 text-sky-400 border border-sky-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {result.identifier_trace.is_valid ? 'Valid Identifier' : 'Rejected'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Final State: <span className="text-sky-400">{result.identifier_trace.final_state}</span></div>
                <div>Grammar Rule: <span className="text-amber-300">[A-Za-z_$][A-Za-z0-9_$]*</span></div>
                <div>Accepting Status: <span className={result.identifier_trace.is_valid ? 'text-sky-400' : 'text-rose-400'}>
                  {result.identifier_trace.is_valid ? 'Accepted at q1' : 'Halted in Trap State'}
                </span></div>
              </div>
              <p className="text-xs text-slate-400">
                {result.identifier_trace.reason}
              </p>
            </div>

          </div>

          {/* Character-by-Character DFA Step Trace Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                <Info className="h-5 w-5 text-emerald-400" />
                <span>Character-by-Character DFA Execution Trace</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Detailed step table showing transition δ(q_curr, char) → q_next for input <span className="font-mono text-emerald-300 font-semibold">"{result.token}"</span>.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Step #</th>
                    <th className="px-4 py-3">Input Char</th>
                    <th className="px-4 py-3">From State</th>
                    <th className="px-4 py-3">Transition δ</th>
                    <th className="px-4 py-3">To State</th>
                    <th className="px-4 py-3">Prefix Formed</th>
                    <th className="px-4 py-3">Accepting State?</th>
                    <th className="px-4 py-3">TOC Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/50">
                  {result.keyword_trace.steps.map((s) => (
                    <tr 
                      key={s.step}
                      className={s.is_dead ? 'bg-rose-950/20 text-rose-300' : 'hover:bg-slate-850'}
                    >
                      <td className="px-4 py-3 text-slate-400 font-bold">{s.step}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                          '{s.char}'
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {s.from_state.label}
                      </td>
                      <td className="px-4 py-3 text-purple-400">
                        δ({s.from_state.label}, '{s.char}')
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${
                          s.is_dead 
                            ? 'text-rose-400 font-semibold' 
                            : s.is_accepting 
                            ? 'text-emerald-400 font-semibold' 
                            : 'text-cyan-400'
                        }`}>
                          {s.to_state.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-300 font-semibold">
                        "{s.to_state.prefix}"
                      </td>
                      <td className="px-4 py-3">
                        {s.is_accepting ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>YES (F)</span>
                          </span>
                        ) : s.is_dead ? (
                          <span className="inline-flex items-center space-x-1 text-rose-400">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>DEAD</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">NO</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans text-xs">
                        {s.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
