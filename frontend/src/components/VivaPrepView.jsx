import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Binary, 
  Code2, 
  Cpu, 
  Layers 
} from 'lucide-react';

export default function VivaPrepView({ formalData }) {
  const [openFaq, setOpenFaq] = useState(0);

  const vivaQuestions = [
    {
      q: "Why do we use a DFA instead of a simple hash table or 'word in list' lookup?",
      a: "In real compilers, the lexer reads a continuous character stream from an I/O buffer without prior knowledge of word boundaries. A DFA processes characters on the fly with strict O(1) time per character, enabling both boundary detection (maximal munch) and token categorization simultaneously. While educational scripts often use hash maps, theory of computation and industrial lexer generators (such as Lex and Flex) rely on DFA state transitions."
    },
    {
      q: "How does the DFA distinguish between 'if' and 'ifx'?",
      a: "The Keyword DFA starts at q0. On reading 'i', it transitions to q_i; on 'f', it reaches the accepting state q_if. However, upon encountering 'x', there is no keyword in the alphabet continuing with 'ifx'. The Keyword DFA transitions to the trap state (q_dead). The lexer then delegates the token to the Identifier DFA, which successfully accepts 'ifx' as a valid variable name under the grammar [A-Za-z_$][A-Za-z0-9_$]*."
    },
    {
      q: "What is a Dead State (Trap State) and why is it necessary in a formal DFA?",
      a: "By formal definition, a Deterministic Finite Automaton's transition function δ must be a total function (δ: Q × Σ → Q), meaning every state must have an outgoing transition for every symbol in Σ. If an illegal or non-matching character is encountered, the automaton transitions to an absorbing sink state (q_dead) with self-loops δ(q_dead, c) = q_dead for all c ∈ Σ, from which it can never reach an accepting state."
    },
    {
      q: "What is the time complexity of scanning a token of length N using this DFA?",
      a: "The time complexity is strictly O(N), where N is the length of the input token. Each character triggers exactly one state transition lookup. This constant O(1) transition time guarantees real-time, deterministic lexical analysis regardless of whether there are 10 keywords or 100 keywords."
    },
    {
      q: "How do shared prefixes work in this trie-based automaton?",
      a: "Keywords sharing common prefixes (such as 'class' and 'catch', or 'if' and 'implements') share identical DFA states from the root q0 up to their divergence point. For example, 'class' and 'catch' both traverse q0 → q_c. At q_c, receiving 'l' branches toward 'class', while receiving 'a' branches toward 'catch'. This minimizes redundant state creation while preserving determinism."
    },
    {
      q: "Where does Lexical Analysis sit in the Chomsky Hierarchy?",
      a: "Lexical analysis operates at Type-3 (Regular Languages). Programming language tokens (identifiers, keywords, numbers, operators) can be described by Regular Expressions and accepted by Finite Automata (DFA/NFA). Syntax analysis (parsing) requires Type-2 (Context-Free Grammars) handled by Pushdown Automata to check nested structures like matching brackets."
    },
    {
      q: "Why are keywords inside comments and string literals not recognized as keyword tokens?",
      a: "The lexical analyzer implements state-aware scanning. When it encounters '//' or '/*', it switches to comment-skipping mode until the delimiter ends. Similarly, when encountering double quotes '\"', it enters string literal collection mode. This prevents occurrences of 'while', 'return', or 'class' inside comments and strings from being mistakenly emitted as keyword tokens."
    },
    {
      q: "What is the difference between an NFA and a DFA for keyword detection?",
      a: "An NFA can have ε-transitions and multiple possible target states for a single (state, character) pair, allowing compact representation but requiring backtracking or subset simulation (O(|Q|²) per step). A DFA has exactly one deterministic target state per transition, guaranteeing instantaneous O(1) step execution. Lexer generators convert NFAs into DFAs using the Powerset (Subset) Construction algorithm."
    }
  ];

  const kw = formalData?.keyword_dfa || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3">
          <GraduationCap className="h-4 w-4" />
          <span>Viva Voce & Theory of Computation Academic Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Theoretical Foundations & Viva Examination Cheat Sheet
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          This section contains all the core theoretical concepts, definitions, and model answers 
          needed to explain this project with full confidence during project evaluation, external viva, or university reviews.
        </p>
      </div>

      {/* Key Theory Concepts 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Binary className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Formal 5-Tuple Definition</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            A DFA is formally defined as <span className="font-mono text-emerald-300">M = (Q, Σ, δ, q₀, F)</span>:
          </p>
          <ul className="text-xs font-mono text-slate-400 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <li>• <span className="text-emerald-400">Q</span> = Finite set of {kw.state_count || 153} states</li>
            <li>• <span className="text-cyan-400">Σ</span> = Alphabet {kw.alphabet_size || 26} symbols [a-z]</li>
            <li>• <span className="text-purple-400">δ</span> = δ: Q × Σ → Q (Total Transition)</li>
            <li>• <span className="text-amber-400">q₀</span> = Initial start state (empty prefix)</li>
            <li>• <span className="text-emerald-400">F</span> = {kw.accepting_states_count || 37} Accepting states</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Lexical Analysis in Compilers</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Lexical analysis is the <strong>Phase 1</strong> of compilation. It translates raw source code characters into logical tokens using regular expressions converted into DFAs.
          </p>
          <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div>• Eliminates whitespace and comments</div>
            <div>• Enforces Maximum Munch (Longest Match)</div>
            <div>• Distinguishes Reserved Keywords from Identifiers</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Trie-Based Automaton Construction</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rather than building separate DFAs for every word, we synthesize all 37 keywords into a <strong>Prefix Tree (Trie) DFA</strong>.
          </p>
          <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div>• Common prefixes share state paths</div>
            <div>• Dead state handles prefix failure</div>
            <div>• Strictly deterministic: at most 1 transition per char</div>
          </div>
        </div>

      </div>

      {/* Accordion of Common Viva Questions & Model Answers */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            <span>Frequently Asked Viva Questions & Model Answers</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on any question to view the comprehensive academic explanation to give during your viva.
          </p>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className={`rounded-xl border transition-all ${
                  isOpen 
                    ? 'bg-slate-950 border-indigo-500/50 shadow-md' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 flex items-center justify-between text-left font-medium text-slate-200 text-sm focus:outline-none"
                >
                  <span className="flex items-center space-x-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-950 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                      Q{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-100">{item.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-indigo-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 mt-1 font-sans">
                    <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-indigo-200 font-medium">
                      {item.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
