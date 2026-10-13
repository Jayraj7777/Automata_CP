# Programming Language Keyword Detector Using DFA

An interactive, college-level computer science capstone project built on the principles of **Theory of Computation (TOC)** and **Compiler Design (Lexical Analysis)**.

---

## 1. Project Overview

In compiler design, **Lexical Analysis (Scanning)** is Phase 1 of the compilation pipeline. The lexer converts a raw, unstructured stream of source characters into a stream of atomic, categorized tokens.

Rather than relying on superficial dictionary or hash table lookups, this application implements a **genuine Deterministic Finite Automaton (DFA)**:
- Synthesizes a practical subset of **37 Java keywords** into a formal prefix tree (Trie-based DFA).
- Formally defines the 5-tuple automaton: $$M = (Q, \Sigma, \delta, q_0, F)$$
- Character-by-character transition tracking with explicit **Dead / Trap state ($q_{\text{dead}}$)** isolation.
- Disambiguates shared prefixes (e.g. `if` vs `implements`, `class` vs `catch`).
- Implements a secondary **Identifier DFA** for conventional identifier syntax: `[A-Za-z_$][A-Za-z0-9_$]*`.
- Provides an educational multi-token Java code lexer that masks comments and quoted strings to prevent false keyword matches.

---

## 2. Theoretical Foundations (TOC & Compiler Design)

### A. Formal 5-Tuple Definition

The Keyword Automaton is formally represented as:
$$M = (Q, \Sigma, \delta, q_0, F)$$

| Component | Formal Meaning | Implementation in this Project |
| :--- | :--- | :--- |
| **$Q$** | Finite set of states | **153 states** ($q_0$ through $q_{151}$, plus trap state $q_{\text{dead}}$) |
| **$\Sigma$** | Input alphabet | **26 lowercase ASCII characters**: $\{a, b, c, \dots, z\}$ |
| **$\delta$** | Transition function | $\delta: Q \times \Sigma \to Q$ (Total transition mapping) |
| **$q_0$** | Initial / Start state | State with prefix $\varepsilon$ (empty string) |
| **$F$** | Set of accepting / final states | **37 states** (each corresponding to an exact keyword) |

### B. Transition Function $\delta(q, c)$

For any state $q \in Q$ and input symbol $c \in \Sigma$:
$$\delta(q, c) = \begin{cases} q' & \text{if a valid branch exists in the keyword trie for prefix } q.\text{prefix} + c \\ q_{\text{dead}} & \text{otherwise} \end{cases}$$

For the trap state $q_{\text{dead}}$:
$$\delta(q_{\text{dead}}, c) = q_{\text{dead}} \quad \forall c \in \Sigma \cup \text{Other}$$

### C. Shared Prefix Disambiguation

When keywords share a common initial character sequence, the DFA traverses identical states until the point of divergence:
- **`if` vs `implements`**: Both start with prefix `'i'` ($q_0 \xrightarrow{\text{'i'}} q_i$). At $q_i$:
  - Transition on `'f'` reaches accepting state $q_{if}$ ($F$).
  - Transition on `'m'` advances toward prefix `"im"` along the path to `"implements"`.
- **`class` vs `catch` vs `case`**:
  - Traverses $q_0 \xrightarrow{\text{'c'}} q_c$.
  - Fork 1: $q_c \xrightarrow{\text{'l'}} q_{cl} \dots \xrightarrow{\text{'s'}} q_{class} \in F$.
  - Fork 2: $q_c \xrightarrow{\text{'a'}} q_{ca}$, which subsequently bifurcates into `catch` and `case`.

### D. Prefix Extension & Identifier Separation (`if` vs `ifx`)

