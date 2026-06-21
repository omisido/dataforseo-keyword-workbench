@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Keyword Workbench needs Node.js, a free program used to run the local app.
  echo The Node.js download page will open now.
  echo Install the LTS version, then run this launcher again.
  start "" "https://nodejs.org/en/download"
  echo.
  pause
  exit /b 1
)

for /f %%V in ('node -p "Number(process.versions.node.split('.')[0])"') do set "NODE_MAJOR=%%V"
if %NODE_MAJOR% LSS 20 (
  echo.
  echo Keyword Workbench needs Node.js 20 or newer.
  node --version
  echo The Node.js download page will open so you can install the current LTS version.
  start "" "https://nodejs.org/en/download"
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  echo.
  echo Your private settings file has been created.
  echo Add your DataForSEO API login and password, save the file,
  echo then run this launcher again.
  start "" notepad ".env"
  echo.
  pause
  exit /b 0
)

findstr /C:"your-api-login" /C:"your-api-password" ".env" >nul
if not errorlevel 1 (
  echo.
  echo Your DataForSEO credentials still need to be added to the .env file.
  echo Replace the placeholder values, save the file, then run this launcher again.
  start "" notepad ".env"
  echo.
  pause
  exit /b 1
)

set "PORT_NUMBER=4173"
for /f "tokens=2 delims==" %%P in ('findstr /B "PORT=" ".env"') do set "PORT_NUMBER=%%P"
set "APP_URL=http://127.0.0.1:%PORT_NUMBER%"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 '%APP_URL%/api/health' | Out-Null; exit 0 } catch { exit 1 }"
if not errorlevel 1 (
  echo.
  echo Keyword Workbench is already running. Opening it in your browser.
  start "" "%APP_URL%"
  exit /b 0
)

echo.
echo Starting Keyword Workbench...
echo Keep this window open while you use the tool.
start "" /B powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%APP_URL%'"
node --env-file=.env src\server.mjs

echo.
echo Keyword Workbench has stopped.
pause
