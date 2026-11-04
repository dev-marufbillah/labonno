@echo off
setlocal enabledelayedexpansion
title LABONNO - GitHub push
cd /d "%~dp0"

echo.
echo ==========================================
echo   LABONNO  ^>  GitHub push
echo ==========================================
echo.

if not exist "package.json" (
  echo [X] Ei file-ti project-er root e rakhen ^(jekhane package.json ache^).
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo [X] Git install nei. https://git-scm.com/downloads theke install kore abar chalan.
  pause
  exit /b 1
)

if not exist ".git" (
  echo - git repo toiri hocche...
  git init -q
  git branch -M main
)

set "GITMAIL="
for /f "delims=" %%i in ('git config user.email 2^>nul') do set "GITMAIL=%%i"
if "%GITMAIL%"=="" (
  git config user.email "owner@labonno.com"
  git config user.name "LABONNO Owner"
)

set "REMOTE="
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set "REMOTE=%%i"

if not "%REMOTE%"=="" (
  echo - Purono repo: %REMOTE%
  set "NEWREMOTE="
  set /p "NEWREMOTE=Notun link dile replace hobe ^(Enter ekhanei thakuk^): "
  if not "!NEWREMOTE!"=="" (
    git remote set-url origin "!NEWREMOTE!"
    set "REMOTE=!NEWREMOTE!"
  )
) else (
  echo GitHub repo link pest korun ^(example: https://github.com/username/labonno.git^)
  set /p "REMOTE=Link: "
  if "!REMOTE!"=="" (
    echo [X] Link den nai.
    pause
    exit /b 1
  )
  git remote add origin "!REMOTE!"
)

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -q -m "Update from the LABONNO studio"
  echo - Changes committed.
) else (
  echo - Notun kono change nei, shudhu push hobe.
)

echo - Pushing...
git push -u origin main
if errorlevel 1 goto :failed

echo.
echo [OK] Hoye gechhe! Code GitHub e ache:
echo      %REMOTE%
echo.
pause
exit /b 0

:failed
echo.
echo [X] Push hoyni. Common somadhan:
echo   1^) Password diye push hoy na - GitHub token chay.
echo      GitHub ^> Settings ^> Developer settings ^> Personal access tokens ^> Tokens ^(classic^)
echo      ^> Generate new token ^> scope e "repo" tick ^> Generate ^> token copy kore
echo      password er jaygay paste korun.
echo   2^) Repo te age thekei README thakle:  git pull --rebase origin main   tarpor abar chalan.
echo   3^) Link bhul hole:  git remote set-url origin ^<thik link^>
echo.
pause
exit /b 1
