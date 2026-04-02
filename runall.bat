@echo off
set "BASE=%~dp0"
set "BASE=%BASE:~0,-1%"

cd /d "%BASE%"
taskkill /f /im RCCService.exe

wt ^
new-tab --title "2016-roblox-main" cmd /k "cd /d \"%BASE%\2016-roblox-main\" && call run.bat" ^
; new-tab --title "RCCService" cmd /k "cd /d \"%BASE%\RCCService\" && call run.bat" ^
; new-tab --title "renderer" cmd /k "cd /d \"%BASE%\renderer\" && call run.bat" ^
; new-tab --title "AssetValidationServiceV2" cmd /k "cd /d \"%BASE%\AssetValidationServiceV2\" && call run.bat" ^
; new-tab --title "Roblox.Website" cmd /k "cd /d \"%BASE%\Roblox\Roblox.Website\" && call run.bat" ^
; new-tab --title "Redis" cmd /k "cd /d \"%BASE%\" && redis-server.exe"
