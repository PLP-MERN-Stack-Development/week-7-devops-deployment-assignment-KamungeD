@echo off
REM Deployment script for Windows
echo 🚀 Starting deployment process...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    exit /b 1
)

echo [INFO] Installing server dependencies...
cd server
call npm ci --only=production
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    exit /b 1
)
cd ..

echo [INFO] Installing client dependencies...
cd client
call npm ci
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies
    exit /b 1
)

echo [INFO] Building client application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build client application
    exit /b 1
)
cd ..

echo [INFO] Running health check...
cd server
start /b npm start
timeout /t 10 >nul
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Health check failed
    taskkill /f /im node.exe >nul 2>&1
    exit /b 1
)
taskkill /f /im node.exe >nul 2>&1
cd ..

echo [INFO] Deployment completed successfully! 🎉
echo [INFO] Your application is ready to run with: npm start
