"""
Deterministic Finite Automaton (DFA) Engine for Java Keyword Detection.

This module implements the formal 5-tuple DFA M = (Q, Sigma, delta, q0, F):
- Q: Finite set of states (including start state, intermediate prefix states, and trap/dead state)
- Sigma: Alphabet of valid characters (a-z for Java keywords)
- delta: Transition function Q x Sigma -> Q
- q0: Initial state (q0)
- F: Set of accepting states (terminal states for supported keywords)

Trie-to-DFA construction ensures that shared prefixes (e.g., 'if' and 'implements',
or 'class' and 'catch') share paths up to their bifurcation point.
"""

from typing import Dict, List, Set, Optional, Tuple, Any
from keywords import JAVA_KEYWORDS, get_keyword_details

class DFAState:
    """Represents a state in the Keyword DFA."""
    def __init__(self, state_id: int, prefix: str = "", is_accepting: bool = False, keyword: Optional[str] = None):
        self.state_id: int = state_id
        self.label: str = f"q{state_id}" if state_id >= 0 else "q_dead"
        self.prefix: str = prefix
        self.is_accepting: bool = is_accepting
        self.keyword: Optional[str] = keyword
        self.transitions: Dict[str, int] = {}  # char -> target state_id
        self.depth: int = len(prefix)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.state_id,
            "label": self.label,
            "prefix": self.prefix,
            "is_accepting": self.is_accepting,
            "keyword": self.keyword,
            "depth": self.depth,
            "transitions": self.transitions
        }


