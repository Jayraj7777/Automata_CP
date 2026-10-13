import React, { useState } from 'react';
import { 
  Network, 
  Binary, 
  ArrowRight, 
  CheckCircle, 
  Layers, 
  Zap, 
  Cpu, 
  FileCode2, 
  ShieldAlert,
  GitFork
} from 'lucide-react';

export default function OverviewView({ formalData, keywordsData, setActiveTab, onSelectTokenForSim }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const kwDfa = formalData?.keyword_dfa || {
    state_count: 153,
    alphabet_size: 26,
    total_keywords: 37,
    accepting_states_count: 37,
    start_state: 'q0',
    trap_state: 'q_dead',
    total_explicit_transitions: 152
  };

  const categories = keywordsData?.categories || {
    control_flow: ["if", "else", "while", "for", "do", "switch", "case", "break", "continue", "return"],
    access_modifiers: ["public", "private", "static", "final", "abstract"],
    data_types: ["int", "float", "double", "char", "boolean", "void"],
    oop_declarations: ["class", "interface", "extends", "implements", "package", "import", "new", "this"],
    exception_handling: ["try", "catch", "finally", "throw", "throws"],
    literals_constants: ["true", "false", "null"]
  };

  const allKeywords = keywordsData?.keywords || [];

  const filteredKeywords = selectedCategory === 'all' 
    ? allKeywords 
    : (categories[selectedCategory] || []);

  const categoryLabels = {
    all: 'All Keywords (37)',
    control_flow: 'Control Flow (10)',
    access_modifiers: 'Access Modifiers (5)',
    data_types: 'Data Types (6)',
    oop_declarations: 'OOP & Modules (8)',
    exception_handling: 'Exceptions (5)',
    literals_constants: 'Literals (3)'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
            <Cpu className="h-3.5 w-3.5" />
            <span>Theory of Computation • College Capstone & Viva Project</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Programming Language Keyword Detector Using DFA
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            A mathematically rigorous Deterministic Finite Automaton (DFA) engineered to model 
            the lexical analysis phase of a Java compiler. Unlike superficial set lookups, 
            this system constructs a formal trie-based state transition graph <span className="font-mono text-emerald-300">M = (Q, Σ, δ, q₀, F)</span> 
            with trap-state isolation, character-by-character trace verification, and identifier disambiguation.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('simulator')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Zap className="h-4 w-4" />
              <span>Launch DFA Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('detector')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
            >
              <span>Single Token Test</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab('analyzer')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
            >
              <FileCode2 className="h-4 w-4" />
              <span>Run Code Lexer</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:flex items-center justify-center">
          <Network className="w-96 h-96 text-emerald-400" />
        </div>
      </div>

      {/* Formal 5-Tuple Specification Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Binary className="h-5 w-5 text-emerald-400" />
              <span>Formal 5-Tuple Mathematical Specification</span>
            </h2>
            <p className="text-sm text-slate-400">
              The Keyword Automaton is formally defined as <span className="font-mono text-emerald-300 font-semibold">M = (Q, Σ, δ, q₀, F)</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Q States */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-mono font-medium text-slate-400 mb-1">State Set (Q)</div>
            <div className="text-2xl font-bold text-white font-mono">{kwDfa.state_count}</div>
            <p className="mt-1 text-xs text-slate-400">
              q₀, prefix branches & trap state <span className="text-rose-400 font-mono">q_dead</span>
            </p>
          </div>

          {/* Sigma Alphabet */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-mono font-medium text-slate-400 mb-1">Alphabet (Σ)</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">{kwDfa.alphabet_size} Symbols</div>
            <p className="mt-1 text-xs text-slate-400">
              ASCII lowercase characters <span className="font-mono text-cyan-300">[a-z]</span>
            </p>
          </div>

          {/* Delta Transitions */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-mono font-medium text-slate-400 mb-1">Transition (δ)</div>
            <div className="text-2xl font-bold text-purple-400 font-mono">δ: Q × Σ → Q</div>
            <p className="mt-1 text-xs text-slate-400">
              {kwDfa.total_explicit_transitions} explicit trie branch edges
            </p>
          </div>

          {/* Start State q0 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-mono font-medium text-slate-400 mb-1">Initial State (q₀)</div>
            <div className="text-2xl font-bold text-amber-400 font-mono">q₀</div>
            <p className="mt-1 text-xs text-slate-400">
              Root state with empty prefix <span className="font-mono text-amber-300">ε</span>
            </p>
          </div>

          {/* Final States F */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-mono font-medium text-slate-400 mb-1">Accepting Set (F)</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{kwDfa.accepting_states_count} States</div>
            <p className="mt-1 text-xs text-slate-400">
              Terminal state for each recognized keyword
            </p>
          </div>

        </div>
      </div>

      {/* Compiler Lexical Analysis Flow Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <Layers className="h-5 w-5 text-emerald-400" />
          <span>Role of the DFA in Compiler Lexical Analysis</span>
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          During compilation, the Lexer scans raw source characters and uses Finite Automata to transform them into a stream of atomic tokens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Stage 1</div>
            <div className="font-semibold text-slate-200 text-sm">Source Code Stream</div>
            <p className="text-xs text-slate-400 mt-2 font-mono bg-slate-900 p-2 rounded border border-slate-800 text-amber-300">
              while (count &lt; 10)
            </p>
            <p className="text-xs text-slate-500 mt-2">Raw character stream with whitespace and comments.</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 shadow-lg shadow-emerald-950/40">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">Stage 2 (Our Core)</div>
            <div className="font-semibold text-emerald-300 text-sm">Keyword & ID DFA</div>
            <p className="text-xs text-emerald-400/90 mt-2 font-mono bg-emerald-950/60 p-2 rounded border border-emerald-800/40">
              δ(q0, 'w') → δ(q1, 'h')... → q_acc
            </p>
            <p className="text-xs text-slate-400 mt-2">Trie DFA verifies exact keyword; separate DFA validates identifiers.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Stage 3</div>
            <div className="font-semibold text-slate-200 text-sm">Token Stream</div>
            <p className="text-xs text-slate-300 mt-2 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              &lt;KEYWORD, "while"&gt;<br/>&lt;ID, "count"&gt;
            </p>
            <p className="text-xs text-slate-500 mt-2">Categorized typed lexemes with line and column positions.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Stage 4</div>
            <div className="font-semibold text-slate-200 text-sm">Syntax Analysis (Parser)</div>
            <p className="text-xs text-slate-300 mt-2 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              CFG / Pushdown Automaton
            </p>
            <p className="text-xs text-slate-500 mt-2">Generates Abstract Syntax Tree (AST) using Context-Free Grammar.</p>
          </div>

        </div>
      </div>

      {/* Supported 37 Java Keywords Grid with Category Filter */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Supported Java Keywords ({allKeywords.length})</span>
            </h2>
            <p className="text-sm text-slate-400">
              Click any keyword to immediately inspect its DFA execution path in the visual simulator.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(categoryLabels).map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedCategory === catKey
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {filteredKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => onSelectTokenForSim(kw)}
              className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all"
              title={`Simulate '${kw}' in DFA`}
            >
              <span className="font-mono text-sm font-semibold text-slate-200 group-hover:text-emerald-400">
                {kw}
              </span>
              <span className="text-xs text-slate-600 group-hover:text-emerald-400/80">
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shared Prefix Disambiguation Highlight */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <GitFork className="h-5 w-5 text-cyan-400" />
          <span>Shared Prefix Disambiguation in Trie-based DFA</span>
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          A fundamental concept in Theory of Computation: Shared prefixes traverse identical DFA states from <span className="font-mono text-emerald-300">q₀</span> until their fork point.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono text-sm font-bold text-cyan-400 mb-1">'if' vs 'implements'</div>
            <p className="text-xs text-slate-300">
              Both start with prefix <span className="font-mono text-amber-300">'i'</span>. At state <span className="font-mono text-emerald-400">q_i</span>, 
              receiving <span className="font-mono">'f'</span> accepts <span className="font-mono text-emerald-400">'if'</span>. 
              Receiving <span className="font-mono">'m'</span> continues toward <span className="font-mono">'implements'</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono text-sm font-bold text-cyan-400 mb-1">'class' vs 'catch' vs 'case'</div>
            <p className="text-xs text-slate-300">
              All share initial state <span className="font-mono text-amber-300">'c'</span>. At <span className="font-mono text-emerald-400">q_c</span>, 
              the DFA deterministically branches: <span className="font-mono">'l'</span> for class, <span className="font-mono">'a'</span> for catch/case.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono text-sm font-bold text-cyan-400 mb-1">'if' vs 'ifx' (Identifier Prefix)</div>
            <p className="text-xs text-slate-300">
              When scanning <span className="font-mono">'ifx'</span>, the DFA reaches the accepting state for <span className="font-mono">'if'</span> on character 2. 
              On the 3rd character <span className="font-mono">'x'</span>, it transitions to <span className="font-mono text-rose-400">q_dead</span>! 
              The lexical analyzer then re-classifies it as an Identifier.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
