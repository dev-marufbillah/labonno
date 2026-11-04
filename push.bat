@echo off
setlocal enabledelayedexpansion
title LABONNO - one click push to GitHub
cd /d "%~dp0"

set "REPO_NAME=labonno"

echo.
echo ==================================================
echo    LABONNO  ^>  GitHub  (one click)
echo ==================================================
echo.

if not exist "package.json" (
  echo [X] Ei file-ti project folder er root e rakhen ^(jekhane package.json ache^).
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
) else (
  echo Apnar GitHub username likhun ^(jemon: maruf^) - repo hobe github.com/USERNAME/%REPO_NAME%
  echo Purono repo link o paste korte paren, dutoi cholbe.
  set /p "ANSWER=Username ba link: "
  if "!ANSWER!"=="" (
    echo [X] Kichu den nai.
    pause
    exit /b 1
  )
  echo !ANSWER! | findstr /i "http git@" >nul
  if errorlevel 1 (
    echo !ANSWER! | findstr "/" >nul
    if errorlevel 1 (
      set "REMOTE=https://github.com/!ANSWER!/%REPO_NAME%.git"
    ) else (
      set "REMOTE=https://github.com/!ANSWER!.git"
    )
  ) else (
    set "REMOTE=!ANSWER!"
  )
  echo - Remote: !REMOTE!
  git remote add origin "!REMOTE!"
)

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -q -m "LABONNO - update"
  echo - Commit hoye geche.
) else (
  echo - Notun change nei, shudhu push hobe.
)

echo - Pushing...
git push -u origin HEAD
if errorlevel 1 goto :failed

echo.
echo [OK] Hoye gechhe! Apnar code GitHub e ache.
echo.
pause
exit /b 0

:failed
echo.
echo [X] Push hoyni. Common somadhan:
echo   1^) Password diye push hoy na - Personal Access Token lagbe:
echo      GitHub ^> Settings ^> Developer settings ^> Personal access tokens ^> Tokens ^(classic^)
echo      ^> Generate new token ^> scope e "repo" tick ^> Generate ^> copy ^> password er jaygay paste.
echo   2^) Repo te age thekei file thakle:  git pull --rebase origin main   tarpor abar chalan.
echo   3^) Link bhul hole:  git remote set-url origin ^<thik link^>
echo.
pause
exit /b 1
