@echo off
REM 매일 아침 동네보살 스레드 자동 실행.
REM 윈도우 작업 스케줄러가 이 파일을 부른다. 앱이 꺼져 있어도 돈다.
REM 로그는 threads_auto.js가 직접 threads-log.txt에 쓴다.
REM 여기서 같은 파일로 리다이렉트하면 윈도우가 파일을 잠가 EBUSY가 난다.
cd /d "%~dp0"
node threads_auto.js --publish
