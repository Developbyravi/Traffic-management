# Smart Traffic Management Platform - Quick Start Script
# This script starts both backend and frontend servers

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Smart Traffic Management Platform" -ForegroundColor Cyan
Write-Host "Solapur Municipal Corporation - DEMO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python main.py"

Write-Host "Backend starting on http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

# Wait a bit for backend to start
Start-Sleep -Seconds 3

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "Frontend starting on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✓ Both servers are starting!" -ForegroundColor Green
Write-Host "Your browser should open automatically..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
