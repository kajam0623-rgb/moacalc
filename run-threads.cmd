@echo off
REM 동네보살 스레드 자동 실행. 하루 두 번 — 아침(인자 없음), 저녁(--pm).
REM 윈도우 작업 스케줄러가 이 파일을 부른다.
REM 로그는 threads_auto.js가 직접 threads-log.txt에 쓴다.
REM 여기서 같은 파일로 리다이렉트하면 윈도우가 파일을 잠가 EBUSY가 난다.
REM
REM --browser: 로그인 세션으로 올린다. 크롬 창이 실제로 떠야 하므로
REM 로그인된 데스크톱 세션이 살아 있어야 한다. 잠겨 있거나 절전이면 안 돈다.
REM 토큰을 발급받으면 --browser 를 빼라. 그쪽이 약관 위험이 없다.
cd /d "%~dp0"
node threads_auto.js --publish --browser %*
