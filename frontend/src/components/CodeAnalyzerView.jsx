import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  ArrowRight,
  Info,
  Terminal,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function CodeAnalyzerView({ onInspectTokenInDfa }) {
  const [code, setCode] = useState('');
  const [samples, setSamples] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedTokenTrace, setSelectedTokenTrace] = useState(null);

  // Load samples on mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const data = await api.getSamples();
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
          // Default to edge cases sample to show prefix and masking capabilities!
          setCode(data.samples[2].code);
          runAnalysis(data.samples[2].code);
        }
      } catch (err) {
        console.error('Failed to load sample snippets:', err);
      }
    }
    loadSamples();
  }, []);

  const runAnalysis = async (codeToAnalyze) => {
    const src = codeToAnalyze !== undefined ? codeToAnalyze : code;
    if (!src.trim()) return;

    setLoading(true);
    try {
      const res = await api.analyzeCode(src);
      setAnalysisResult(res);
    } catch (err) {
      console.error('Lexical analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setCode(sample.code);
    runAnalysis(sample.code);
  };

  const tokens = analysisResult?.tokens || [];
  const counts = analysisResult?.counts || {};
  const errors = analysisResult?.errors || [];

  const filteredTokens = tokens.filter(t => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'KEYWORD') return t.type === 'KEYWORD';
    if (selectedFilter === 'IDENTIFIER') return t.type === 'IDENTIFIER';
    if (selectedFilter === 'LITERALS') return t.type === 'STRING_LITERAL' || t.type === 'NUMBER_LITERAL' || t.type === 'CHAR_LITERAL';
    if (selectedFilter === 'OPERATORS') return t.type === 'OPERATOR' || t.type === 'PUNCTUATION';
    if (selectedFilter === 'COMMENTS') return t.type === 'COMMENT';
    return true;
  });

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'KEYWORD':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60 font-bold';
      case 'IDENTIFIER':
        return 'bg-sky-950 text-sky-300 border-sky-700/60 font-semibold';
      case 'NUMBER_LITERAL':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'STRING_LITERAL':
      case 'CHAR_LITERAL':
        return 'bg-teal-950 text-teal-300 border-teal-700/60';
      case 'OPERATOR':
        return 'bg-purple-950 text-purple-300 border-purple-700/60';
      case 'PUNCTUATION':
        return 'bg-slate-900 text-slate-400 border-slate-700/60';
      case 'COMMENT':
        return 'bg-zinc-900 text-zinc-400 border-zinc-700/60 italic';
      default:
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-emerald-400" />
          <span>Multi-Token Lexical Analyzer (Lexer)</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Scans Java source snippets, recognizes tokens, handles strings/comments, and verifies every keyword via the DFA engine.
        </p>
      </div>

      {/* Editor & Samples Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Code Editor Column */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
              <FileCode className="h-4 w-4 text-emerald-400" />
              <span>Java Source Input</span>
            </span>

            {/* Sample Snippet Loaders */}
            <div className="flex flex-wrap gap-1.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className="px-2.5 py-1 text-xs rounded-lg font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  title={s.title}
                >
                  {s.id === 'edge_cases' ? 'Edge Cases & Masking' : s.id === 'factorial' ? 'Factorial' : 'Binary Search'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              spellCheck="false"
              className="w-full p-4 font-mono text-xs sm:text-sm text-slate-200 bg-slate-950 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/30 selection:text-emerald-200"
              placeholder="Paste Java code snippet here..."
            />
          </div>

          <button
            onClick={() => runAnalysis()}
            disabled={loading || !code.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20"
          >
            <Play className="h-4 w-4" />
            <span>{loading ? 'Tokenizing...' : 'Tokenize & Run DFA Analysis'}</span>
          </button>
        </div>

        {/* Real-time Lexical Metrics Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Lexical Metrics & Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-500 font-mono">Total Tokens</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {analysisResult?.total_tokens || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <div className="text-xs text-emerald-400 font-mono">Keywords (DFA)</div>
                <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                  {counts.KEYWORD || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40">
                <div className="text-xs text-sky-400 font-mono">Identifiers</div>
                <div className="text-xl font-bold font-mono text-sky-300 mt-0.5">
                  {counts.IDENTIFIER || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
                <div className="text-xs text-amber-400 font-mono">Literals (Num/Str)</div>
                <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                  {(counts.NUMBER_LITERAL || 0) + (counts.STRING_LITERAL || 0) + (counts.CHAR_LITERAL || 0)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
                <div className="text-xs text-purple-400 font-mono">Operators/Symbols</div>
                <div className="text-xl font-bold font-mono text-purple-300 mt-0.5">
                  {(counts.OPERATOR || 0) + (counts.PUNCTUATION || 0)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-xs text-zinc-400 font-mono">Comments</div>
                <div className="text-xl font-bold font-mono text-zinc-300 mt-0.5">
                  {counts.COMMENT || 0}
                </div>
              </div>
            </div>

            {/* Educational Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <Info className="h-3.5 w-3.5 text-emerald-400" />
                <span>Compiler Lexer Principle:</span>
              </div>
              <p>
                Keywords inside comments (e.g. <span className="font-mono text-zinc-300">// while for</span>) and strings (e.g. <span className="font-mono text-teal-300">"public static"</span>) are masked and not converted to keyword tokens.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Structured Token Stream Table */}
      {analysisResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Filter className="h-5 w-5 text-emerald-400" />
                <span>Token Stream ({filteredTokens.length} of {tokens.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Click any keyword or identifier to inspect the DFA state transitions that verified it.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'KEYWORD', label: 'Keywords Only' },
                { id: 'IDENTIFIER', label: 'Identifiers' },
                { id: 'LITERALS', label: 'Literals' },
                { id: 'OPERATORS', label: 'Operators' },
                { id: 'COMMENTS', label: 'Comments' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedFilter === f.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Line : Col</th>
                  <th className="px-4 py-3">Token Type</th>
                  <th className="px-4 py-3">Lexeme</th>
                  <th className="px-4 py-3">DFA Verification</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {filteredTokens.map((tok, idx) => (
                  <tr key={idx} className="hover:bg-slate-850 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-2.5 text-slate-400">
                      L{tok.line}:C{tok.column}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs border ${getTypeBadgeStyle(tok.type)}`}>
                        {tok.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-bold text-white max-w-xs truncate inline-block">
                        {tok.lexeme}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">
                      {tok.type === 'KEYWORD' && (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Keyword DFA Accepted in F</span>
                        </span>
                      )}
                      {tok.type === 'IDENTIFIER' && (
                        <span className="text-sky-400 flex items-center space-x-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Identifier DFA Accepted at q1</span>
                        </span>
                      )}
                      {tok.type === 'COMMENT' && (
                        <span className="text-zinc-500 italic">Ignored by Lexer</span>
                      )}
                      {tok.type === 'STRING_LITERAL' && (
                        <span className="text-teal-400">Literal String Token</span>
                      )}
                      {tok.type === 'NUMBER_LITERAL' && (
                        <span className="text-amber-400">Numeric Constant</span>
                      )}
                      {(tok.type === 'OPERATOR' || tok.type === 'PUNCTUATION') && (
                        <span className="text-slate-500">Grammar Delimiter</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {tok.dfa_trace ? (
                        <button
                          onClick={() => setSelectedTokenTrace(tok)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center space-x-1"
                        >
                          <span>Trace</span>
                          <ArrowRight className="h-3 w-3 text-emerald-400" />
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Modal / Drawer for Token Trace Inspection */}
      {selectedTokenTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold">
                  {selectedTokenTrace.type}
                </span>
                <h3 className="text-xl font-bold font-mono text-white mt-0.5">
                  Trace for Lexeme "{selectedTokenTrace.lexeme}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedTokenTrace(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <div>Line {selectedTokenTrace.line}, Column {selectedTokenTrace.column}</div>
              {selectedTokenTrace.dfa_trace?.reason && (
                <div className="text-emerald-300">{selectedTokenTrace.dfa_trace.reason}</div>
              )}
            </div>

            <div className="overflow-y-auto max-h-60 rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Step</th>
                    <th className="px-3 py-2">Char</th>
                    <th className="px-3 py-2">From</th>
                    <th className="px-3 py-2">To</th>
                    <th className="px-3 py-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {(selectedTokenTrace.dfa_trace?.steps || []).map((s) => (
                    <tr key={s.step}>
                      <td className="px-3 py-2 text-slate-500">{s.step}</td>
                      <td className="px-3 py-2 text-amber-300 font-bold">'{s.char}'</td>
                      <td className="px-3 py-2 text-slate-300">
                        {typeof s.from_state === 'object' ? s.from_state.label : s.from_state}
                      </td>
                      <td className="px-3 py-2 text-cyan-400 font-bold">
                        {typeof s.to_state === 'object' ? s.to_state.label : s.to_state}
                      </td>
                      <td className="px-3 py-2 text-slate-300 font-sans text-xs">
                        {s.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  const tok = selectedTokenTrace.lexeme;
                  setSelectedTokenTrace(null);
                  onInspectTokenInDfa(tok);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2"
              >
                <span>Open in Visual DFA Simulator</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setSelectedTokenTrace(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
