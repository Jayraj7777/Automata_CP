"""
Deterministic Finite Automaton (DFA) for Java Identifier Validation.

Conventional educational rule: [A-Za-z_$][A-Za-z0-9_$]*

Formal 5-tuple: M_id = (Q_id, Sigma_id, delta_id, q0, F_id)
- Q_id = { q0, q1, q_dead }
- Sigma_id = ASCII letters, digits, '_', '$', and error characters
- delta_id:
    delta(q0, [A-Za-z_$])   = q1
    delta(q0, other)         = q_dead
    delta(q1, [A-Za-z0-9_$]) = q1
    delta(q1, other)         = q_dead
    delta(q_dead, any)       = q_dead
- Start state = q0
- F_id = { q1 }

Note for viva/exam:
This implementation models the standard educational subset of Java identifiers.
The full Java Language Specification (JLS §3.8) allows arbitrary Unicode letters
and currency symbols verified by Character.isJavaIdentifierStart() and
Character.isJavaIdentifierPart().
"""

from typing import Dict, List, Any

class IdentifierDFA:
    """Formal 3-state DFA for Java Identifier recognition."""
    
    def __init__(self):
        self.start_state = "q0"
        self.accepting_states = {"q1"}
        self.dead_state = "q_dead"

    def is_valid_start_char(self, ch: str) -> bool:
        """Rule: [A-Za-z_$]"""
        return ('a' <= ch <= 'z') or ('A' <= ch <= 'Z') or (ch == '_') or (ch == '$')

    def is_valid_part_char(self, ch: str) -> bool:
        """Rule: [A-Za-z0-9_$]"""
        return self.is_valid_start_char(ch) or ('0' <= ch <= '9')

    def transition(self, current_state: str, ch: str) -> str:
        """Transition function delta_id(state, ch)."""
        if current_state == "q_dead":
            return "q_dead"
        
        if current_state == "q0":
            if self.is_valid_start_char(ch):
                return "q1"
            else:
                return "q_dead"
                
        if current_state == "q1":
            if self.is_valid_part_char(ch):
                return "q1"
            else:
                return "q_dead"
                
        return "q_dead"

    def trace(self, token: str) -> Dict[str, Any]:
        """
        Execute token through Identifier DFA and return detailed transition trace.
        """
        if not token:
            return {
                "token": "",
                "is_valid": False,
                "final_state": "q0",
                "reason": "Empty token cannot be an identifier.",
                "steps": []
            }

        steps = []
        current = self.start_state

        for idx, ch in enumerate(token):
            from_st = current
            next_st = self.transition(current, ch)
            
            if from_st == "q0":
                if next_st == "q1":
                    explanation = f"Character '{ch}' is a valid identifier start [A-Za-z_$]. Transitioned from q0 to accepting state q1."
                else:
                    explanation = f"Character '{ch}' cannot begin an identifier (must be letter, '_', or '$'). Transitioned to q_dead."
            elif from_st == "q1":
                if next_st == "q1":
                    explanation = f"Character '{ch}' is a valid identifier part [A-Za-z0-9_$]. Self-looped at accepting state q1."
                else:
                    explanation = f"Character '{ch}' is illegal inside an identifier. Transitioned from q1 to q_dead."
            else:
                explanation = f"Character '{ch}' received while in sink state q_dead. Remained in q_dead."

            steps.append({
                "step": idx + 1,
                "input_index": idx,
                "char": ch,
                "from_state": from_st,
                "to_state": next_st,
                "is_dead": (next_st == "q_dead"),
                "is_accepting": (next_st in self.accepting_states),
                "explanation": explanation
            })
            current = next_st

        is_valid = (current in self.accepting_states)
        
        if is_valid:
            reason = f"Valid Identifier: Finished in accepting state {current} following rule [A-Za-z_$][A-Za-z0-9_$]*."
        elif current == "q_dead":
            reason = "Invalid Identifier: Hit illegal character and branched to trap state q_dead."
        else:
            reason = "Invalid Identifier: Traversal incomplete."

        return {
            "token": token,
            "is_valid": is_valid,
            "final_state": current,
            "reason": reason,
            "steps": steps,
            "specification_note": "Educational subset rule: [A-Za-z_$][A-Za-z0-9_$]*. Full Java standard includes Unicode letters."
        }

    def get_formal_definition(self) -> Dict[str, Any]:
        return {
            "name": "Identifier Validation DFA",
            "tuple_representation": "M_id = (Q_id, Σ_id, δ_id, q0, F_id)",
            "states": ["q0", "q1", "q_dead"],
            "alphabet_description": "[A-Za-z0-9_$] plus non-alphabet symbols",
            "start_state": "q0",
            "accepting_states": ["q1"],
            "trap_state": "q_dead",
            "regular_expression": "[A-Za-z_$][A-Za-z0-9_$]*"
        }

# Global singleton
IDENTIFIER_DFA = IdentifierDFA()
