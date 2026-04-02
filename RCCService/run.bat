@echo off
:loop
cd /d C:\Users\lannu\Desktop\ecs\services\RCCService
RCCService.exe -Console -verbose

echo RCC stopped. Restarting in 5 seconds...
timeout /t 5 >nul
goto loop
