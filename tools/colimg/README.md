# 보살 칼럼 그림 (img/col/*.webp 50장)

홈 벤토 타일 14장(`tile-<칼럼 en>.webp`)과 칼럼 글 안 큰 그림 36장(`fig-<칼럼 en>-<번호>.webp`).
어디에 어떻게 놓는지는 `content_column_img.js`(타일 순서·크기·초점, 글 안 그림의 섹션 위치·alt)가 정한다.

## 만든 법
1. `jobs.json` — 그림마다 영문 주제 문장. 공통 화풍·금지어(글자·로고 없음)는 `gen.js` 에 있다.
2. `node tools/colimg/gen.js` — Codex 이미지 생성 래퍼(`~/.claude/scripts/imggen.ps1`, gpt-image-2)로 **순차** 생성.
   병렬로 돌리면 래퍼가 생성 폴더 전/후 차이로 결과를 집어서 서로 그림을 바꿔 집는다. 장당 40~60초.
   기본 모델이 거절되면(gpt-6-sol 400) `IMGGEN_MODEL=gpt-5.6-sol` 로 고정한다(래퍼가 환경변수를 읽는다).
   원본 PNG(장당 2~3MB, 50장 ≈ 120MB)는 리포 밖 `COLIMG_RAW`(기본 `C:/tmp/colimg-raw`)에 둔다.
3. `node tools/colimg/convert.js` — 원본을 **webp 로 줄인다**(2.4MB → 20~70KB, 약 98% 감소).
   화면에 보이는 비율로 미리 잘라 안 보이는 픽셀을 버린다: 작은 타일 6:5 560px, 큰 타일 6:5 960px, 가로 타일 2.4:1 900px, 글 안 그림 16:9 1120px.
   용량 예산(작은 32KB·큰 70KB·가로 45KB·글 안 70KB)을 넘으면 품질을 q40 까지 4씩 낮추고, 그래도 넘는(금빛 입자·잔무늬가 많은) 그림은 폭을 8%씩 줄여 다시 만든다(비율은 그대로, 최대 4번).
   ffmpeg libwebp 는 `-quality` 가 아니라 **`-q:v`** 로 품질을 받는다(`-quality` 는 무시되어 같은 크기가 나온다).

## 지키는 것 (verify.js · adsense_audit.js)
- 50장이 모두 있고 진짜 webp 이며 비율·용량 예산(작은 40KB·큰 80KB·가로 60KB·글 안 80KB, 합 3.2MB 이하)을 지킨다. `img/col` 에 webp 외 파일 금지(원본 PNG 커밋 금지).
- 사이트의 화면용 `<img>` 는 전부 webp. 파비콘·PWA 아이콘·OG 카드(jpg)는 형식이 정해져 있어 예외(`<img>` 가 아니라 `<link>`/`<meta>`).

## 그림을 바꿀 때
- 한 장 다시: `jobs.json` 의 해당 문장을 고치고 `<COLIMG_RAW>/<name>.png` 를 지운 뒤 `gen.js <name>` → `convert.js <name>`.
- 타일 크기·초점 바꾸기: `content_column_img.js` 를 고치고 `convert.js --force`(원본 PNG 가 있어야 한다. 없으면 `gen.js` 로 다시 만든다).
- 칼럼을 늘릴 때: `content_column_img.js` 에 타일/그림을 더하고 `jobs.json` 에 작업을 더한다. 타일은 큰 1·가로 3·작은 10 → 4열 5줄이 빈칸 없이 차는 구성(verify 가 검사)을 깨지 않게 한다.
