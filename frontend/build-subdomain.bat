@echo off
echo ========================================
echo Building Frontend for Subdomain
echo Target: http://smartsecurity.sinchai.ruxchai.local
echo ========================================
echo.

REM ตรวจสอบว่ามี node_modules หรือไม่
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM ตั้งค่า environment variable สำหรับ subdomain build
echo Setting environment for subdomain build...
set VUE_APP_USE_SUBDOMAIN=true
set NODE_ENV=production

REM Build production
echo Building...
call npm run build

REM บันทึก build status
set BUILD_STATUS=%ERRORLEVEL%

if %BUILD_STATUS% EQU 0 (
    echo.
    echo ========================================
    echo Build Success!
    echo ========================================
    echo Output: dist/
    echo Build Type: Subdomain ^(publicPath: /^)
    echo.
    echo Next steps:
    echo 1. Upload folder 'dist' to server path: C:\inetpub\wwwroot\smartsecruity\
    echo 2. Copy all files from dist\ to C:\inetpub\wwwroot\smartsecruity\ on server
    echo 3. Make sure IIS Binding is set to: smartsecurity.sinchai.ruxchai.local
    echo 4. Make sure hosts file has: 192.168.31.36  smartsecurity.sinchai.ruxchai.local
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
