@echo off
echo ========================================================
echo   Starting DFA Keyword Detector Backend (Flask API)
echo ========================================================
cd backend
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    call .\venv\Scripts\activate.bat
    echo [INFO] Installing backend dependencies...
    pip install -r requirements.txt
) else (
    call .\venv\Scripts\activate.bat
)
echo [INFO] Starting Flask REST API on http://localhost:5000 ...
python app.py
pause
