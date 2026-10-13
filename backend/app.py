"""
Flask REST API for Programming Language Keyword Detector Using DFA.

Provides endpoints for:
- Health check
- Keyword list & categories
- Single-token classification and DFA trace
- Step-by-step DFA simulation and graph topology
- Shared prefix educational breakdown
- Multi-token code lexical analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from keywords import JAVA_KEYWORDS, KEYWORD_CATEGORIES, get_keyword_details
from dfa_engine import KEYWORD_DFA
from identifier_dfa import IDENTIFIER_DFA
from lexer import JAVA_LEXER

app = Flask(__name__)
# Enable CORS for all routes to seamlessly communicate with Vite frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

SAMPLE_SNIPPETS = [
    {
        "id": "factorial",
        "title": "Factorial Calculation (Recursion & Conditions)",
        "code": """public class FactorialCalculator {
    public static int compute(int n) {
        // Base case for recursion
        if (n <= 1) {
            return 1;
        } else {
            return n * compute(n - 1);
        }
    }

    public static void main(String[] args) {
        int result = compute(5);
        System.out.println("Result: " + result);
    }
}"""
    },
    {
        "id": "binary_search",
        "title": "Binary Search (While Loop & Array Indexing)",
        "code": """package algorithm.search;

public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1; // Target not found
    }
}"""
    },
    {
        "id": "edge_cases",
        "title": "Keywords vs Identifiers & Prefix Edge Cases",
        "code": """// Educational test showing prefixes and keywords in strings
public class TestCases {
    private int ifx = 10;          // 'ifx' is an identifier, not 'if'
    private String className = "A"; // 'className' is an identifier, not 'class'
    private boolean isTrue = true; // 'true' is keyword literal, 'isTrue' identifier
    
    public void demo() {
        /* Keywords inside comments should NOT be tokens:
           while for do break return class
        */
        String message = "Keywords in quotes like 'public static void' are literals";
        try {
            int count = 0;
            while (count < 5) {
                count++;
                if (count == 3) break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // cleanup
        }
    }
}"""
    }
]

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "online",
        "service": "Keyword Detector DFA Backend",
        "version": "1.0.0"
    }), 200

@app.route("/api/keywords", methods=["GET"])
def get_keywords():
    """Return all supported keywords and their categories."""
    details = [get_keyword_details(kw) for kw in JAVA_KEYWORDS]
    return jsonify({
        "total": len(JAVA_KEYWORDS),
        "keywords": JAVA_KEYWORDS,
        "categories": KEYWORD_CATEGORIES,
        "details": details
    }), 200

@app.route("/api/dfa/formal", methods=["GET"])
def get_formal_dfa():
    """Return formal 5-tuple specification for theory & viva explanation."""
    keyword_formal = KEYWORD_DFA.get_formal_definition()
    identifier_formal = IDENTIFIER_DFA.get_formal_definition()
    return jsonify({
        "keyword_dfa": keyword_formal,
        "identifier_dfa": identifier_formal
    }), 200

@app.route("/api/dfa/prefixes", methods=["GET"])
def get_prefixes():
    """Return shared prefix analysis for viva discussions."""
    return jsonify({
        "shared_prefixes": KEYWORD_DFA.get_shared_prefixes_analysis()
    }), 200

@app.route("/api/dfa/graph", methods=["GET"])
def get_full_graph():
    """Return full graph topology of the Keyword DFA."""
    return jsonify(KEYWORD_DFA.get_full_graph()), 200

@app.route("/api/detect", methods=["POST"])
def detect_token():
    """
    Classify a single token: Keyword, Valid Identifier, or Invalid Token.
    Returns DFA transition traces, intermediate states, and reasoning.
    """
    data = request.get_json(silent=True) or {}
    token = data.get("token", "")

    if not isinstance(token, str):
        return jsonify({"error": "Field 'token' must be a string."}), 400

    token = token.strip()
    if not token:
        return jsonify({
            "token": "",
            "classification": "EMPTY",
            "is_keyword": False,
            "is_identifier": False,
            "is_valid": False,
            "summary": "Please provide a non-empty token."
        }), 200

    # 1. Run through Keyword DFA
    kw_trace = KEYWORD_DFA.trace_token(token)
    
    # 2. Run through Identifier DFA
    id_trace = IDENTIFIER_DFA.trace(token)

    # 3. Determine final classification
    if kw_trace["is_keyword"]:
        classification = "KEYWORD"
        category = kw_trace["keyword_info"]["category"] if kw_trace["keyword_info"] else "keyword"
        summary = f"'{token}' is a recognized Java keyword ({category})."
    elif id_trace["is_valid"]:
        classification = "VALID_IDENTIFIER"
        summary = f"'{token}' is a valid Java identifier (matches [A-Za-z_$][A-Za-z0-9_$]*)."
    else:
        classification = "INVALID_TOKEN"
        summary = f"'{token}' is an invalid token (failed both Keyword DFA and Identifier DFA rules)."

    return jsonify({
        "token": token,
        "classification": classification,
        "is_keyword": kw_trace["is_keyword"],
        "is_identifier": id_trace["is_valid"] and not kw_trace["is_keyword"],
        "is_valid": kw_trace["is_keyword"] or id_trace["is_valid"],
        "summary": summary,
        "keyword_trace": kw_trace,
        "identifier_trace": id_trace
    }), 200

@app.route("/api/simulate", methods=["POST"])
def simulate_token():
    """
    Simulate step-by-step traversal for visualization.
    Returns focused subgraph, step trace, and active state transitions.
    """
    data = request.get_json(silent=True) or {}
    token = data.get("token", "")

    if not isinstance(token, str):
        return jsonify({"error": "Field 'token' must be a string."}), 400

    token = token.strip()
    subgraph_data = KEYWORD_DFA.get_focused_subgraph(token)
    return jsonify(subgraph_data), 200

@app.route("/api/analyze", methods=["POST"])
def analyze_code():
    """
    Multi-token lexical analysis of Java source code.
    Extracts tokens, tracks line/column, validates keywords via DFA,
    and returns token table and metrics.
    """
    data = request.get_json(silent=True) or {}
    code = data.get("code", "")

    if not isinstance(code, str):
        return jsonify({"error": "Field 'code' must be a string."}), 400

    result = JAVA_LEXER.tokenize(code)
    return jsonify(result), 200

@app.route("/api/samples", methods=["GET"])
def get_samples():
    """Return preloaded sample Java code snippets."""
    return jsonify({"samples": SAMPLE_SNIPPETS}), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
