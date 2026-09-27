-- 동네보살 자체 방문 통계 (D1: dongnebosal-stats). 날짜는 한국 시간 YYYY-MM-DD.
-- 적용: npx wrangler@4 d1 execute dongnebosal-stats --remote --file stats_schema.sql
CREATE TABLE IF NOT EXISTS views    (day TEXT NOT NULL, path TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, path));
-- h: 하루마다 바뀌는 일방향 값(날짜+IP+브라우저+STATS_SALT의 SHA-256 앞 16자리). IP 원문은 저장하지 않는다. 90일 뒤 지운다
CREATE TABLE IF NOT EXISTS visitors (day TEXT NOT NULL, h TEXT NOT NULL, mobile INTEGER NOT NULL, PRIMARY KEY (day, h));
CREATE TABLE IF NOT EXISTS refs     (day TEXT NOT NULL, host TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, host));
CREATE TABLE IF NOT EXISTS events   (day TEXT NOT NULL, name TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, name));