A common student pitfall is confusing prefix matches with whole-token matches.
- When evaluating `ifx`, the DFA reads `'i'` ($q_i$), then `'f'` ($q_{if} \in F$).
- Upon scanning the 3rd character `'x'`, no keyword continues with `"ifx"`. The Keyword DFA transitions to $q_{\text{dead}}$.
- The Lexer then passes the candidate to the **Identifier DFA**:
  - Rule: `[A-Za-z_$][A-Za-z0-9_$]*`
  - $q_0 \xrightarrow{\text{'i'}} q_1 \xrightarrow{\text{'f'}} q_1 \xrightarrow{\text{'x'}} q_1 \in F_{id}$.
  - Result: Correctly classified as **Valid Identifier**, not a keyword!

---

## 3. Technology Stack

- **Backend**: Python 3.11+, Flask 3.1+, Flask-CORS
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide React
- **Visualization**: Interactive SVG with drag-to-pan, wheel/pinch zoom, active state pulsing glow, and accepting double-ring borders
- **Testing**: `pytest` automated test suite

---

## 4. Project Directory Structure

```text
keyword-detector-dfa/
├── backend/
│   ├── app.py                 # Flask REST API endpoints & CORS configuration
│   ├── dfa_engine.py          # Trie-based Keyword DFA, trace recorder, subgraph extractor
│   ├── identifier_dfa.py      # Formal 3-state DFA for Java identifier validation
│   ├── lexer.py               # Multi-token Java lexer with comment/string masking
│   ├── keywords.py            # Supported 37 Java keywords & syntactic categories
│   ├── test_dfa.py            # Automated test suite (16 comprehensive unit tests)
│   └── requirements.txt       # Python dependencies (flask, flask-cors, pytest)
├── frontend/
│   ├── index.html             # Application entry point
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind dark theme configuration
│   └── src/
│       ├── main.jsx           # React DOM root
│       ├── App.jsx            # Tab navigation, state management & connectivity
│       ├── index.css          # Tailwind directives & SVG animations
│       ├── services/api.js    # REST API client
│       └── components/
│           ├── Navbar.jsx               # Header with live backend health badge
│           ├── OverviewView.jsx         # 5-tuple specs, pipeline & category pills
│           ├── KeywordDetectorView.jsx  # Single-token classifier & step table
│           ├── DfaSimulatorView.jsx     # Interactive playback controls & character flow
│           ├── DfaGraph.jsx             # Interactive zoom/pan SVG graph component
│           ├── CodeAnalyzerView.jsx     # Java code editor, token stream & modal trace
│           └── VivaPrepView.jsx         # Academic theory & 8 viva Q&A cards
├── sample_programs/
│   ├── Sample1_Factorial.java           # Recursion, types, branching
│   ├── Sample2_BinarySearch.java        # While loop, indexing, conditions
│   └── Sample3_ClassWithEdgeCases.java  # Prefixes (ifx), comments & quoted strings
├── run_backend.bat            # One-click Windows starter for backend
├── run_frontend.bat           # One-click Windows starter for frontend
├── run_tests.bat              # One-click Windows starter for unit tests
└── README.md                  # Project documentation
```

---

## 5. Supported Java Keywords (37 Subset)

The 37 supported keywords are grouped into 6 educational syntactic categories:

1. **Control Flow (10)**: `if`, `else`, `while`, `for`, `do`, `switch`, `case`, `break`, `continue`, `return`
2. **Access Modifiers (5)**: `public`, `private`, `static`, `final`, `abstract`
3. **Data Types (6)**: `int`, `float`, `double`, `char`, `boolean`, `void`
4. **OOP & Modules (8)**: `class`, `interface`, `extends`, `implements`, `package`, `import`, `new`, `this`
5. **Exception Handling (5)**: `try`, `catch`, `finally`, `throw`, `throws`
6. **Literals & Constants (3)**: `true`, `false`, `null`

---

## 6. Setup & Installation Guide

### Prerequisites
- **Python 3.9+** (installed with PATH enabled)
- **Node.js 18+** & **npm**

### Step 1: Run Backend (Flask API)

Open a terminal or command prompt:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
*The backend starts at:* `http://localhost:5000`

### Step 2: Run Frontend (React Vite)

Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
*The application opens at:* `http://localhost:5173`

*(On Windows, you can also double-click `run_backend.bat` and `run_frontend.bat`)*

