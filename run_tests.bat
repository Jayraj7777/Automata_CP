@echo off
echo ========================================================
echo   Running DFA Unit Tests (pytest)
echo ========================================================
cd backend
if exist "venv\Scripts\python.exe" (
    .\venv\Scripts\python -m pytest test_dfa.py -v
) else (
    python -m pytest test_dfa.py -v
)
pause
