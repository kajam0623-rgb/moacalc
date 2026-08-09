/* hub.html(단일 SPA) → 멀티페이지 정적 사이트(site/) 생성.
   각 도구 = 독립 HTML(고유 title/description/h1/본문) + 공유 style.css/app.js + 내부링크 + sitemap.
   실행: node build_site.js   결과: site/  (그대로 Vercel/Netlify에 배포) */
const fs = require("fs"), path = require("path");
const DIR = __dirname, OUT = path.join(DIR, "site");
fs.mkdirSync(OUT, { recursive: true });

const DOMAIN = "https://gyesangi.vercel.app"; // 배포 도메인
// ↓ 승인/발급 후 값만 채우고 `node build_site.js` 재실행하면 전 페이지에 자동 적용됩니다.
const GSC_VERIFY = "";      // 구글 서치콘솔 'HTML 태그' 인증코드의 content 값
const ADSENSE_CLIENT = "";  // 애드센스 게시자 ID (예: ca-pub-1234567890123456)
const ADSENSE_SLOT = "";    // 애드센스 광고 단위 슬롯 ID
const INDEXNOW_KEY = "9f3c7a1e4b8d2f60a5c1e7b93d4f8a2c"; // IndexNow(빙·네이버 등) 색인 요청 키
const src = fs.readFileSync(path.join(DIR, "hub.html"), "utf8");

// --- 원본에서 CSS / 헬퍼 / TOOLS 추출 (재작성 없이 재사용) ---
const css = src.match(/<style>([\s\S]*?)<\/style>/)[1].trim();
const inner = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const helpers = inner.slice(inner.indexOf("var num="), inner.indexOf("var TOOLS="));
const tStart = inner.indexOf("var TOOLS=");
const toolsArr = inner.slice(tStart, inner.indexOf("\n  ];", tStart) + "\n  ];".length);

