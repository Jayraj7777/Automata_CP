"""
Educational Lexical Analyzer (Lexer / Tokenizer) for Java Subsets.

This module scans source code character-by-character, handles whitespace,
line and column counting, comments (single-line and block), string/character literals,
numeric literals, operators, and punctuation.

For every word-like token, it invokes the formal Keyword DFA and Identifier DFA
to guarantee that keywords are identified purely via DFA state machine transitions.
"""

from typing import List, Dict, Any, Optional
from dfa_engine import KEYWORD_DFA
from identifier_dfa import IDENTIFIER_DFA

class Token:
    """Represents a lexical token identified in the source text."""
    def __init__(self, token_type: str, lexeme: str, line: int, column: int, dfa_trace: Optional[Dict[str, Any]] = None):
        self.type: str = token_type
        self.lexeme: str = lexeme
        self.line: int = line
        self.column: int = column
        self.dfa_trace: Optional[Dict[str, Any]] = dfa_trace

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type,
            "lexeme": self.lexeme,
            "line": self.line,
            "column": self.column,
            "dfa_trace": self.dfa_trace
        }

class JavaLexer:
    """
    Scans Java source code and segments it into a stream of typed tokens.
    Uses Keyword DFA for keyword recognition and Identifier DFA for identifiers.
    """
    
    OPERATORS_MULTI = {
        "++", "--", "==", "!=", "<=", ">=", "&&", "||", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "->", "::"
    }
    OPERATORS_SINGLE = {
        '+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~', '?', ':'
    }
    PUNCTUATION = {
        '(', ')', '{', '}', '[', ']', ';', ',', '.'
    }

    def __init__(self):
        pass

    def tokenize(self, source_code: str) -> Dict[str, Any]:
        tokens: List[Token] = []
        errors: List[Dict[str, Any]] = []
        
        length = len(source_code)
        pos = 0
        line = 1
        col = 1

        while pos < length:
            ch = source_code[pos]

            # 1. Newline handling
            if ch == '\n':
                line += 1
                col = 1
                pos += 1
                continue

            # 2. Whitespace handling
            if ch in ' \t\r':
                pos += 1
                col += 1
                continue

            # 3. Comments (single-line // and multi-line /* */)
            if ch == '/' and pos + 1 < length:
                next_ch = source_code[pos + 1]
                if next_ch == '/':
                    # Single line comment
                    start_col = col
                    comment_text = ""
                    while pos < length and source_code[pos] != '\n':
                        comment_text += source_code[pos]
                        pos += 1
                        col += 1
                    tokens.append(Token("COMMENT", comment_text, line, start_col))
                    continue
                elif next_ch == '*':
                    # Multi-line comment
                    start_line = line
                    start_col = col
                    comment_text = "/*"
                    pos += 2
                    col += 2
                    closed = False
                    while pos < length:
                        if source_code[pos] == '*' and pos + 1 < length and source_code[pos + 1] == '/':
                            comment_text += "*/"
                            pos += 2
                            col += 2
                            closed = True
                            break
                        if source_code[pos] == '\n':
                            comment_text += '\n'
                            line += 1
                            col = 1
                            pos += 1
                        else:
                            comment_text += source_code[pos]
                            pos += 1
                            col += 1
                    if not closed:
                        errors.append({
                            "line": start_line,
                            "column": start_col,
                            "message": "Unterminated multi-line block comment."
                        })
                    tokens.append(Token("COMMENT", comment_text, start_line, start_col))
                    continue

            # 4. String Literals ("...")
            if ch == '"':
                start_col = col
                literal = '"'
                pos += 1
                col += 1
                closed = False
                while pos < length:
                    curr = source_code[pos]
                    literal += curr
                    pos += 1
                    col += 1
                    if curr == '\\' and pos < length:
                        # Escape sequence
                        literal += source_code[pos]
                        pos += 1
                        col += 1
                        continue
                    if curr == '"':
                        closed = True
                        break
                    if curr == '\n':
                        line += 1
                        col = 1
                if not closed:
                    errors.append({
                        "line": line,
                        "column": start_col,
                        "message": "Unterminated string literal."
                    })
                tokens.append(Token("STRING_LITERAL", literal, line, start_col))
                continue

            # 5. Character Literals ('...')
            if ch == "'":
                start_col = col
                literal = "'"
                pos += 1
                col += 1
                closed = False
                while pos < length:
                    curr = source_code[pos]
                    literal += curr
                    pos += 1
                    col += 1
                    if curr == '\\' and pos < length:
                        literal += source_code[pos]
                        pos += 1
                        col += 1
                        continue
                    if curr == "'":
                        closed = True
                        break
                    if curr == '\n':
                        line += 1
                        col = 1
                if not closed:
                    errors.append({
                        "line": line,
                        "column": start_col,
                        "message": "Unterminated character literal."
                    })
                tokens.append(Token("CHAR_LITERAL", literal, line, start_col))
                continue

            # 6. Word / Identifier / Keyword Tokens
            # Java identifier start: [A-Za-z_$]
            if ('a' <= ch <= 'z') or ('A' <= ch <= 'Z') or ch == '_' or ch == '$':
                start_col = col
                word = ""
                while pos < length:
                    curr = source_code[pos]
                    if (('a' <= curr <= 'z') or ('A' <= curr <= 'Z') or
                        ('0' <= curr <= '9') or curr == '_' or curr == '$'):
                        word += curr
                        pos += 1
                        col += 1
                    else:
                        break

                # Step 6a: Test against formal Keyword DFA
                kw_trace = KEYWORD_DFA.trace_token(word)
                if kw_trace["is_keyword"]:
                    tokens.append(Token("KEYWORD", word, line, start_col, dfa_trace=kw_trace))
                else:
                    # Step 6b: Test against Identifier DFA
                    id_trace = IDENTIFIER_DFA.trace(word)
                    if id_trace["is_valid"]:
                        tokens.append(Token("IDENTIFIER", word, line, start_col, dfa_trace=id_trace))
                    else:
                        tokens.append(Token("INVALID_TOKEN", word, line, start_col, dfa_trace=id_trace))
                        errors.append({
                            "line": line,
                            "column": start_col,
                            "message": f"Malformed identifier '{word}'."
                        })
                continue

            # 7. Numeric Literals
            if '0' <= ch <= '9':
                start_col = col
                num_str = ""
                has_dot = False
                while pos < length:
                    curr = source_code[pos]
                    if '0' <= curr <= '9':
                        num_str += curr
                        pos += 1
                        col += 1
                    elif curr == '.' and not has_dot and pos + 1 < length and ('0' <= source_code[pos + 1] <= '9'):
                        has_dot = True
                        num_str += curr
                        pos += 1
                        col += 1
                    else:
                        break
                tokens.append(Token("NUMBER_LITERAL", num_str, line, start_col))
                continue

            # 8. Two-character operators
            if pos + 1 < length:
                two_ch = source_code[pos:pos+2]
                if two_ch in self.OPERATORS_MULTI:
                    tokens.append(Token("OPERATOR", two_ch, line, col))
                    pos += 2
                    col += 2
                    continue

            # 9. Single-character operators
            if ch in self.OPERATORS_SINGLE:
                tokens.append(Token("OPERATOR", ch, line, col))
                pos += 1
                col += 1
                continue

            # 10. Punctuation / Delimiters
            if ch in self.PUNCTUATION:
                tokens.append(Token("PUNCTUATION", ch, line, col))
                pos += 1
                col += 1
                continue

            # 11. Unknown / Invalid character
            tokens.append(Token("INVALID_TOKEN", ch, line, col))
            errors.append({
                "line": line,
                "column": col,
                "message": f"Illegal character '{ch}' encountered in source."
            })
            pos += 1
            col += 1

        # Summary statistics for educational dashboard
        counts: Dict[str, int] = {}
        keyword_counts: Dict[str, int] = {}
        for t in tokens:
            counts[t.type] = counts.get(t.type, 0) + 1
            if t.type == "KEYWORD":
                keyword_counts[t.lexeme] = keyword_counts.get(t.lexeme, 0) + 1

        return {
            "tokens": [t.to_dict() for t in tokens],
            "total_tokens": len(tokens),
            "errors": errors,
            "counts": counts,
            "keyword_counts": keyword_counts,
            "total_lines": line,
            "specification_note": "Educational Java Lexer. Keywords validated using Keyword DFA M=(Q, Σ, δ, q0, F)."
        }

# Global instance
JAVA_LEXER = JavaLexer()
