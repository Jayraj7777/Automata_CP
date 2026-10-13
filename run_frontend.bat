@echo off
echo ========================================================
echo   Starting DFA Keyword Detector Frontend (Vite React)
echo ========================================================
cd frontend
if not exist "node_modules" (
    echo [INFO] Installing frontend npm dependencies...
    call npm install
)
echo [INFO] Starting Vite development server on http://localhost:5173 ...
call npm run dev
pause
