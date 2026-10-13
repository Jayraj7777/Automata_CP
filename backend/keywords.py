"""
Supported Java Keywords and Categories for the DFA Keyword Detector.

This module defines the 37 standard Java keywords supported by the system,
grouped into syntactic categories for educational insights during lexical analysis.
"""

JAVA_KEYWORDS = [
    "if", "else", "while", "for", "do", "switch", "case", "break", "continue",
    "class", "public", "private", "static", "void", "int", "float", "double",
    "char", "boolean", "return", "new", "this", "try", "catch", "finally",
    "throw", "throws", "import", "package", "extends", "implements", "interface",
    "final", "abstract", "true", "false", "null"
]

KEYWORD_CATEGORIES = {
    "control_flow": ["if", "else", "while", "for", "do", "switch", "case", "break", "continue", "return"],
    "access_modifiers": ["public", "private", "static", "final", "abstract"],
    "data_types": ["int", "float", "double", "char", "boolean", "void"],
    "oop_declarations": ["class", "interface", "extends", "implements", "package", "import", "new", "this"],
    "exception_handling": ["try", "catch", "finally", "throw", "throws"],
    "literals_constants": ["true", "false", "null"]
}

def get_keyword_category(kw: str) -> str:
    """Return the syntax category for a supported keyword."""
    for category, words in KEYWORD_CATEGORIES.items():
        if kw in words:
            return category
    return "keyword"

def get_keyword_details(kw: str) -> dict:
    """Return rich educational metadata for a keyword."""
    category = get_keyword_category(kw)
    descriptions = {
        "if": "Conditional branching statement.",
        "else": "Alternative branch for an if statement.",
        "while": "Pre-test entry controlled loop.",
        "for": "Iteration statement with initialization, condition, and update.",
        "do": "Post-test exit controlled loop (executed at least once).",
        "switch": "Multi-way branch selection statement.",
        "case": "Label inside a switch statement.",
        "break": "Transfers control out of a loop or switch statement.",
        "continue": "Skips remainder of current loop iteration.",
        "class": "Declares a class definition.",
        "public": "Access modifier granting universal visibility.",
        "private": "Access modifier restricting access to enclosing class.",
        "static": "Belongs to the class rather than instance.",
        "void": "Specifies that a method does not return a value.",
        "int": "32-bit signed two's complement integer primitive type.",
        "float": "Single-precision 32-bit IEEE 754 floating point.",
        "double": "Double-precision 64-bit IEEE 754 floating point.",
        "char": "16-bit Unicode character primitive type.",
        "boolean": "Logical primitive type representing true or false.",
        "return": "Exits from current method, optionally returning a value.",
        "new": "Allocates memory for a new object or array instance.",
        "this": "Reference to the current object instance.",
        "try": "Block containing code that may throw exceptions.",
        "catch": "Block for handling specific exceptions.",
        "finally": "Block guaranteed to execute after try/catch.",
        "throw": "Explicitly throws an exception instance.",
        "throws": "Declares exceptions a method might propagate.",
        "import": "Makes external classes available to current compilation unit.",
        "package": "Declares the namespace group for the compilation unit.",
        "extends": "Indicates class inheritance or interface extension.",
        "implements": "Declares that a class realizes an interface contract.",
        "interface": "Declares an abstract blueprint of methods and constants.",
        "final": "Prevents modification (constant, un-subclassable, un-overridable).",
        "abstract": "Declares incomplete implementation requiring subclasses.",
        "true": "Boolean literal constant representing truth.",
        "false": "Boolean literal constant representing falsehood.",
        "null": "Literal representing reference that points to no object."
    }
    return {
        "keyword": kw,
        "category": category,
        "description": descriptions.get(kw, "Java language keyword.")
    }
