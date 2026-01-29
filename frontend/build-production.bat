@echo off
echo ========================================
echo Building Frontend for Production
echo ========================================
echo.

REM ตรวจสอบว่ามี node_modules หรือไม่
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Build production
echo Building...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build Success!
    echo ========================================
    echo Output: dist/
    echo.
    echo Next steps:
    echo 1. Upload folder 'dist' to server path: C:\inetpub\wwwroot\smartsecruity\
    echo 2. Copy all files from dist\ to C:\inetpub\wwwroot\smartsecruity\ on server
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Build Failed!
    echo ========================================
    pause
    exit /b 1
)

pause
