# 새 세션 시작 프롬프트 (아래 전체를 복사해서 붙여넣기)

---

동네보살 프로젝트를 이어서 작업한다. 아래가 현재 상태다.

## 프로젝트

- **브랜드:** 동네보살 — 슬로건 "무료 사주는 동네보살". 무료 사주·운세 주력 + 계산기
- **로컬:** `C:\Users\닥터원츠\salary-calc`
- **라이브:** https://gyesangi.vercel.app
- **GitHub:** github.com/kajam0623-rgb/moacalc (main)
- **현재:** 도구 57개 / 페이지 58개 / verify 자동 테스트 58개 전부 통과

## 파일 구조

- `hub.html` — **단일 소스**. CSS + 도구 57개 TOOLS 배열 + 만세력·점성술 엔진이 전부 여기
- `build_site.js` — hub.html에서 CSS·TOOLS 추출해 `site/`에 정적 사이트 생성. SEO 콘텐츠 맵(intro/tags/deep/guide/faq)도 여기
- `verify.js` — 자동 테스트 58개 (만세력 문헌값·별자리 판정·세율·배열 정합성·정적 린트)
- `site/` — 빌드 산출물. 매 빌드 초기화. 직접 수정 금지
- `CONTENT-UPGRADE.md` — **다음에 할 일. 운세 콘텐츠 대개편 기술개발서**
- `DEV-ROADMAP.md` — 기술 개선 로드맵 (P0~P2 대부분 완료, P2-3만 남음)

## 이번 세션에서 할 일

`CONTENT-UPGRADE.md`를 열고 T1 → T2 → T3 → T4 순서로 완주한다.

| 태스크 | 내용 | 목표 |
|---|---|---|
| **T1** | 오늘의 운세 — 후킹 첫화면(정체성+헤드라인), 총운 480조합(십성×십이운성×합충), **용신 통합**(sjStrength 연결), 내일 미리보기 | 980자 → 1,400자+ |
| **T2** | 타로 — 포지션별 해석 66문장 + 카드 상징 스토리 22개 | 623자 → 1,200자+ |
| **T3** | 프로그래매틱 SEO — `star-*.html` 12 + `zodiac-*.html` 12 신규. **원고 4만자 집필이 본체** | 58 → 82페이지 |
| **T4** | 궁합·신년·별자리궁합에 헤드라인 패턴 이식 | 각 30분 |

T3의 프리셋 마운트(select 값 주입 + change 이벤트)는 **라이브에서 실측 검증 완료** — 사자자리·개띠 자동 렌더 확인됨. 그대로 쓰면 된다.

## 배포 (이 순서 그대로)

```bash
cd "C:/Users/닥터원츠/salary-calc"
node verify.js && node build_site.js
git add -A && git -c user.email="kajam0623@gmail.com" -c user.name="kajam0623-rgb" commit -m "메시지"
git push origin main
DEP=$(vercel --prod --yes 2>&1|grep -o 'https://moacalc-[a-z0-9]*-kajam0623-rgbs-projects.vercel.app'|head -1)
vercel alias set "$DEP" gyesangi.vercel.app
```

**주의:** `vercel alias set`을 반드시 해야 gyesangi.vercel.app에 반영된다.

IndexNow 색인 요청 (콘텐츠 변경 시):

```bash
node -e 'const key="9f3c7a1e4b8d2f60a5c1e7b93d4f8a2c",h="gyesangi.vercel.app",b="https://"+h;const fs=require("fs");const u=fs.readdirSync("site").filter(f=>f.endsWith(".html")).map(f=>f==="index.html"?b+"/":b+"/"+f);fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({host:h,key,keyLocation:b+"/"+key+".txt",urlList:u})}).then(r=>console.log("IndexNow",r.status,u.length));'
```

## 작업 규칙 (반드시 지킬 것)

1. **로직 수정 후 `node verify.js` 필수.** build_site.js가 내부에서 verify를 실행하는 **빌드 게이트**라 실패하면 Vercel 빌드까지 중단된다
2. **새 헬퍼 함수는 `verify.js`의 HELPERS 배열에 등록** (정적 린트가 미정의 호출을 잡음)
3. **헬퍼에서 `window`/`localStorage`/`gtag`는 `typeof` 가드** — 노드 검증 하네스가 깨진다
4. **`build_site.js` 정규식 대량 편집 금지.** 과거 데이터 손실 사고 있었음. 라인 단위로
5. **CATS 배열은 hub.html·build_site.js 양쪽에** 있으니 둘 다 수정
6. **이미지 생성(image-gen 스킬) 오염 주의** — 다른 세션 이미지를 물어온 사고 3회. 생성 직후 Read로 눈 확인, 고유 임시 파일명 사용. CONTENT-UPGRADE 범위엔 신규 이미지 불필요
7. **카피 원칙:** 조사 빼기·명사 종결, 고객 시점, 콜드리딩 금지(모든 문장은 계산된 명리 요소에 근거), 건강·금전 단정 표현 금지

## 검증 (매 태스크)

1. `node verify.js` — 신규 배열 길이 테스트를 **먼저 추가**하고 구현
2. `node build_site.js` — 게이트 + 청크 구문검사 통과
3. 전수 렌더 스모크 — 산출물 `t-*.js` 전부 로드→render→클릭, undefined 검출
4. 분량 측정 — todayfortune 1,400+ / tarot 1,200+
5. 반복 제거 확인 — 같은 생일 × 다른 날짜 3개 → 총운 문장 상이함
6. 배포 후 라이브에서 실제로 열어 확인 (스크린샷 또는 innerText 검사)

## 완료된 것 (참고)

- 운세 9종: 사주(1,830자)·오늘의운세·별자리운세·띠별운세·궁합·별자리궁합·신년운세·타로·이름궁합
- 생년월일 localStorage 기억, 결과 공유(share→clipboard→execCommand 3단 폴백), GA4 스캐폴드
- 코드 분할: `core.js` 21KB + `t-<id>.js` (페이지 JS gzip 47KB → 10~15KB), `?v=해시` 캐시버스팅
- 이미지 103장 (띠12·별자리12·타로22·오행10·히어로39·카테고리6), 애니 야경 톤 통일
- 신뢰 카피: 운세 페이지 상단 칩 "랜덤 문구 아님 · 태양황경 직접 계산 만세력 · 같은 입력 = 같은 결과 · 자동 검증 58개 통과" (검증 개수는 빌드 시 자동 주입)
- 접근성: 점수 바 role=meter, 타로 키보드 조작. 캐시 헤더, CLS 치수, self-XSS 봉합

## 아직 안 된 것 (사용자 계정 필요 — 최대 병목)

**순서 중요: 도메인 → 서치콘솔/네이버 → 애드센스.** vercel.app 서브도메인으로 애드센스 신청하면 승인 확률이 급락하고, 나중에 도메인 바꾸면 색인이 리셋된다.

| 항목 | 코드 반영 지점 |
|---|---|
| 커스텀 도메인 | `build_site.js`의 `DOMAIN` 상수 |
| 구글 서치콘솔 | `GSC_VERIFY` |
| 네이버 서치어드바이저 | `headExtra`에 `naver-site-verification` 메타 (상수 신설 필요) |
| GA4 | `ANALYTICS_ID` (track() 배선은 이미 완료) |
| 애드센스 | `ADSENSE_CLIENT`/`ADSENSE_SLOT` → ads.txt 자동 생성 |

---

먼저 `CONTENT-UPGRADE.md`를 읽고, T1부터 시작해줘.