---

## 7. Running Automated Tests

Run the full pytest suite:
```bash
cd backend
.\venv\Scripts\python -m pytest test_dfa.py -v
```

### Test Suite Summary (16 Passed):
- `test_all_37_keywords_accepted` — Validates that all 37 keywords reach accepting states ($F$).
- `test_prefix_cases_rejected_as_keywords` — Verifies rejection of `ifx`, `className`, `integer`, `while1`.
- `test_incomplete_prefixes_rejected` — Verifies rejection of prefixes like `whi`, `cla`, `ret`.
- `test_dead_state_transition` — Confirms illegal symbols transition directly to $q_{\text{dead}}$.
- `test_valid_identifiers` — Verifies identifier rule $[A-Za-z\_\$][A-Za-z0-9\_\$]^*$.
- `test_invalid_identifiers` — Rejects numbers at start (`123start`) and invalid symbols (`#tag`).
- `test_lexer_keyword_and_identifier_distinction` — Verifies token differentiation.
- `test_keywords_inside_comments_and_strings_are_not_keywords` — Validates masking.
- `test_lexer_line_number_tracking` — Validates line and column indexing.
- `test_api_*` — Validates health, keywords, detect, simulate, and analyze REST endpoints.

---

## 8. REST API Documentation

### 1. Single Token Detection
- **Endpoint**: `POST /api/detect`
- **Request**:
  ```json
  { "token": "ifx" }
  ```
- **Response**:
  ```json
  {
    "token": "ifx",
    "classification": "VALID_IDENTIFIER",
    "is_keyword": false,
    "is_identifier": true,
    "is_valid": true,
    "summary": "'ifx' is a valid Java identifier (matches [A-Za-z_$][A-Za-z0-9_$]*).",
    "keyword_trace": {
      "is_keyword": false,
      "final_state": { "id": -1, "label": "q_dead", "prefix": "[TRAP]" },
      "steps": [ ... ]
    },
    "identifier_trace": {
      "is_valid": true,
      "final_state": "q1",
      "steps": [ ... ]
    }
  }
  ```

### 2. DFA Step-by-Step Simulation
- **Endpoint**: `POST /api/simulate`
- **Request**:
  ```json
  { "token": "class" }
  ```
- **Response**: Returns graph topology (`nodes`, `edges`), start state ID, and step trace for visual animation.

### 3. Multi-Token Lexical Analysis
- **Endpoint**: `POST /api/analyze`
- **Request**:
  ```json
  { "code": "public class Hello { int x = 10; }" }
  ```
- **Response**: Returns array of categorized tokens, line/column tracking, and summary statistics.

---

## 9. Viva Voce Cheat Sheet & Common Questions

1. **Why use a DFA instead of a Hash Table or String Comparison?**
   > *Answer:* A hash table requires pre-tokenized strings. In real compilers, the input is an unbounded character stream. The DFA processes characters on the fly with strict $O(1)$ time per transition, simultaneously segmenting word boundaries and identifying token types without backtracking.

2. **What is Maximal Munch (Longest Match)?**
   > *Answer:* When scanning input like `ifx`, the lexer does not greedily stop after `if` and emit keyword `if` followed by identifier `x`. Instead, it scans ahead until whitespace or a delimiter, recognizing the longest valid lexeme (`ifx`) as an identifier.

3. **What is a Dead / Trap State?**
   > *Answer:* In formal automata theory, the transition function $\delta: Q \times \Sigma \to Q$ must be total. If an input character has no valid continuation path in the automaton, it transitions to $q_{\text{dead}}$, an absorbing state where $\delta(q_{\text{dead}}, c) = q_{\text{dead}}$ for all $c \in \Sigma$.

4. **Where does Lexical Analysis fit in the Chomsky Hierarchy?**
   > *Answer:* Regular Languages (Type 3). Lexical tokens are recognized by Finite State Automata. Syntax analysis requires Context-Free Grammars (Type 2) handled by Pushdown Automata to manage recursive/nested grammar rules.
