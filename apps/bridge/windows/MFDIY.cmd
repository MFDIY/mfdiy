@echo off
rem Starts the MFDIY bridge with the Node.js that comes with it. Arguments are passed on to it.
setlocal
title MFDIY bridge
if not exist "%~dp0node\node.exe" (
  echo MFDIY can't start from inside the zip.
  echo Close this window, right-click the zip, choose Extract All, and open MFDIY.cmd in the folder it makes.
  echo.
  pause
  exit /b 1
)
"%~dp0node\node.exe" "%~dp0bridge\bridge.mjs" --static "%~dp0app" %*
echo.
echo The bridge has stopped.
pause
