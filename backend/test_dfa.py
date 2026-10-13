"""
Comprehensive Unit Tests for Programming Language Keyword Detector Using DFA.

Tests:
1. Keyword DFA acceptance of all 37 supported Java keywords.
2. Prefix rejection (e.g. 'ifx', 'integer', 'className', 'whi').
3. Identifier DFA validation ([A-Za-z_$][A-Za-z0-9_$]*).
4. Invalid token classification (e.g., '123start', '#tag', 'var-name').
5. Multi-token Java lexer accuracy and comment/string literal masking.
6. Flask REST API routes.
"""

import pytest
from keywords import JAVA_KEYWORDS
from dfa_engine import KEYWORD_DFA
from identifier_dfa import IDENTIFIER_DFA
from lexer import JAVA_LEXER
from app import app

# ----------------- 1. KEYWORD DFA TESTS -----------------

def test_all_37_keywords_accepted():
    """Verify that every supported Java keyword terminates in an accepting state."""
    for kw in JAVA_KEYWORDS:
        res = KEYWORD_DFA.trace_token(kw)
        assert res["is_keyword"] is True, f"Keyword '{kw}' failed acceptance!"
        assert res["accepted"] is True
        assert res["final_state"]["is_accepting"] is True
        assert res["final_state"]["keyword"] == kw
        assert len(res["steps"]) == len(kw)

def test_prefix_cases_rejected_as_keywords():
    """Verify that identifiers extending keyword prefixes are NOT accepted as keywords."""
    prefix_cases = [
        "ifx", "integer", "className", "while1", "format", "doubler",
        "publicly", "statics", "returnVal", "voidMethod", "trueFalse"
    ]
    for case in prefix_cases:
        res = KEYWORD_DFA.trace_token(case)
        assert res["is_keyword"] is False, f"'{case}' was incorrectly accepted as keyword!"

def test_incomplete_prefixes_rejected():
    """Verify that proper prefixes of keywords (e.g. 'whi' for 'while') are not accepting states."""
    incomplete = ["whi", "cla", "ret", "pub", "pack", "impl"]
    for case in incomplete:
        res = KEYWORD_DFA.trace_token(case)
        assert res["is_keyword"] is False
        assert res["accepted"] is False
        # Ended in non-accepting intermediate state (not dead state)
        assert res["final_state"]["id"] != KEYWORD_DFA.dead_state_id
        assert res["final_state"]["is_accepting"] is False

def test_dead_state_transition():
    """Verify that illegal characters branch directly to dead state."""
    res = KEYWORD_DFA.trace_token("if@")
    assert res["is_keyword"] is False
    assert res["final_state"]["id"] == KEYWORD_DFA.dead_state_id
    assert res["steps"][-1]["is_dead"] is True

# ----------------- 2. IDENTIFIER DFA TESTS -----------------

def test_valid_identifiers():
    """Verify identifier DFA accepts standard identifiers."""
    valid_ids = ["ifx", "className", "integer", "_counter", "$value", "temp2", "X", "__test__"]
    for v in valid_ids:
        res = IDENTIFIER_DFA.trace(v)
        assert res["is_valid"] is True, f"'{v}' should be a valid identifier!"
        assert res["final_state"] == "q1"

def test_invalid_identifiers():
    """Verify identifier DFA rejects numbers at start and illegal symbols."""
    invalid_ids = ["123start", "#tag", "var-name", "price$", "user@domain", "!flag"]
    for inv in invalid_ids:
        res = IDENTIFIER_DFA.trace(inv)
        if inv == "price$":
            # '$' is valid in Java identifiers, so price$ is valid
            continue
        assert res["is_valid"] is False, f"'{inv}' should be invalid!"

# ----------------- 3. MULTI-TOKEN LEXER TESTS -----------------

def test_lexer_keyword_and_identifier_distinction():
    code = "int count = 10; if (count > 0) return true;"
    result = JAVA_LEXER.tokenize(code)
    tokens = result["tokens"]
    
    types_by_lexeme = {t["lexeme"]: t["type"] for t in tokens}
    assert types_by_lexeme.get("int") == "KEYWORD"
    assert types_by_lexeme.get("if") == "KEYWORD"
    assert types_by_lexeme.get("return") == "KEYWORD"
    assert types_by_lexeme.get("true") == "KEYWORD"
    assert types_by_lexeme.get("count") == "IDENTIFIER"
    assert types_by_lexeme.get("10") == "NUMBER_LITERAL"

def test_keywords_inside_comments_and_strings_are_not_keywords():
    code = """
    // if else while for
    /* class public return */
    String s = "while (true) return null;";
    """
    result = JAVA_LEXER.tokenize(code)
    tokens = result["tokens"]
    
    # Filter only KEYWORD tokens
    keyword_lexemes = [t["lexeme"] for t in tokens if t["type"] == "KEYWORD"]
    assert "while" not in keyword_lexemes
    assert "return" not in keyword_lexemes
    assert "null" not in keyword_lexemes
    assert len(keyword_lexemes) == 0

def test_lexer_line_number_tracking():
    code = "int a = 1;\nint b = 2;\nreturn a + b;"
    result = JAVA_LEXER.tokenize(code)
    tokens = result["tokens"]
    
    # Check lines
    assert tokens[0]["line"] == 1  # int on line 1
    assert tokens[5]["line"] == 2  # int on line 2
    return_tok = [t for t in tokens if t["lexeme"] == "return"][0]
    assert return_tok["line"] == 3

# ----------------- 4. FLASK API TESTS -----------------

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "online"

def test_api_keywords(client):
    res = client.get("/api/keywords")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total"] == 37
    assert "class" in data["keywords"]

def test_api_detect_keyword(client):
    res = client.post("/api/detect", json={"token": "class"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "KEYWORD"
    assert data["is_keyword"] is True

def test_api_detect_identifier(client):
    res = client.post("/api/detect", json={"token": "className"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "VALID_IDENTIFIER"
    assert data["is_keyword"] is False
    assert data["is_identifier"] is True

def test_api_detect_invalid(client):
    res = client.post("/api/detect", json={"token": "123bad"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "INVALID_TOKEN"

def test_api_simulate(client):
    res = client.post("/api/simulate", json={"token": "if"})
    assert res.status_code == 200
    data = res.get_json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["trace"]["steps"]) == 2

def test_api_analyze(client):
    snippet = "public class Hello { public static void main() {} }"
    res = client.post("/api/analyze", json={"code": snippet})
    assert res.status_code == 200
    data = res.get_json()
    assert data["total_tokens"] > 0
    assert data["counts"]["KEYWORD"] >= 4