class KeywordDFA:
    """
    Formal Deterministic Finite Automaton (DFA) built from the set of supported keywords.
    Provides character-by-character transition tracking, step trace generation,
    subgraph extraction, and formal 5-tuple representation.
    """
    def __init__(self, keywords: Optional[List[str]] = None):
        self.keywords: List[str] = sorted(keywords or JAVA_KEYWORDS)
        self.states: Dict[int, DFAState] = {}
        self.start_state_id: int = 0
        self.dead_state_id: int = -1
        self.alphabet: Set[str] = set()
        self.accepting_state_ids: Set[int] = set()
        
        # Build the DFA from the keyword list
        self._build_dfa()

    def _build_dfa(self) -> None:
        """Construct the Trie-based DFA and register the dead state."""
        # State 0 is the start state
        start_state = DFAState(state_id=0, prefix="", is_accepting=False)
        self.states[0] = start_state
        next_id = 1

        # Populate alphabet and prefix states
        for kw in self.keywords:
            current_id = 0
            current_prefix = ""
            for ch in kw:
                self.alphabet.add(ch)
                current_prefix += ch
                curr_state = self.states[current_id]
                
                if ch in curr_state.transitions:
                    current_id = curr_state.transitions[ch]
                else:
                    new_id = next_id
                    next_id += 1
                    new_state = DFAState(state_id=new_id, prefix=current_prefix)
                    self.states[new_id] = new_state
                    curr_state.transitions[ch] = new_id
                    current_id = new_id

            # The leaf/terminal node for this keyword is marked accepting
            final_state = self.states[current_id]
            final_state.is_accepting = True
            final_state.keyword = kw
            self.accepting_state_ids.add(current_id)

        # Explicit Dead/Trap state (q_dead)
        dead_state = DFAState(state_id=self.dead_state_id, prefix="[TRAP]")
        self.states[self.dead_state_id] = dead_state
        # In formal DFA, dead state transitions to itself on all characters in Sigma
        for ch in self.alphabet:
            dead_state.transitions[ch] = self.dead_state_id

    def transition(self, current_state_id: int, char: str) -> int:
        """
        DFA transition function delta(q, c).
        Returns target state ID or dead state if no transition exists.
        """
        if current_state_id == self.dead_state_id:
            return self.dead_state_id
        
        state = self.states.get(current_state_id)
        if not state:
            return self.dead_state_id
            
        return state.transitions.get(char, self.dead_state_id)

    def trace_token(self, token: str) -> Dict[str, Any]:
        """
        Simulate token processing character-by-character through the DFA.
        Returns a rich execution trace including states visited, active transitions,
        prefix progression, and detailed acceptance explanation.
        """
        steps = []
        current_id = self.start_state_id
        visited_state_ids = [current_id]

        for idx, ch in enumerate(token):
            from_state = self.states[current_id]
            next_id = self.transition(current_id, ch)
            to_state = self.states[next_id]
            visited_state_ids.append(next_id)

            is_dead = (next_id == self.dead_state_id)
            is_accepting = to_state.is_accepting if not is_dead else False

            # Craft human-readable explanation for viva & learning
            if is_dead:
                if ch not in self.alphabet:
                    explanation = f"Character '{ch}' is not in keyword alphabet Σ. Transitioned to Trap State q_dead."
                else:
                    explanation = f"No valid keyword path continues with prefix '{from_state.prefix + ch}'. Transitioned to Trap State q_dead."
            else:
                if is_accepting and idx == len(token) - 1:
                    explanation = f"Matched '{ch}'. Reached accepting state {to_state.label} representing exact keyword '{to_state.keyword}'."
                elif is_accepting:
                    explanation = f"Matched '{ch}'. Reached intermediate accepting state {to_state.label} for '{to_state.keyword}', continuing input scan."
                else:
                    explanation = f"Matched '{ch}'. Advanced along valid prefix '{to_state.prefix}' to state {to_state.label}."

            steps.append({
                "step": idx + 1,
                "input_index": idx,
                "char": ch,
                "from_state": from_state.to_dict(),
                "to_state": to_state.to_dict(),
                "is_dead": is_dead,
                "is_accepting": is_accepting,
                "explanation": explanation
            })

            current_id = next_id

        final_state = self.states[current_id]
        is_keyword = (current_id in self.accepting_state_ids) and (current_id != self.dead_state_id)
        
        # Determine comprehensive rejection reason if not accepted
        reason = ""
        if is_keyword:
            reason = f"Accepted: '{token}' terminated in accepting state {final_state.label}."
        elif current_id == self.dead_state_id:
            reason = f"Rejected: Input branched into dead state q_dead (no matching keyword prefix)."
        else:
            # Ended in an intermediate state that is NOT accepting (e.g., 'whi' for 'while')
            reason = f"Rejected: Input ended in non-accepting state {final_state.label} with prefix '{final_state.prefix}' (incomplete keyword)."

        return {
            "token": token,
            "is_keyword": is_keyword,
            "final_state": final_state.to_dict(),
            "accepted": is_keyword,
            "reason": reason,
            "keyword_info": get_keyword_details(token) if is_keyword else None,
            "steps": steps,
            "visited_state_ids": visited_state_ids
        }

    def get_formal_definition(self) -> Dict[str, Any]:
        """
        Return formal 5-tuple M = (Q, Sigma, delta, q0, F) metadata and counts.
        """
        total_transitions = sum(len(s.transitions) for s in self.states.values() if s.state_id != self.dead_state_id)
        return {
            "tuple_representation": "M = (Q, Σ, δ, q0, F)",
            "state_count": len(self.states),
            "alphabet": sorted(list(self.alphabet)),
            "alphabet_size": len(self.alphabet),
            "start_state": "q0",
            "accepting_states_count": len(self.accepting_state_ids),
            "accepting_states": [self.states[sid].label for sid in sorted(self.accepting_state_ids)],
            "total_keywords": len(self.keywords),
            "total_explicit_transitions": total_transitions,
            "trap_state": "q_dead"
        }

    def get_full_graph(self) -> Dict[str, Any]:
        """
        Return the complete graph structure (nodes and directed edges)
        suitable for graph visualization.
        """
        nodes = []
        edges = []

        for sid, state in self.states.items():
            nodes.append({
                "id": sid,
                "label": state.label,
                "prefix": state.prefix,
                "is_start": (sid == self.start_state_id),
                "is_accepting": state.is_accepting,
                "is_dead": (sid == self.dead_state_id),
                "keyword": state.keyword,
                "depth": state.depth
            })

            # For graph clarity, don't show all 26 self-loops on dead state,
            # but show explicit forward transitions from normal states.
            if sid != self.dead_state_id:
                for ch, target_id in state.transitions.items():
                    edges.append({
                        "id": f"e_{sid}_{target_id}_{ch}",
                        "source": sid,
                        "target": target_id,
                        "label": ch
                    })

        return {
            "nodes": nodes,
            "edges": edges,
            "start_state_id": self.start_state_id,
            "dead_state_id": self.dead_state_id
        }

    def get_focused_subgraph(self, token: str) -> Dict[str, Any]:
        """
        Extract the relevant prefix neighborhood for the given token.
        Includes:
        - All states visited along the token's trace.
        - Sibling branches at each step (e.g. for 'cl', includes 'class' and 'catch' forks).
        - Dead state if reached.
        This provides a visually pristine, readable tree for viva demonstration.
        """
        trace = self.trace_token(token)
        relevant_node_ids: Set[int] = set(trace["visited_state_ids"])
        
        # Include immediate siblings at each visited node to illustrate branching decisions
        for sid in list(relevant_node_ids):
            if sid in self.states and sid != self.dead_state_id:
                for target_id in self.states[sid].transitions.values():
                    relevant_node_ids.add(target_id)

        # Build focused node and edge lists
        nodes = []
        edges = []
        for sid in relevant_node_ids:
            if sid in self.states:
                st = self.states[sid]
                nodes.append({
                    "id": sid,
                    "label": st.label,
                    "prefix": st.prefix,
                    "is_start": (sid == self.start_state_id),
                    "is_accepting": st.is_accepting,
                    "is_dead": (sid == self.dead_state_id),
                    "keyword": st.keyword,
                    "depth": st.depth,
                    "is_on_active_path": sid in trace["visited_state_ids"]
                })

                if sid != self.dead_state_id:
                    for ch, tid in st.transitions.items():
                        if tid in relevant_node_ids:
                            edges.append({
                                "id": f"e_{sid}_{tid}_{ch}",
                                "source": sid,
                                "target": tid,
                                "label": ch,
                                "is_on_active_path": (
                                    sid in trace["visited_state_ids"] and 
                                    tid in trace["visited_state_ids"] and
                                    token.find(st.prefix + ch) == 0
                                )
                            })

        return {
            "token": token,
            "trace": trace,
            "nodes": nodes,
            "edges": edges,
            "start_state_id": self.start_state_id,
            "dead_state_id": self.dead_state_id
        }

    def get_shared_prefixes_analysis(self) -> List[Dict[str, Any]]:
        """
        Identify and explain key shared prefixes in the keyword set,
        such as 'if' vs 'implements', 'class' vs 'catch', 'for' vs 'float', etc.
        Essential for viva presentation!
        """
        prefix_groups: Dict[str, List[str]] = {}
        for kw in self.keywords:
            first_two = kw[:2] if len(kw) >= 2 else kw
            prefix_groups.setdefault(first_two, []).append(kw)

        shared = []
        for pfx, words in sorted(prefix_groups.items()):
            if len(words) > 1:
                shared.append({
                    "shared_prefix": pfx,
                    "keywords": words,
                    "explanation": (
                        f"Keywords {words} share initial prefix '{pfx}'. "
                        f"The DFA traverses the identical path from q0 up to depth {len(pfx)}, "
                        f"then branches deterministically based on subsequent characters."
                    )
                })
        return shared


# Global singleton instance for high performance
KEYWORD_DFA = KeywordDFA()
