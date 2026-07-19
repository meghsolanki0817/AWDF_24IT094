@echo off
cd /d "%~dp0"
set "GITEXE=%ProgramFiles%\Git\cmd\git.exe"
if not exist "%GITEXE%" (
    echo Git executable not found at %GITEXE%
    echo Please install Git or update the script path.
    pause
    exit /b 1
)
"%GITEXE%" add .
set /p commitMsg=Commit message (default: Update portfolio): 
if "%commitMsg%"=="" set commitMsg=Update portfolio
"%GITEXE%" commit -m "%commitMsg%"
"%GITEXE%" push -u origin main
