#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting KisanClaim Local Stack (Backend & Frontend)"
echo "=========================================================="

# 1. Start Backend in background
echo "1. Starting FastAPI Backend on http://127.0.0.1:8000 ..."
PYTHONPATH=backend ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 2. Start Frontend dev server
echo "2. Starting React Vite Frontend on http://localhost:5173 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "Stopping KisanClaim services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "=========================================================="
echo " KisanClaim Application is Live!"
echo " - Web Platform:  http://localhost:5173"
echo " - Backend API:   http://127.0.0.1:8000"
echo " - Swagger Docs:  http://127.0.0.1:8000/docs"
echo " Press Ctrl+C to stop both servers."
echo "=========================================================="

wait
