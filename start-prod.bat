@echo off
echo Starting Vendori in production mode...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Build the application
echo Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build the application
    pause
    exit /b 1
)

:: Start the production server
echo Starting production server...
echo.
echo The application will be available at:
echo - Local:   http://localhost:3000
echo - Network: http://%computername%:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run start

pause 