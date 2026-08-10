# 새 세션 시작 프롬프트 (아래 전체를 복사해서 붙여넣기)

---

모아계산기 프로젝트를 이어서 작업한다. 아래가 현재 상태다.

## 프로젝트
- **로컬:** `C:\Users\닥터원츠\salary-calc`
- **라이브:** https://gyesangi.vercel.app
- **GitHub:** github.com/kajam0623-rgb/moacalc (main 브랜치)
- **정체:** 한국어 계산기·운세 도구 모음 사이트. 애드센스 광고 수익 목표.

## 파일 구조 (중요)
- `hub.html` — **단일 소스**. CSS + 도구 54개의 JS registry(TOOLS 배열) + 만세력/명리 엔진이 전부 여기 있음
- `build_site.js` — hub.html에서 CSS·TOOLS를 추출해 `site/`에 멀티페이지 정적 사이트 생성. SEO 콘텐츠 맵(tags/intro/guide/faq/deep)도 여기 있음
- `verify.js` — 검증 스위트 39개 (만세력 문헌값·세율·명리 규칙·정적 린트). **로직 수정 시 반드시 실행**
- `img/char/` — 캐릭터 일러스트, `img/tool/` — 도구 히어로 배너 (파일명 `h-{도구id}.webp` 넣으면 자동 적용)
- `site/` — 빌드 산출물 (매 빌드마다 초기화됨, 직접 수정 금지)

## 배포 명령 (이 순서 그대로)
```bash
cd "C:/Users/닥터원츠/salary-calc"
node verify.js          # 39/39 통과 확인
node build_site.js
git add -A && git -c user.email="kajam0623@gmail.com" -c user.name="kajam0623-rgb" commit -q -m "메시지"
git push -q origin main
DEP=$(vercel --prod --yes 2>&1|grep -o 'https://moacalc-[a-z0-9]*-kajam0623-rgbs-projects.vercel.app'|head -1)
vercel alias set "$DEP" gyesangi.vercel.app
```
**주의:** Vercel 배포 후 `alias set`을 반드시 해야 gyesangi.vercel.app에 반영됨.

IndexNow 색인 요청(선택):
```bash
node -e 'const key="9f3c7a1e4b8d2f60a5c1e7b93d4f8a2c",h="gyesangi.vercel.app",b="https://"+h;const fs=require("fs");const u=fs.readdirSync("site").filter(f=>f.endsWith(".html")).map(f=>f==="index.html"?b+"/":b+"/"+f);fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({host:h,key,keyLocation:b+"/"+key+".txt",urlList:u})}).then(r=>console.log("IndexNow",r.status));'
```

## 완료된 것
- 도구 **54개** (계산기 + 운세 6종), 전 페이지 SEO 심화 콘텐츠(태그·3단락 해설·예시계산·주의사항·FAQ, 평균 1,773자)
- **사주 엔진**: 태양황경 직접 계산으로 절기·입춘 판정, 신강신약·억부용신·격국·신살 8종·십이운성·대운. 문헌 검증 통과(2000-01-01=기묘·병자·무오)
- 운세 6종: 사주팔자 만세력 / 오늘의 운세 / 궁합 / 2026 신년운세 / 타로(메이저 22장 전체 아트) / 이름궁합
- **이미지 89장**: 도구 히어로 37, 타로 22, 12지지 띠 12, 사주 오행 10, 카테고리·OG 8
- 디자인: 벤또 그리드, 대시보드 카드(코너 워시), 장부/콘솔 컨셉, 라이트/다크 토큰

## ★ 이번에 발견한 핵심 데이터 (전략 근거)
Firecrawl로 sellingbooster.io에서 뽑은 **실측 월간 검색량**(2026.8 네이버):

| 키워드 | 월 검색량 | CPC |
|---|---|---|
| 오늘의운세 | **5,215,700** | 430원 |
| 별자리운세 | **797,900** | 430원 |
| 오늘운세 | **532,300** | 745원 |
| 연봉계산기 | 337,000 | - |
| 퇴직금계산기 | 277,500 | - |
| 월급계산기 | 106,500 | - |
| 급여계산기 | 63,400 | - |
| 오늘의타로 | 2,470 | - |

**해석:** 운세가 계산기를 15배 압도. 게다가 운세만 CPC가 붙어 있음(= 광고주가 돈 내는 시장 = 애드센스 수익 유리). 운세는 매일 재검색되어 재방문율도 근본적으로 높음.

## 다음 작업: 운세 주력으로 재편
1. **별자리 운세** 신규 (월 79.8만) — 12별자리 오늘/이번주 운세. `img/char/st-*.webp` 12장은 이전에 지웠으니 재생성 필요
2. **띠별 운세** 신규 — 12지지 오늘 운세. `img/char/zo-*.webp` 12장 이미 있음
3. **오늘의 운세 강화** (월 521만) — 가장 공들일 페이지. 현재 일진×일간 십성 기반인데 더 깊게
4. 홈에서 운세 비중 확대

## 작업 규칙 (지켜야 함)
- 도구 추가/수정은 `hub.html`의 TOOLS 배열에서. CATS 배열은 hub.html·build_site.js **양쪽에** 있으니 둘 다 수정
- 새 헬퍼 함수 만들면 `verify.js`의 HELPERS 배열에 등록 (정적 린트가 미정의 호출을 잡음)
- 명리 로직 수정 시 `node verify.js` 필수
- 이미지 생성은 `image-gen` 스킬 사용, **1회 1장 · 약 40초**. 배치는 2장씩 끊을 것(4장 이상이면 10분 타임아웃)
- 생성 후 webp 변환: 캐릭터 520px, 히어로 1000px, quality 82~84
- 정규식으로 build_site.js 대량 편집 금지 (이전에 데이터 날린 적 있음). 라인 단위 파싱으로 할 것

## 아직 안 된 것 (사용자 계정 필요)
- 커스텀 도메인 (vercel.app 서브도메인은 SEO·애드센스 불리)
- 구글 서치콘솔 인증 (`build_site.js`의 `GSC_VERIFY`에 코드만 넣으면 전 페이지 자동 적용)
- 애드센스 승인 (`ADSENSE_CLIENT`/`ADSENSE_SLOT` 채우면 광고·ads.txt 자동 생성)

우선 현재 사이트 상태를 확인하고, 위 1~4번 순서로 진행해줘.