// 도구 메타 파싱
const CATS = ["급여·노동","금융","부동산·세금","생활","변환·기타","재미·운세"];
const meta = [];
const re = /\{id:"([^"]+)",cat:"([^"]+)",icon:"[^"]*",name:"([^"]+)",desc:"([^"]+)"/g;
let m; while ((m = re.exec(toolsArr))) meta.push({ id:m[1], cat:m[2], name:m[3], desc:m[4] });

// 페이지별 고유 소개문 (SEO 본문)
const intro = {
salary:"연봉이나 월급의 세전 금액을 입력하면 국민연금·건강보험·장기요양·고용보험 등 4대보험과 소득세를 제외한 월 실수령액을 바로 확인합니다. 2026년 최신 요율 기준입니다.",
severance:"입사일과 퇴사일, 평균임금을 입력하면 근로기준법에 따른 예상 퇴직금을 계산합니다. 계속근로 1년 이상부터 지급 대상입니다.",
annual:"미사용 연차 일수와 통상임금으로 받을 수 있는 연차수당을 계산합니다. 시간당 통상임금 × 8시간 × 미사용일수로 산정됩니다.",
hourly:"시급과 주 근로시간을 입력해 예상 월급과 연봉을 환산합니다. 2026년 최저시급 10,320원 기준 주휴수당도 반영할 수 있습니다.",
freelance:"프리랜서 계약금액에서 3.3%(소득세 3%+지방소득세 0.3%)를 원천징수한 실수령액을 계산합니다. 5월 종합소득세 신고 시 환급이 발생할 수 있습니다.",
loan:"대출 원금·이자율·기간을 입력하면 원리금균등 방식의 월 상환액과 총 이자를 계산합니다.",
savings:"매달 납입하는 적금의 만기 수령액을 이자소득세 15.4%를 반영해 계산합니다.",
deposit:"목돈을 예치하는 예금의 만기 수령액을 월복리와 이자소득세 기준으로 계산합니다.",
loanequal:"원금균등 상환 방식의 첫 달·마지막 달 상환액과 총 이자를 계산합니다. 매달 원금은 같고 이자는 줄어듭니다.",
dsr:"연 소득 대비 원리금 상환 비율(DSR)을 계산합니다. 은행권은 대개 40% 이내로 규제합니다.",
prepay:"대출을 만기 전에 갚을 때 발생하는 중도상환수수료를 잔여기간 기준으로 계산합니다.",
compound:"원금과 연이율, 기간을 입력하면 복리로 불어난 미래 금액과 수익을 계산합니다.",
ltv:"담보 가격과 LTV 비율로 최대 대출 한도를 계산합니다. 실제 한도는 규제와 소득에 따라 달라집니다.",
vat:"공급가액 또는 합계금액을 기준으로 부가가치세(10%)를 계산합니다.",
acqtax:"주택 취득가액을 입력하면 유상취득 기준 취득세율과 세액을 계산합니다.",
brokerfee:"매매 또는 전월세 거래금액에 대한 부동산 중개보수 상한을 계산합니다.",
pyeong:"평과 제곱미터(㎡)를 서로 변환합니다. 1평은 약 3.3058㎡입니다.",
jeonse:"전세 보증금과 전환율로 환산 월세를 계산합니다.",
age:"생년월일을 입력하면 만 나이와 태어난 지 며칠인지 계산합니다.",
dday:"두 날짜 사이의 남은 일수 또는 지난 일수(D-day)를 계산합니다.",
datecalc:"기준일에서 일정 일수를 더하거나 뺀 날짜와 요일을 계산합니다.",
worktime:"출근·퇴근 시각과 휴게시간으로 실 근무시간을 계산합니다.",
duedate:"마지막 생리 시작일을 기준으로 네겔레 법칙(+280일)에 따른 출산 예정일을 추정합니다. 병원 확인이 필요합니다.",
smoke:"하루 흡연량과 담뱃값으로 월·연·10년 흡연 비용을 계산합니다.",
charcount:"텍스트의 공백 포함/제외 글자수, 단어 수, 바이트, 줄 수를 세어줍니다. 자기소개서·블로그 글자수 확인에 유용합니다.",
bmi:"키와 몸무게로 체질량지수(BMI)와 표준체중을 계산합니다.",
discount:"정가와 할인율로 할인가와 할인 금액을 계산합니다.",
percent:"A는 B의 몇 %인지, B의 A%는 얼마인지, 증감율은 몇 %인지 계산합니다.",
unit:"길이·무게·온도 단위를 서로 변환합니다.",
password:"길이와 문자 종류를 선택해 안전한 랜덤 비밀번호를 생성합니다.",
weeklyholiday:"주 근로시간과 시급으로 주휴수당을 계산합니다. 주 15시간 이상 개근 시 지급됩니다.",
insurance4:"월 급여 기준 국민연금·건강보험·장기요양·고용보험 등 4대보험 근로자 부담액을 계산합니다.",
lotto:"1부터 45까지 중복 없는 로또 번호 6개를 무작위로 생성합니다.",
draw:"입력한 후보 중에서 무작위로 당첨자를 뽑거나 순서를 정합니다.",
ladder:"참가자와 결과를 입력하면 사다리타기로 공평하게 짝을 정해줍니다. 청소 당번, 내기, 순서 정하기에 좋습니다.",
anniversary:"사귄 날 등 시작일을 기준으로 오늘까지 며칠째인지, 100일·200일·1주년 등 기념일 날짜를 계산합니다.",
fire:"연 지출, 현재 자산, 연 저축액, 수익률로 경제적 자유(FIRE)까지 걸리는 기간을 계산합니다. 목표는 연 지출의 25배입니다.",
lottoodds:"구매 게임 수를 넣으면 로또 1등 당첨 확률과 기대값을 보여줍니다.",
zodiac:"생년월일로 띠와 별자리, 세는 나이를 확인합니다.",
installment:"할부 금액과 개월, 수수료율로 카드 할부에 붙는 총 수수료와 월 납부액을 계산합니다.",
savegoal:"목표 금액과 기간을 넣으면 매달 얼마씩 저축해야 하는지 계산합니다.",
realreturn:"명목 수익률에서 물가상승률을 반영한 실질 수익률을 계산합니다.",
incometax:"과세표준을 입력하면 2026년 세율(6~45%)로 종합소득세 산출세액과 지방소득세를 계산합니다.",
rentyield:"매매가·보증금·월세로 부동산 임대수익률(연 %)을 계산합니다.",
weekday:"특정 날짜가 무슨 요일인지 확인합니다.",
water:"체중을 기준으로 하루 권장 수분 섭취량을 계산합니다.",
average:"여러 숫자의 합계·평균·최댓값·최솟값을 한 번에 계산합니다.",
gpa:"과목별 학점과 평점을 입력해 평점 평균(GPA)을 계산합니다.",
radix:"2·8·10·16진수를 서로 변환합니다.",
dice:"동전 던지기와 주사위 굴리기를 무작위로 실행합니다.",
fx:"외화 금액과 환율을 입력해 원화로 환산합니다. 실시간 환율은 직접 입력합니다.",
simpleinterest:"원금·이율·기간으로 단리 이자와 원리금 합계를 계산합니다.",
caffeine:"음료 종류와 잔 수로 하루 카페인 섭취량을 계산하고 권장 한도와 비교합니다.",
sleep:"기상 시각을 기준으로 90분 수면주기에 맞춘 추천 취침 시각을 알려줍니다.",
datasize:"KB·MB·GB·TB 데이터 용량을 서로 변환합니다.",
roman:"아라비아 숫자(1~3999)를 로마 숫자로 변환합니다.",
agekind:"생년월일로 만 나이·세는 나이·연 나이를 한 번에 보여줍니다.",
calorie:"운동 종류와 시간, 체중으로 소모 칼로리를 계산합니다.",
bmr:"성별·키·몸무게·나이로 기초대사량(BMR)과 하루 권장 칼로리를 계산합니다.",
randnum:"지정한 범위에서 무작위 숫자를 원하는 개수만큼 뽑습니다.",
saju:"생년월일과 시각으로 사주팔자(연주·월주·일주·시주)를 뽑고 오행 분포, 십성, 대운까지 무료로 풀이합니다. 절기(태양황경) 기반 만세력과 진태양시 보정을 적용한 정통 방식입니다.",
tarot:"마음속 질문을 떠올리고 3장의 타로 카드를 뒤집어 과거·현재·미래의 흐름을 읽습니다. 메이저 아르카나 22장, 정·역방향 해석.",
todayfortune:"생년월일만 넣으면 오늘의 일진(일 간지)과 내 일간의 십성 관계로 오늘의 총운·재물운·조언을 풀이합니다. 매일 자정 일진이 바뀌는 정통 명리 방식 무료 운세.",
gunghap:"두 사람의 생년월일로 일간 천간합, 띠·일지의 삼합·육합·충, 오행 보완까지 종합한 무료 사주 궁합을 봅니다.",
};

const guide = {
salary:["실수령액 = 세전 급여 − (4대보험 + 소득세 + 지방소득세).","비과세 항목(식대 월 20만원 등)은 4대보험·소득세 계산에서 제외됩니다.","부양가족이 많을수록 소득세가 줄어 실수령액이 늘어납니다."],
severance:["퇴직금 = 1일 평균임금 × 30 × (재직일수 ÷ 365).","평균임금은 퇴직 전 3개월 임금총액을 그 기간 일수로 나눈 값입니다.","계속근로 1년 미만은 법정 지급 대상이 아닙니다."],
annual:["연차수당 = 시간당 통상임금 × 8시간 × 미사용 연차일수.","시간당 통상임금은 보통 월 통상임금 ÷ 209로 계산합니다."],
hourly:["2026년 최저시급은 10,320원, 주 40시간 기준 월 2,156,880원입니다.","주 15시간 이상 근무 시 주휴수당이 더해집니다."],
freelance:["3.3% = 소득세 3% + 지방소득세 0.3%.","5월 종합소득세 신고 때 실제 세금이 정산되어 대부분 일부를 환급받습니다."],
weeklyholiday:["주 15시간 이상 개근하면 하루치 유급휴일(주휴)이 발생합니다.","주휴수당 = (주 근로시간 ÷ 40, 최대 1) × 8 × 시급."],
insurance4:["국민연금 4.75%, 건강보험 3.595%, 장기요양(건보료의 13.14%), 고용보험 0.9%.","사업주도 대부분 같은 금액을 부담하며 고용·산재는 더 냅니다."],
loan:["원리금균등은 매달 갚는 금액이 같아 계획이 쉽습니다.","금리가 같아도 상환기간이 길수록 총 이자는 늘어납니다."],
loanequal:["원금균등은 매달 원금이 같고 이자는 줄어 상환액이 점점 감소합니다.","총 이자는 원리금균등보다 대체로 적습니다."],
dsr:["DSR = 연 원리금상환액 ÷ 연소득 × 100.","은행권은 보통 DSR 40% 이내에서만 대출을 내줍니다."],
deposit:["예금은 목돈을 한 번에 예치하는 상품입니다.","이자에는 15.4%의 이자소득세가 원천징수됩니다."],
compound:["복리는 이자에 다시 이자가 붙어 시간이 갈수록 가속됩니다.","미래가치 = 원금 × (1 + 이율)^기간."],
vat:["부가가치세율은 10%입니다.","합계금액 기준이면 1.1로 나눠 공급가액을 구합니다."],
acqtax:["6억 이하 1%, 6~9억 1~3% 구간, 9억 초과 3%(1주택 기준).","지방교육세·농어촌특별세가 별도로 소액 부과됩니다."],
brokerfee:["거래금액 구간별 법정 상한요율 내에서 협의합니다.","매매와 임대차의 요율표가 다릅니다."],
charcount:["공백 포함/제외 글자수와 바이트 수를 함께 보여줍니다.","자기소개서·리포트 글자 제한 확인에 쓰입니다."],
savings:["적금은 매달 일정액을 넣어 만기에 원금+이자를 받는 상품입니다.","이자는 회차별 예치 기간이 달라 단리로 계산됩니다(이자소득세 15.4%)."],
prepay:["중도상환수수료 = 상환금액 × 수수료율 × (잔여기간 ÷ 대출총기간).","보통 대출 3년이 지나면 면제됩니다."],
ltv:["LTV(주택담보인정비율)로 담보가 대비 최대 대출액을 정합니다.","실제 한도는 DSR·지역 규제로 더 낮아질 수 있습니다."],
fire:["FIRE 목표 자산 = 연 지출 × 25 (연 4% 인출 가정).","저축액과 투자수익률이 높을수록 은퇴 시점이 빨라집니다."],
jeonse:["환산 월세 = 보증금 × 전환율 ÷ 12.","법정 전환율 상한은 기준금리에 연동됩니다."],
pyeong:["1평 = 3.305785㎡.","분양·부동산 면적을 평과 ㎡로 빠르게 변환합니다."],
age:["만 나이는 생일이 지났는지에 따라 세는 나이보다 1~2살 적습니다.","2023년부터 법적·행정 나이는 만 나이로 통일되었습니다."],
dday:["두 날짜의 차이를 일수로 계산합니다.","시험·기념일까지 남은 날을 셀 때 씁니다."],
datecalc:["기준일에 일수를 더하거나 빼 특정 날짜와 요일을 찾습니다.","계약 만료일, 예정일 계산에 유용합니다."],
worktime:["실 근무시간 = 퇴근 − 출근 − 휴게시간.","야간에 걸치면 24시간을 넘겨 자동 보정합니다."],
duedate:["출산 예정일 = 마지막 생리 시작일 + 280일(네겔레 법칙).","개인차가 있어 병원 초음파로 확인해야 합니다."],
smoke:["하루 흡연 비용 = (하루 개비 ÷ 20) × 갑값.","10년이면 생각보다 큰 금액이 됩니다."],
anniversary:["시작일을 1일째로 세어 오늘까지 며칠인지 계산합니다.","100일·200일·1주년 등 주요 기념일 날짜를 알려줍니다."],
bmi:["BMI = 몸무게(kg) ÷ 키(m)².","18.5 미만 저체중, 23 미만 정상, 25 이상 비만(아시아 기준)."],
discount:["할인가 = 정가 × (1 − 할인율).","할인 금액도 함께 보여줍니다."],
percent:["A는 B의 몇 %, B의 A%, 증감율 세 가지를 계산합니다.","일상에서 가장 많이 쓰는 비율 계산입니다."],
unit:["길이·무게·온도를 여러 단위로 한 번에 변환합니다.","기준 값 하나만 넣으면 됩니다."],
password:["대·소문자, 숫자, 기호를 섞어 무작위 비밀번호를 만듭니다.","길수록, 문자 종류가 많을수록 안전합니다."],
lotto:["1~45 중 중복 없는 6개를 무작위로 뽑습니다.","여러 번 눌러 새 조합을 받을 수 있습니다."],
draw:["후보를 넣고 무작위로 당첨자·순서를 정합니다.","내기·당번 정하기에 공평합니다."],
ladder:["참가자와 결과 수를 같게 넣고 사다리를 탑니다.","가로줄이 무작위로 생겨 공평하게 짝지어집니다."],
lottoodds:["로또 1등 확률은 8,145,060분의 1(45C6).","게임 수를 늘려도 당첨 확률은 거의 변하지 않습니다."],
zodiac:["생년으로 12간지 띠, 생일로 별자리를 정합니다.","별자리는 양력 날짜 기준입니다."],
installment:["잔액이 줄어드는 만큼 매달 수수료가 조금씩 줄어듭니다.","무이자 할부가 아니면 총 결제액이 원금보다 커집니다."],
savegoal:["이율이 있으면 복리로 계산해 필요한 월 저축액이 조금 줄어듭니다.","이율 0이면 목표금액을 개월로 나눕니다."],
realreturn:["실질 수익률 = (1+명목)/(1+물가) − 1.","물가가 수익률보다 높으면 실질 수익은 마이너스입니다."],
incometax:["과세표준 구간별로 6%부터 45%까지 누진세율이 적용됩니다.","지방소득세는 산출세액의 10%가 더 붙습니다."],
rentyield:["수익률 = 연 월세 ÷ 실투자금(매매가−보증금) × 100.","취득세·관리비·공실은 반영되지 않은 단순 수익률입니다."],
weekday:["날짜만 넣으면 요일을 바로 알려줍니다.","과거·미래 어떤 날짜든 계산됩니다."],
water:["하루 권장량 = 체중(kg) × 33ml.","운동을 하거나 더운 날엔 더 마시는 것이 좋습니다."],
average:["쉼표나 줄바꿈으로 구분해 여러 숫자를 넣습니다.","합계·평균·최대·최소·개수를 함께 보여줍니다."],
gpa:["GPA = Σ(학점×평점) ÷ Σ학점.","학점이 큰 과목의 평점이 GPA에 더 크게 반영됩니다."],
radix:["2진·8진·10진·16진을 지원합니다.","입력 진법을 고르고 값을 넣으면 나머지로 변환됩니다."],
dice:["동전은 앞·뒤, 주사위는 1~6이 무작위로 나옵니다.","내기·순서 정하기에 쓸 수 있습니다."],
fx:["원화 = 외화 금액 × 환율.","환율은 매일 바뀌므로 은행·포털 값을 확인해 입력하세요."],
simpleinterest:["단리는 원금에만 이자가 붙습니다.","복리와 달리 이자에 이자가 붙지 않아 장기일수록 차이가 큽니다."],
caffeine:["아메리카노 한 잔은 약 150mg입니다.","성인 하루 권장 한도는 400mg, 임산부는 200mg입니다."],
sleep:["수면은 약 90분 주기로 반복됩니다.","주기가 끝날 때 깨면 덜 피곤합니다."],
datasize:["1KB=1024B, 1MB=1024KB 식의 2진 기준입니다.","저장장치 표기(1000 기준)와는 조금 다를 수 있습니다."],
roman:["I=1, V=5, X=10, L=50, C=100, D=500, M=1000.","4·9는 IV·IX처럼 빼서 표기합니다."],
agekind:["만 나이는 생일이 지나야 한 살 늘어납니다.","세는 나이는 태어나면 1살, 해가 바뀌면 늘어납니다."],
calorie:["소모 = MET × 체중(kg) × 시간(h) × 1.05.","운동 강도(MET)가 높을수록 많이 소모합니다."],
bmr:["BMR은 가만히 있어도 쓰는 최소 에너지입니다.","활동량을 곱하면 하루 총 필요 칼로리가 나옵니다."],
randnum:["최소·최대 범위에서 균등하게 뽑습니다.","추첨·자리 배정 등에 쓸 수 있습니다."],
saju:["사주팔자는 태어난 연·월·일·시를 각각 천간+지지 두 글자로 나타낸 여덟 글자입니다.","연주는 입춘, 월주는 절기 기준으로 바뀌며, 이 계산기는 태양황경을 직접 계산해 절기를 판정합니다.","일간(일주의 천간)이 사주의 주인공이며, 나머지 글자와의 관계가 십성입니다.","대운은 10년 주기의 큰 흐름으로, 성별과 연간의 음양에 따라 순행·역행이 정해집니다."],
tarot:["타로는 정해진 답이 아니라 지금 상황을 비추는 거울에 가깝습니다.","질문을 구체적으로 떠올릴수록 해석이 선명해집니다.","역방향은 나쁜 뜻이 아니라 같은 에너지의 그림자나 지연을 뜻합니다."],
todayfortune:["매일의 날짜에도 간지(일진)가 있습니다. 오늘의 일진과 내 일간의 관계(십성)가 그날의 기운입니다.","재성의 날은 재물이, 관성의 날은 일과 책임이, 인성의 날은 배움과 귀인이 움직입니다.","내 일지와 오늘 지지의 합·충에 따라 흐름이 더해지거나 흔들립니다."],
gunghap:["일간 천간합(갑기·을경·병신·정임·무계)은 명리에서 가장 강한 끌림으로 봅니다.","띠의 삼합·육합은 조화를, 충은 강한 자극과 충돌을 뜻합니다.","서로 없는 오행을 채워주는 관계는 함께 있을 때 완성되는 보완형입니다."],
};

const faq = {
salary:[["실수령액이 왜 사람마다 다른가요?","부양가족 수, 비과세 항목, 급여 수준에 따라 소득세와 4대보험이 달라지기 때문입니다."],["2026년 4대보험 요율은 얼마인가요?","국민연금 4.75%, 건강보험 3.595%, 장기요양은 건강보험료의 13.14%, 고용보험 0.9%입니다(근로자 부담)."]],
severance:[["퇴직금은 언제부터 받나요?","계속 근로기간이 1년 이상이면 지급 대상입니다."],["세금이 떼이나요?","퇴직소득세가 별도로 부과되며 근속연수가 길수록 세부담이 줄어듭니다."]],
annual:[["미사용 연차는 어떻게 되나요?","사용하지 못한 연차는 연차수당으로 보상받을 수 있습니다."],["통상임금이 뭔가요?","정기적·일률적으로 지급되는 임금으로, 시간당 통상임금이 수당 계산의 기준입니다."]],
hourly:[["주휴수당은 언제 붙나요?","주 15시간 이상 근무하고 개근하면 발생합니다."],["2026년 최저임금은 얼마인가요?","시급 10,320원, 주 40시간 기준 월 2,156,880원입니다."]],
freelance:[["3.3%는 무슨 세금인가요?","소득세 3%와 지방소득세 0.3%를 미리 떼는 원천징수입니다."],["환급받을 수 있나요?","네, 5월 종합소득세 신고 때 정산해 대부분 일부를 환급받습니다."]],
weeklyholiday:[["주휴수당은 누구나 받나요?","주 15시간 이상 근무하고 소정근로일을 개근한 근로자가 대상입니다."],["단시간 알바도 받나요?","주 15시간 이상이면 근무시간에 비례해 받습니다."]],
insurance4:[["사업주도 같이 내나요?","국민연금·건강보험은 근로자와 사업주가 절반씩, 고용·산재는 사업주가 더 부담합니다."],["무엇을 기준으로 계산하나요?","비과세를 제외한 과세 대상 월 급여를 기준으로 합니다."]],
loan:[["원리금균등이 뭔가요?","매달 같은 금액(원금+이자)을 갚는 방식입니다."],["총 이자를 줄이려면요?","상환기간을 줄이거나 금리가 낮은 상품을 택하면 됩니다."]],
loanequal:[["원금균등과 원리금균등 차이는요?","원금균등은 매달 원금이 같아 초반 상환액이 크지만 총 이자는 적습니다."],["어떤 게 유리한가요?","여유가 있으면 총 이자가 적은 원금균등이 유리합니다."]],
dsr:[["DSR 40%는 무슨 뜻인가요?","연소득의 40%를 넘는 원리금 상환이면 대출이 제한된다는 뜻입니다."],["DTI와 다른가요?","DSR은 모든 대출의 원리금을, DTI는 주택담보대출 위주로 봅니다."]],
deposit:[["예금과 적금 차이는요?","예금은 목돈을 한 번에, 적금은 매달 나눠 넣습니다."],["세금은 얼마인가요?","이자에 15.4%의 이자소득세가 부과됩니다."]],
compound:[["복리가 왜 강력한가요?","이자에 이자가 붙어 시간이 지날수록 증가 속도가 빨라집니다."],["72의 법칙이 뭔가요?","72를 수익률로 나누면 원금이 두 배 되는 대략의 연수가 나옵니다."]],
vat:[["부가세율은 몇 %인가요?","10%입니다."],["합계에서 부가세를 어떻게 빼나요?","합계를 1.1로 나누면 공급가액, 나머지가 부가세입니다."]],
acqtax:[["취득세는 얼마인가요?","1주택 기준 6억 이하 1%, 9억 초과 3%이며 중간 구간은 1~3%입니다."],["다주택이면 더 내나요?","조정대상지역·다주택은 중과세율이 적용될 수 있습니다."]],
brokerfee:[["중개수수료는 고정인가요?","법정 상한요율 안에서 협의로 정합니다."],["부가세가 붙나요?","중개사가 일반과세자면 부가세가 별도로 붙을 수 있습니다."]],
charcount:[["공백 포함과 제외 차이는요?","공백(띄어쓰기·줄바꿈)을 글자수에 넣느냐 빼느냐의 차이입니다."],["바이트 수는 왜 보나요?","한글은 보통 2바이트라 바이트 제한이 있는 입력창에서 필요합니다."]],
savings:[["적금과 예금 차이는요?","적금은 매달 나눠 넣고, 예금은 목돈을 한 번에 예치합니다."],["이자에 세금이 붙나요?","이자에 15.4% 이자소득세가 원천징수됩니다."]],
prepay:[["중도상환수수료를 안 내려면요?","보통 대출 3년이 지나면 면제됩니다."],["수수료율은 어디서 확인하나요?","대출 약정서나 은행 앱에서 확인할 수 있습니다."]],
ltv:[["LTV가 뭔가요?","집값 대비 빌릴 수 있는 최대 비율입니다."],["LTV만 보면 되나요?","아니요, DSR 규제로 실제 한도가 더 낮을 수 있습니다."]],
fire:[["FIRE가 뭔가요?","일찍 은퇴해 경제적 자유를 얻는 것으로, 보통 연 지출의 25배 자산이 목표입니다."],["왜 25배인가요?","연 4%씩 인출해도 자산이 유지된다는 4% 법칙에서 나옵니다."]],
jeonse:[["전월세 전환율이 뭔가요?","보증금을 월세로 바꿀 때 적용하는 연 이율입니다."],["상한이 있나요?","법정 상한은 기준금리에 연동되어 정해집니다."]],
pyeong:[["1평은 몇 ㎡인가요?","약 3.31㎡입니다."],["전용면적과 공급면적이 다른가요?","네, 전용면적이 실제 사용 공간이고 공급면적은 공용부가 포함됩니다."]],
age:[["만 나이와 세는 나이 차이는요?","만 나이는 생일 기준이라 세는 나이보다 1~2살 적습니다."],["언제부터 만 나이인가요?","2023년 6월부터 법적·행정 나이가 만 나이로 통일됐습니다."]],
dday:[["D-day는 어떻게 계산하나요?","목표일에서 오늘을 빼 남은 일수를 구합니다."],["당일은 어떻게 표시되나요?","당일은 D-DAY로 표시됩니다."]],
datecalc:[["며칠 후 날짜를 알 수 있나요?","기준일에 일수를 더해 요일까지 알려줍니다."],["과거 날짜도 되나요?","네, 방향을 '전(−)'으로 두면 됩니다."]],
worktime:[["휴게시간도 근무로 치나요?","아니요, 휴게시간은 근무시간에서 제외됩니다."],["야간 근무도 계산되나요?","퇴근이 다음날이면 24시간을 더해 자동 계산합니다."]],
duedate:[["예정일은 정확한가요?","네겔레 법칙 추정치라 실제와 며칠 차이날 수 있습니다."],["생리주기가 불규칙하면요?","병원 초음파 검사로 확인하는 것이 정확합니다."]],
smoke:[["담뱃값이 오르면요?","갑값을 바꿔 다시 계산하면 됩니다."],["끊으면 얼마 아끼나요?","계산된 10년 비용이 그대로 절약액이 됩니다."]],
anniversary:[["며칠째로 세나요?","시작일을 1일째로 계산합니다."],["1주년은 며칠인가요?","시작일 기준 365일째입니다."]],
bmi:[["정상 BMI 범위는요?","아시아 기준 18.5~23 미만이 정상입니다."],["BMI만으로 충분한가요?","근육량은 반영되지 않아 참고용으로 보는 게 좋습니다."]],
discount:[["할인가는 어떻게 구하나요?","정가에 (1−할인율)을 곱합니다."],["이중 할인은요?","각 할인율을 차례로 적용해 계산하세요."]],
percent:[["증감율은 어떻게 구하나요?","(나중값 − 처음값) ÷ 처음값 × 100입니다."],["할인율도 되나요?","네, 증감 % 모드로 확인할 수 있습니다."]],
unit:[["어떤 단위를 변환하나요?","길이·무게·온도를 지원합니다."],["평 변환도 있나요?","평↔㎡는 별도의 평수 변환 계산기를 이용하세요."]],
password:[["안전한 길이는요?","12자 이상에 여러 문자 종류를 섞는 것이 좋습니다."],["같은 걸 여러 곳에 써도 되나요?","아니요, 사이트마다 다르게 쓰는 것이 안전합니다."]],
lotto:[["번호는 어떻게 뽑나요?","1~45 중 중복 없이 6개를 무작위로 생성합니다."],["당첨을 보장하나요?","아니요, 재미로만 이용하세요."]],
draw:[["몇 명까지 뽑나요?","후보 수 안에서 원하는 인원을 뽑을 수 있습니다."],["공정한가요?","무작위 셔플이라 순서 편향이 없습니다."]],
ladder:[["참가자와 결과 수가 달라도 되나요?","같아야 정상 동작합니다."],["매번 결과가 같나요?","아니요, 누를 때마다 사다리가 새로 그려집니다."]],
lottoodds:[["1등 확률이 얼마인가요?","8,145,060분의 1입니다."],["많이 사면 확률이 오르나요?","거의 오르지 않습니다. 재미로만 보세요."]],
zodiac:[["띠는 무엇으로 정하나요?","태어난 해의 12간지로 정합니다."],["별자리는 음력인가요?","아니요, 양력 생일 기준입니다."]],
installment:[["무이자 할부도 수수료가 있나요?","무이자면 수수료율을 0으로 두면 됩니다."],["실제 카드 청구와 다를 수 있나요?","네, 카드사마다 계산 방식이 조금씩 달라 근사치입니다."]],
savegoal:[["이율을 모르면요?","0으로 두면 목표금액을 기간으로 나눈 단순 저축액이 나옵니다."],["매달 같은 금액인가요?","네, 매달 동일 금액 저축을 가정합니다."]],
realreturn:[["실질 수익률이 왜 중요한가요?","돈의 실제 구매력 변화를 보여주기 때문입니다."],["마이너스가 나올 수 있나요?","네, 물가상승률이 수익률보다 높으면 실질 수익은 마이너스입니다."]],
incometax:[["과세표준이 뭔가요?","각종 공제를 뺀, 세율을 곱하는 기준 금액입니다."],["실제 낼 세금과 같나요?","세액공제 전 산출세액이라 실제 결정세액은 더 적을 수 있습니다."]],
rentyield:[["보증금은 왜 빼나요?","돌려줄 돈이라 실제 투자금에서 제외합니다."],["세금도 반영되나요?","아니요, 세전 단순 수익률입니다."]],
weekday:[["과거 날짜도 되나요?","네, 어떤 날짜든 요일을 계산합니다."],["무슨 기준인가요?","양력(그레고리력) 기준입니다."]],
water:[["하루 얼마가 적당한가요?","보통 체중 1kg당 33ml 정도가 권장됩니다."],["커피도 포함인가요?","카페인 음료는 이뇨작용이 있어 물과 별개로 보는 것이 좋습니다."]],
average:[["소수도 되나요?","네, 소수점 숫자도 계산됩니다."],["개수 제한이 있나요?","없습니다. 원하는 만큼 넣으세요."]],
gpa:[["4.5 만점만 되나요?","입력한 평점을 그대로 가중평균하므로 4.3·4.0 만점도 됩니다."],["학점은 어떻게 넣나요?","한 줄에 '학점,평점' 형식으로 과목마다 입력합니다."]],
radix:[["16진수 A~F도 되나요?","네, 입력 진법을 16진으로 두면 됩니다."],["음수도 되나요?","기본 정수 변환만 지원합니다."]],
dice:[["결과가 정말 무작위인가요?","브라우저 난수를 사용해 매번 무작위로 나옵니다."],["여러 개 굴릴 수 있나요?","버튼을 여러 번 누르면 됩니다."]],
fx:[["실시간 환율인가요?","아니요, 환율은 직접 입력하는 방식입니다."],["여러 통화가 되나요?","환율만 바꿔 넣으면 어떤 통화든 계산됩니다."]],
simpleinterest:[["단리와 복리 차이는요?","단리는 원금에만, 복리는 이자에도 이자가 붙습니다."],["세금은 반영되나요?","아니요, 세전 이자입니다."]],
caffeine:[["하루 얼마까지 괜찮나요?","성인 400mg, 임산부 200mg 이내가 권장됩니다."],["디카페인은요?","디카페인도 소량의 카페인이 있습니다."]],
sleep:[["왜 90분 기준인가요?","수면이 약 90분 주기로 반복돼 주기 끝에 깨면 개운합니다."],["입면 시간은요?","잠드는 데 약 14분을 더해 계산합니다."]],
datasize:[["1024 기준인가요?","네, 2진(1KB=1024B) 기준입니다."],["저장장치 용량과 왜 다른가요?","제조사는 1000 기준으로 표기하기 때문입니다."]],
roman:[["몇까지 되나요?","1부터 3999까지 지원합니다."],["0이나 음수는요?","로마 숫자에는 0·음수 표기가 없습니다."]],
agekind:[["법적 나이는 무엇인가요?","2023년 6월부터 만 나이로 통일됐습니다."],["세는 나이는 왜 큰가요?","태어날 때 1살로 시작하기 때문입니다."]],
calorie:[["정확한가요?","MET 기반 근사치로 개인차가 있습니다."],["운동 강도는요?","같은 운동도 강도에 따라 소모가 달라집니다."]],
bmr:[["BMR이 뭔가요?","생명 유지에 필요한 최소 에너지입니다."],["다이어트에 어떻게 쓰나요?","하루 섭취를 활동대사량보다 적게 하면 체중이 줄어듭니다."]],
randnum:[["중복이 나올 수 있나요?","네, 각 숫자를 독립적으로 뽑아 중복될 수 있습니다."],["범위는 포함인가요?","최소·최대값 모두 포함됩니다."]],
saju:[["태어난 시각을 모르면 어떻게 하나요?","시주를 제외한 여섯 글자(삼주)로 풀이합니다. 오행·일간 해석은 그대로 볼 수 있습니다."],["진태양시 보정이 뭔가요?","한국 표준시는 동경 135도 기준이라 실제 태양시보다 약 30분 빠릅니다. 시주를 정확히 세우려면 30분을 빼서 계산합니다."],["음력 생일만 아는데요?","음력은 해마다 날짜가 달라 양력 변환 후 입력해야 정확합니다. 포털에서 양력 변환 후 이용하세요."],["연주는 1월 1일에 바뀌나요?","아니요, 입춘(2월 4일경)에 바뀝니다. 이 계산기는 태양 위치로 입춘 시각까지 계산해 판정합니다."]],
tarot:[["카드는 어떻게 뽑히나요?","메이저 아르카나 22장에서 중복 없이 3장을 무작위로 뽑습니다."],["역방향은 나쁜 건가요?","아니요, 같은 카드의 에너지가 막히거나 다른 방식으로 나타남을 뜻합니다."],["같은 질문을 여러 번 봐도 되나요?","전통적으로는 한 질문에 한 번을 권합니다. 질문을 바꿔 다시 보세요."]],
todayfortune:[["매일 내용이 바뀌나요?","네, 일진(날의 간지)이 자정에 바뀌므로 운세도 매일 달라집니다."],["무작위로 뽑는 건가요?","아니요, 오늘 일진과 내 일간의 십성 관계라는 명리 규칙으로 계산합니다. 같은 날 같은 생일이면 같은 결과가 나옵니다."],["점수가 낮으면 나쁜 날인가요?","주의 신호일 뿐입니다. 조언대로 움직이면 오히려 실수를 줄이는 날이 됩니다."]],
gunghap:[["생년월일만으로 충분한가요?","연·월·일 여섯 글자로 핵심 합·충·오행을 봅니다. 시각까지 넣으면 더 정밀해지므로 만세력에서 확인해보세요."],["점수가 낮으면 헤어져야 하나요?","아니요, 부딪히기 쉬운 지점을 알려주는 지도일 뿐입니다. 아는 만큼 조율할 수 있습니다."],["띠 충이면 결혼하면 안 되나요?","전통적 경계일 뿐 절대 규칙이 아닙니다. 실제로는 일간·일지 관계가 더 중요합니다."]],
};

const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

const FAVICON = `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%232a44c6'/><text x='16' y='23' font-size='19' fill='%23ffffff' text-anchor='middle' font-family='monospace' font-weight='bold'>%3D</text></svg>">`;
const headExtra = FAVICON+(GSC_VERIFY?`<meta name="google-site-verification" content="${GSC_VERIFY}">`:"")+
  (ADSENSE_CLIENT?`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`:"");
const adSlot = () => ADSENSE_CLIENT
  ? `<ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT}" data-ad-slot="${ADSENSE_SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`
  : `<div class="ad">AD · 애드센스 / 쿠팡 배너 자리</div>`;

// 전체 도구 내부링크 네비 (모든 페이지에 삽입 → SEO 링크)
function siteNav(currentId){
  return '<nav class="sitenav">'+CATS.map(function(c){
    var items=meta.filter(function(t){return t.cat===c;});
    return '<h2>'+c+'</h2>'+items.map(function(t){
      return t.id===currentId ? '<span class="cur">'+t.name+'</span>' : '<a href="'+t.id+'.html">'+t.name+'</a>';
    }).join("");
  }).join("")+'</nav>';
}

function toolPage(t){
  const title = t.name+" — 무료 온라인 계산기 | 모아계산기";
  const desc = (intro[t.id]||t.desc).slice(0,155);
  const url = DOMAIN+"/"+t.id+".html";
  const ld = {"@context":"https://schema.org","@type":"WebApplication",name:t.name,description:desc,
    applicationCategory:"FinanceApplication",operatingSystem:"All",url:url,
    offers:{"@type":"Offer",price:"0",priceCurrency:"KRW"}};
  const g=guide[t.id], f=faq[t.id];
  const guideHtml = g ? '<section class="guide"><h2>이렇게 계산해요</h2><ul>'+g.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></section>' : '';
  const faqHtml = f ? '<section class="faq"><h2>자주 묻는 질문</h2>'+f.map(x=>'<details><summary>'+esc(x[0])+'</summary><p>'+esc(x[1])+'</p></details>').join("")+'</section>' : '';
  const faqLd = f ? '<script type="application/ld+json">'+JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:f.map(x=>({"@type":"Question",name:x[0],acceptedAnswer:{"@type":"Answer",text:x[1]}}))})+'</script>' : '';
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>${faqLd}${headExtra}
</head><body><div class="wrap">
<a class="back" href="index.html">← 전체 계산기</a>
<h1 class="th">${t.name}</h1>
<div class="tl">${t.desc}</div>
<div class="card tool" id="tool"></div>
<p class="intro">${esc(intro[t.id]||t.desc)}</p>
${guideHtml}${faqHtml}
${adSlot()}
${siteNav(t.id)}
<div class="foot">© 2026 모아계산기 · 모든 계산은 참고용입니다</div>
</div>
<script src="app.js"></script>
<script>mountTool("${t.id}","tool");</script>
</body></html>`;
}

function indexPage(){
  const rows = CATS.map(function(c){
    var items=meta.filter(function(t){return t.cat===c;});
    return '<section class="grp'+(c==="재미·운세"?" fun":"")+'"><div class="cat"><span>'+c+'</span></div>'+items.map(function(t){
      return '<a class="idxrow" href="'+t.id+'.html"><span class="ix-n">'+t.name+'</span><span class="ix-d">'+t.desc+'</span><span class="ix-a">→</span></a>';
    }).join("")+'</section>';
  }).join("");
  const desc="실수령액·퇴직금·대출·부가세·글자수 등 자주 쓰는 계산기 "+meta.length+"개를 한 곳에. 2026년 기준, 무료.";
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>모아계산기 — ${meta.length}가지 무료 계산기 모음 (2026)</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${DOMAIN}/">
<meta property="og:title" content="모아계산기 — 무료 계산기 모음">
<meta property="og:description" content="${esc(desc)}">
<link rel="stylesheet" href="style.css">${headExtra}
</head><body><div class="wrap">
<header class="hero"><div class="logo-row"><svg class="lmark" viewBox="0 0 36 36" width="30" height="30" aria-hidden="true"><rect x="1.5" y="1.5" width="33" height="33" rx="9" fill="none" stroke="currentColor" stroke-width="2.2"/><text x="8" y="25" font-family="ui-monospace,monospace" font-size="17" font-weight="800" fill="var(--accent)">&gt;</text><rect x="19" y="14" width="9" height="2.6" rx="1.3" fill="var(--fun)"/><rect x="19" y="19.4" width="9" height="2.6" rx="1.3" fill="var(--fun)"/></svg><span class="brand">모아계산기</span><span class="meta">2026 · ${meta.length} TOOLS</span></div>
<h1 class="hero-h">뭐든 물어보세요.<br><b>숫자로 답합니다.</b></h1>
<div class="hero-sub">실수령액·퇴직금·대출부터 사다리타기까지 ${meta.length}가지, 한 곳에서.</div>
<div class="console"><div class="prompt">&gt; 무엇을 계산할까요<span class="cur"></span></div><input class="search" id="q" placeholder="계산기 검색 — 퇴직금, 부가세, 만 나이…" style="margin-top:8px"></div></header>
${rows}
${adSlot()}
<div class="foot">© 2026 모아계산기 · 모든 계산은 참고용입니다</div>
</div>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"모아계산기","url":"${DOMAIN}/","description":"${esc(desc)}"}</script>
<script>var q=document.getElementById("q");if(q)q.addEventListener("input",function(){var v=this.value.trim();document.querySelectorAll(".grp").forEach(function(g){var any=false;g.querySelectorAll(".idxrow").forEach(function(r){var m=r.querySelector(".ix-n").textContent.indexOf(v)>=0;r.style.display=m?"":"none";if(m)any=true;});g.style.display=any?"":"none";});});</script>
</body></html>`;
}

