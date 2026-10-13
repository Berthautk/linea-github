@echo off
REM Double-cliquez sur ce fichier pour publier EasyProf sur https://easyprof-cmr.web.app (Firebase Hosting, offre gratuite Spark).
REM Prérequis (une seule fois) : Node.js LTS (https://nodejs.org) puis, dans PowerShell : npm install -g firebase-tools  et  firebase login
cd /d "%~dp0"
where firebase >nul 2>nul
if errorlevel 1 (
  echo Firebase n'est pas installe. Installez Node.js puis lancez : npm install -g firebase-tools
  pause
  exit /b 1
)
echo === Publication d'EasyProf sur le projet easyprof-cmr ===
firebase deploy --only hosting --project easyprof-cmr
echo.
echo Termine. Ouvrez https://easyprof-cmr.web.app et verifiez Configuration, onglet Annee et PIN, ligne "Version installee".
pause