// app.js (공유 로직): 헬퍼 + TOOLS + mountTool
const appJs = `(function(){\n${helpers}\n${toolsArr}\n`+
  `window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(t)t.render(document.getElementById(elId));};\n})();`;

// 사이트맵 + robots
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  `<url><loc>${DOMAIN}/</loc></url>\n`+meta.map(t=>`<url><loc>${DOMAIN}/${t.id}.html</loc></url>`).join("\n")+`\n</urlset>`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml`;

// CSS + 페이지 전용 추가 스타일
const extraCss = `\n.intro{font-size:13.5px;color:var(--muted);line-height:1.8;margin:20px 2px 0;}`+
  `\n.sitenav{margin-top:36px;border-top:1px solid var(--line);padding-top:18px;}`+
  `\n.sitenav h2{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink);margin:16px 0 7px;font-weight:700;}`+
  `\n.sitenav a{display:inline-block;color:var(--muted);text-decoration:none;font-size:13px;margin:0 14px 7px 0;}`+
  `\n.sitenav a:hover{color:var(--accent);}`+
  `\n.sitenav .cur{display:inline-block;color:var(--ink);font-weight:700;font-size:13px;margin:0 14px 7px 0;}`;

// 쓰기
fs.writeFileSync(path.join(OUT,"style.css"), css+extraCss);
fs.writeFileSync(path.join(OUT,"app.js"), appJs);
fs.writeFileSync(path.join(OUT,"index.html"), indexPage());
meta.forEach(t=>fs.writeFileSync(path.join(OUT,t.id+".html"), toolPage(t)));
fs.writeFileSync(path.join(OUT,"sitemap.xml"), sitemap);
fs.writeFileSync(path.join(OUT,"robots.txt"), robots);
fs.writeFileSync(path.join(OUT,"ads.txt"), ADSENSE_CLIENT ? `google.com, ${ADSENSE_CLIENT.replace("ca-","")}, DIRECT, f08c47fec0942fa0` : "# 애드센스 승인 후 build_site.js의 ADSENSE_CLIENT를 채우면 자동 생성됩니다");
fs.writeFileSync(path.join(OUT, INDEXNOW_KEY+".txt"), INDEXNOW_KEY);

console.log("✅ 생성 완료:", meta.length, "개 도구 페이지 + index + sitemap + robots");
console.log("   → site/ 폴더. DOMAIN 상수를 실제 도메인으로 바꾸고 재실행 후 배포.");
