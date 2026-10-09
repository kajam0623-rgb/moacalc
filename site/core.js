var num=function(s){return Number(String(s).replace(/[^0-9.]/g,""))||0;};
  var won=function(n){return Math.round(n).toLocaleString("ko-KR");};
  var comma=function(n){return num(n).toLocaleString("ko-KR");};
  function bindMoney(root){root.querySelectorAll("input.money").forEach(function(el){
    el.addEventListener("input",function(){var v=num(this.value);this.value=v?v.toLocaleString("ko-KR"):"";if(this._cb)this._cb();});});}

  // ---------- 만세력 엔진 (태양황경 기반: 절기·연/월/일/시주) ----------
  var SJ_S=["갑","을","병","정","무","기","경","신","임","계"],SJ_SH="甲乙丙丁戊己庚辛壬癸";
  var SJ_B=["자","축","인","묘","진","사","오","미","신","유","술","해"],SJ_BH="子丑寅卯辰巳午未申酉戌亥";
  var SJ_TTI=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  var ZO_EN=["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
  var ZO_TRAIT=["재치와 기민함으로 기회를 먼저 잡는 기질","묵묵히 쌓아 끝내 이루는 뚝심","두려움 없이 앞장서는 용기와 카리스마","섬세한 배려와 부드러운 지혜","큰 그림을 그리는 스케일과 존재감","깊이 통찰하고 조용히 움직이는 영민함","자유롭고 활동적인 추진력","온화한 감성과 예술적 감각","영리한 임기응변과 재주","분명한 기준과 성실한 자기관리","의리와 신의로 사람을 얻는 힘","넉넉한 인심과 복을 부르는 여유"];
  function zoCard(b,label){return '<div class="sj-char"><img width="520" height="520" src="img/char/zo-'+ZO_EN[b]+'.webp" alt="'+SJ_TTI[b]+'띠" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
    '<div class="cap"><div class="t">'+(label||"나의 띠")+'</div><div class="n">'+SJ_TTI[b]+'띠</div><p>'+ZO_TRAIT[b]+'</p></div></div>';}
  // ── 서양 점성술(태양 별자리) ──
  var ST_KO=["양자리","황소자리","쌍둥이자리","게자리","사자자리","처녀자리","천칭자리","전갈자리","궁수자리","염소자리","물병자리","물고기자리"];
  var ST_EN=["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  var ST_SYM=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  var ST_RANGE=["3.21~4.19","4.20~5.20","5.21~6.21","6.22~7.22","7.23~8.22","8.23~9.22","9.23~10.22","10.23~11.21","11.22~12.21","12.22~1.19","1.20~2.18","2.19~3.20"];
  var ST_ELE=["불","흙","공기","물"]; // 별자리 index%4
  var ST_RULER=["화성","금성","수성","달","태양","수성","금성","화성","목성","토성","토성","목성"]; // 전통 지배성
  var ST_TRAIT=["망설임 없이 먼저 뛰어드는 개척자일세. 속도가 곧 무기야.","한번 정하면 끝까지 지키는 뚝심이 있네. 감각과 실속을 함께 챙기지.","호기심과 말솜씨가 살아 있는 전달자일세. 사람과 정보가 늘 모여드네.","마음의 온도를 먼저 읽는 보호자일세. 내 사람에게는 한없이 깊지.","존재만으로 무대를 만드는 사람일세. 인정받을 때 가장 빛나지.","작은 어긋남을 먼저 알아보는 정밀한 눈을 가졌네. 완성도가 곧 자존심이지.","균형과 관계를 조율하는 사람일세. 아름다움과 공정함을 함께 보네.","한 번 파고들면 끝을 보는 집중력이 있네. 겉과 속의 깊이가 남다르지.","시야가 넓고 낙천적인 탐험가일세. 자유로울 때 가장 신나지.","시간을 자기 편으로 만드는 전략가일세. 늦어도 결국 올라서네.","남과 다른 각도로 보는 혁신가일세. 규칙보다 이유를 먼저 묻지.","경계 없이 스며드는 공감력이 있네. 예술과 직관이 강점일세."];
  var ST_ELE_RULERS={"불":["태양","화성","목성"],"흙":["금성","수성","토성"],"공기":["수성","금성","토성"],"물":["달","화성","목성"]};
  var WD_KO=["일","월","화","수","목","금","토"];
  var WD_RULER=["태양","달","화성","수성","목성","금성","토성"]; // 요일 지배성(칠요)
  function stOf(y,m,d){return Math.floor(sjSunLong(sjJdKST(y,m,d,12,0))/30);} // 태양황경으로 별자리 판정
  /* 달의 자리 — 하루 낮 12시(KST) 기준. 황경은 Meeus(Astronomical Algorithms 47장)의 큰 항 30여 개로 구하고,
     미국 해군천문대의 삭·상현·보름·하현 99개(2026~27)와 0.04° 안(위상 시각으로 5분 안)으로 맞는다.
     하루의 결이 태양(한 달에 한 번 별자리를 옮긴다)이 아니라 달(2~3일마다 옮긴다)에서 나오게 하려는 것 */
  var ST_MASP=[[86,[4,2,4,-2]],[72,[0,2,4,2]],[84,[8,6,6,0]],[60,[-8,-6,-4,-6]],[90,[8,6,8,4]],[64,[-4,0,-4,-6]],[70,[4,2,2,0]]]; // 달과 내 별자리의 각도(0~6) → [기본점수,[애정·재물·일·건강 보정]]
  function hsMoonLong(jd){var T=(jd-2451545)/36525,T2=T*T,R=Math.PI/180,
      Lp=218.3164477+481267.88123421*T-0.0015786*T2,D=297.8501921+445267.1114034*T-0.0018819*T2,M=357.5291092+35999.0502909*T-0.0001536*T2,
      Mp=134.9633964+477198.8675055*T+0.0087414*T2,F=93.2720950+483202.0175233*T-0.0036539*T2,E=1-0.002516*T-0.0000074*T2,A1=119.75+131.849*T,A2=53.09+479264.290*T;
    function S(x){return Math.sin(x*R);}
    var s=6.288774*S(Mp)+1.274027*S(2*D-Mp)+0.658314*S(2*D)+0.213618*S(2*Mp)-0.185116*E*S(M)-0.114332*S(2*F)+0.058793*S(2*D-2*Mp)+0.057066*E*S(2*D-M-Mp)+0.053322*S(2*D+Mp)
      +0.045758*E*S(2*D-M)-0.040923*E*S(M-Mp)-0.034720*S(D)-0.030383*E*S(M+Mp)+0.015327*S(2*D-2*F)-0.012528*S(Mp+2*F)+0.010980*S(Mp-2*F)+0.010675*S(4*D-Mp)+0.010034*S(3*Mp)
      +0.008548*S(4*D-2*Mp)-0.007888*E*S(2*D+M-Mp)-0.006766*E*S(2*D+M)-0.005163*S(D-Mp)+0.004987*E*S(D+M)+0.004036*E*S(2*D-M+Mp)+0.003994*S(2*Mp+2*D)+0.003861*S(4*D)
      +0.003665*S(2*D-3*Mp)+0.003958*S(A1)+0.001962*S(Lp-F)+0.000318*S(A2);
    return ((Lp+s)%360+360)%360;}
  // 달의 별자리(sign 0~11)·태양과의 각(el)·모양(phase 0 삭 … 4 보름 … 7 그믐)·밝기(illum %)
  function hsMoon(y,m,d){var jd=sjJdKST(y,m,d,12,0),ml=hsMoonLong(jd),el=((ml-sjSunLong(jd))%360+360)%360;
    return {sign:Math.floor(ml/30),el:el,phase:Math.floor(((el+22.5)%360)/45),illum:Math.round((1-Math.cos(el*Math.PI/180))/2*100)};}
  function stCard(i,label){return '<div class="sj-char"><img width="520" height="520" src="img/char/st-'+ST_EN[i]+'.webp" alt="'+ST_KO[i]+'" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
    '<div class="cap"><div class="t">'+(label||"나의 별자리")+'</div><div class="n">'+ST_SYM[i]+' '+ST_KO[i]+'</div><p>'+ST_TRAIT[i]+'</p></div></div>';}
  // 태양의 각도 관계(어스펙트) — 거리 0~6, [기본점수, 이름, 총운, 애정, 재물·일, 조언, [애정·재물·일·건강 보정]]
  var ST_ASP=[
   [88,"합(0°)","태양이 내 별자리 위를 지나는 시기입니다. 존재감이 커지고, 내가 먼저 움직일수록 일이 풀립니다.","먼저 다가가는 쪽이 유리합니다. 표현을 아끼면 기회가 지나갑니다.","새로 시작하는 일에 힘이 실립니다. 다만 혼자 다 하려다 지칠 수 있습니다.","올해의 방향을 다시 세우기 좋은 때입니다. 하고 싶은 것을 문장으로 적어두세요.",[6,2,4,-2]],
   [72,"세미섹스타일(30°)","크게 흔들리지 않는 잔잔한 흐름입니다. 무리하지 않으면 손해도 없습니다.","익숙한 사이에서 편안함을 느낍니다. 새 인연은 서두르지 마세요.","작은 정리와 마무리에 좋은 날입니다.","오늘은 확장보다 정돈입니다. 미뤄둔 일 하나만 끝내세요.",[0,2,4,2]],
   [84,"섹스타일(60°)","기회가 손 닿는 곳에 놓입니다. 다만 스스로 손을 뻗어야 잡히는 종류입니다.","소개·모임·연락에서 좋은 흐름이 옵니다.","제안·협업·부수입에 유리합니다. 연락을 미루지 마세요.","오늘 온 연락은 흘려보내지 마세요. 답장 하나가 흐름을 바꿉니다.",[8,6,6,0]],
   [58,"스퀘어(90°)","마찰이 있는 대신 성장이 있는 날입니다. 부딪히는 지점이 곧 더 크게 자랄 자리입니다.","말투 하나로 오해가 생기기 쉽습니다. 한 박자 늦게 답하세요.","일정이 밀리거나 예산이 어긋날 수 있습니다. 여유분을 두세요.","오늘의 짜증은 방향이 아니라 속도의 문제입니다. 잠시 멈추면 보입니다.",[-8,-6,-4,-6]],
   [90,"트라인(120°)","같은 원소끼리 흐르는 순풍입니다. 애쓰지 않아도 일이 매끄럽게 이어집니다.","자연스러운 만남과 화해에 좋습니다. 오래된 인연이 다시 닿습니다.","하던 일에서 결실이 보입니다. 큰 결정을 내리기에도 무난합니다.","순풍일수록 방심하기 쉽습니다. 오늘 얻은 것을 기록해두세요.",[8,6,8,4]],
   [62,"퀸컹스(150°)","서로 결이 다른 기운이 겹칩니다. 조정과 타협이 필요한 하루입니다.","상대의 방식이 낯설게 느껴집니다. 고치려 들지 마세요.","계획과 현실의 간격이 드러납니다. 일정부터 다시 짜세요.","오늘은 정답보다 조율입니다. 한 가지는 양보하세요.",[-4,0,-4,-6]],
   [66,"오포지션(180°)","태양이 정반대에 섭니다. 관계와 균형이 하루의 주제가 됩니다.","상대를 통해 나를 봅니다. 갈등이 있다면 오늘이 풀 기회입니다.","혼자보다 둘이 낫습니다. 계약·협상은 조건을 문서로 남기세요.","맞은편에 있는 사람이 오늘의 거울입니다. 반발보다 관찰을.",[4,2,2,0]]];
  var SJ_ES=[0,0,1,1,2,2,3,3,4,4]; // 천간 오행(목화토금수=01234)
  var SJ_EB=[4,2,0,0,2,1,1,2,3,3,2,4]; // 지지 오행
  var SJ_BMAIN=[9,5,0,1,4,2,3,5,6,7,4,8]; // 지지 본기 천간 idx
  var SJ_EL=["목","화","토","금","수"];
  // 일간 정체성 1줄 압축판 — 오늘의 운세 첫 화면용 (saju ILGAN 장문과 별개)
  var SJ_ILGAN_ID=[
   "甲(갑) — 하늘로 곧게 크는 큰 나무.",
   "乙(을) — 바위를 감아 오르는 덩굴의 유연함.",
   "丙(병) — 숨김없이 내리쬐는 태양.",
   "丁(정) — 어둠을 밝히는 촛불의 온기.",
   "戊(무) — 흔들리지 않는 큰 산의 흙.",
   "己(기) — 곡식을 기르는 밭의 흙.",
   "庚(경) — 벼려서 날을 세우는 무쇠.",
   "辛(신) — 다듬어 빛나는 보석의 금.",
   "壬(임) — 바다처럼 깊고 넓게 흐르는 물.",
   "癸(계) — 스며들어 적시는 빗물과 이슬."];
  // 오행별 전통 상징 — [행운색, 방위, 행운숫자]
  var SJ_LUCK=[["청록·초록","동쪽","3·8"],["빨강·자주","남쪽","2·7"],["노랑·베이지","중앙","5·10"],["흰색·은색","서쪽","4·9"],["검정·남색","북쪽","1·6"]];
  var SJ_HOUR=["23~01시","01~03시","03~05시","05~07시","07~09시","09~11시","11~13시","13~15시","15~17시","17~19시","19~21시","21~23시"];
  function sjYukhap(b){return (b===0)?1:(b===1)?0:13-b;} // 육합 짝 지지(자축·인해·묘술·진유·사신·오미)
  function sjJdn(y,m,d){var a=Math.floor((14-m)/12),Y=y+4800-a,M=m+12*a-3;
    return d+Math.floor((153*M+2)/5)+365*Y+Math.floor(Y/4)-Math.floor(Y/100)+Math.floor(Y/400)-32045;}
  function sjSunLong(jd){ // 태양 겉보기 황경(도) — VSOP87 절단(Meeus 32.A)+장동+광행차+ΔT. 공식 절기표와 1분 안팎
    var yr=2000+(jd-2451545)/365.25,u,dt;
    if(yr<1941){u=yr-1920;dt=21.2+0.84493*u-0.0761*u*u+0.0020936*u*u*u;}
    else if(yr<1961){u=yr-1950;dt=29.07+0.407*u-u*u/233+u*u*u/2547;}
    else if(yr<1986){u=yr-1975;dt=45.45+1.067*u-u*u/260-u*u*u/718;}
    else if(yr<2005){u=yr-2000;dt=63.86+0.3345*u-0.060374*u*u+0.0017275*u*u*u+0.000651814*u*u*u*u+0.00002373599*u*u*u*u*u;}
    else if(yr<2050){u=yr-2000;dt=62.92+0.32217*u+0.005589*u*u;}
    else{u=(yr-1820)/100;dt=-20+32*u*u-0.5628*(2150-yr);}
    var t=(jd+dt/86400-2451545)/365250,T=t*10,S=SJ_VSOP,L=0,tp=1;
    for(var i=0;i<S.length;i++){var s=0,a=S[i];for(var k=0;k<a.length;k+=3)s+=a[k]*Math.cos(a[k+1]+a[k+2]*t);L+=s*tp;tp*=t;}
    var r=Math.PI/180,Om=(125.04452-1934.136261*T)*r,Ls=(280.4665+36000.7698*T)*r,Lm=(218.3165+481267.8813*T)*r;
    var dpsi=-17.2*Math.sin(Om)-1.32*Math.sin(2*Ls)-0.23*Math.sin(2*Lm)+0.21*Math.sin(2*Om);
    return ((L/1e8/r+180+(-0.09033+dpsi-20.4898)/3600)%360+360)%360;}
  var SJ_VSOP=[[175347046,0,0,3341656,4.6692568,6283.07585,34894,4.6261,12566.1517,3497,2.7441,5753.3849,3418,2.8289,3.5231,3136,3.6277,77713.7715,2676,4.4181,7860.4194,2343,6.1352,3930.2097,1324,0.7425,11506.7698,1273,2.0371,529.691,1199,1.1096,1577.3435,990,5.233,5884.927,902,2.045,26.298,857,3.508,398.149,780,1.179,5223.694,753,2.533,5507.553,505,4.583,18849.228,492,4.205,775.523,357,2.92,0.067,317,5.849,11790.629,284,1.899,796.298,271,0.315,10977.079,243,0.345,5486.778,206,4.806,2544.314,205,1.869,5573.143,202,2.458,6069.777,156,0.833,213.299,132,3.411,2942.463,126,1.083,20.775,115,0.645,0.98,103,0.636,4694.003,102,0.976,15720.839,102,4.267,7.114,99,6.21,2146.17,98,0.68,155.42,86,5.98,161000.69,85,1.3,6275.96,85,3.67,71430.7,80,1.81,17260.15,79,3.04,12036.46,75,1.76,5088.63,74,3.5,3154.69,74,4.68,801.82,70,0.83,9437.76,62,3.98,8827.39,61,1.82,7084.9,57,2.78,6286.6,56,4.39,14143.5,56,3.47,6279.55,52,0.19,12139.55,52,1.33,1748.02,51,0.28,5856.48,49,0.49,1194.45,41,5.37,8429.24,41,2.4,19651.05,39,6.17,10447.39,37,6.04,10213.29,37,2.57,1059.38,36,1.71,2352.87,36,1.78,6812.77,33,0.59,17789.85,30,0.44,83996.85,30,2.74,1349.87,25,3.16,4690.48],
    [628331966747,0,0,206059,2.678235,6283.07585,4303,2.6351,12566.1517,425,1.59,3.523,119,5.796,26.298,109,2.966,1577.344,93,2.59,18849.23,72,1.14,529.69,68,1.87,398.15,67,4.41,5507.55,59,2.89,5223.69,56,2.17,155.42,45,0.4,796.3,36,0.47,775.52,29,2.65,7.11,21,5.34,0.98,19,1.85,5486.78,19,4.97,213.3,17,2.99,6275.96,16,0.03,2544.31,16,1.43,2146.17,15,1.21,10977.08,12,2.83,1748.02,12,3.26,5088.63,12,5.27,1194.45,12,2.08,4694,11,0.77,553.57,10,1.3,6286.6,10,4.24,1349.87,9,2.7,242.73,9,5.64,951.72,8,5.3,2352.87,6,2.65,9437.76,6,4.67,4690.48],
    [52919,0,0,8720,1.0721,6283.0758,309,0.867,12566.152,27,0.05,3.52,16,5.19,26.3,16,3.68,155.42,10,0.76,18849.23,9,2.06,77713.77,7,0.83,775.52,5,4.66,1577.34,4,1.03,7.11,4,3.44,5573.14,3,5.14,796.3,3,6.05,5507.55,3,1.19,242.73,3,6.12,529.69,3,0.31,398.15,3,2.28,553.57,2,4.38,5223.69,2,3.75,0.98],
    [289,5.844,6283.076,35,0,0,17,5.49,12566.15,3,5.2,155.42,1,4.72,3.52,1,5.3,18849.23,1,5.97,242.73],
    [114,3.142,0,8,4.13,6283.08,1,3.84,12566.15],[1,3.14,0]];
  function sjJdKST(y,mo,d,h,mi){return sjJdn(y,mo,d)-0.5+((h||0)+(mi||0)/60-9)/24;} // KST→UT 포함 JD
  function sjIpchun(y){ // y년 입춘(황경 315°) KST JD
    var lo=sjJdKST(y,2,2,0,0),hi=sjJdKST(y,2,7,0,0);
    for(var i=0;i<40;i++){var mid=(lo+hi)/2,L=sjSunLong(mid);
      (L>=315&&L<330)?hi=mid:lo=mid;}
    return (lo+hi)/2;}
  // 24절기 일반형 — 황경 deg 에 태양이 닿는 순간(KST JD). sjIpchun(315°)의 일반화.
  // 315°(입춘)처럼 연초 근사일이 한 해를 넘기는 값은 한 해 빼준다.
  function sjTermJd(y,deg){
    var approx=79+deg*365.2422/360; if(approx>365.2422)approx-=365.2422;
    var lo=sjJdKST(y,1,1,0,0)+approx-5, hi=lo+10;
    var norm=function(x){return ((x%360)+360)%360;};
    for(var i=0;i<60;i++){var mid=(lo+hi)/2;
      (norm(sjSunLong(mid)-deg)<180)?hi=mid:lo=mid;}
    return (lo+hi)/2;}
  // 절기 24개 — [이름, 황경]. 입춘(315°)부터 한 해가 시작한다.
  var SJ_TERM=[["입춘",315],["우수",330],["경칩",345],["춘분",0],["청명",15],["곡우",30],
    ["입하",45],["소만",60],["망종",75],["하지",90],["소서",105],["대서",120],
    ["입추",135],["처서",150],["백로",165],["추분",180],["한로",195],["상강",210],
    ["입동",225],["소설",240],["대설",255],["동지",270],["소한",285],["대한",300]];
  function sjPillars(y,mo,d,h,mi,tCorr){
    var jd=sjJdKST(y,mo,d,h,mi);
    var yy=(jd<sjIpchun(y))?y-1:y;
    var ys=((yy-4)%10+10)%10,yb=((yy-4)%12+12)%12;
    var L=sjSunLong(jd),mIdx=Math.floor((((L-315)%360)+360)%360/30); // 0=인월
    var ms=((ys%5)*2+2+mIdx)%10,mb=(mIdx+2)%12;
    var dayN=sjJdn(y,mo,d),di=(((dayN-2451545)+54)%60+60)%60,ds=di%10,db=di%12;
    var hp=null;
    if(h!=null&&h!==""){var t=(+h)*60+(+mi||0)-(tCorr?30:0),t2=((t%1440)+1440)%1440;
      var hIdx=Math.floor(((t2+60)%1440)/120);
      // 밤 23시 이후(야자시): 일주는 당일 유지, 시 천간은 다음 날 자시의 것(야자시·정자시 어느 쪽이든 시주는 같다)
      var hd=(ds+Math.floor((t+60)/1440))%10;
      hp={s:((hd%5)*2+hIdx)%10,b:hIdx};}
    return {y:{s:ys,b:yb},m:{s:ms,b:mb},d:{s:ds,b:db},h:hp,tti:SJ_TTI[yb]};}
  // 신강·신약 판정 (월령·득지 가중) → 억부용신 추출
  function sjStrength(p){
    var de=SJ_ES[p.d.s],sup=0,drain=0;
    function add(el,w){ // 나를 돕는 힘: 같은 오행(비겁) + 나를 생하는 오행(인성)
      if(el===de||(el+1)%5===de)sup+=w; else drain+=w;}
    add(SJ_EB[p.m.b],3);            // 월지 = 월령, 가장 큼
    add(SJ_EB[p.d.b],2);            // 일지 = 득지
    add(SJ_ES[p.m.s],1.5);
    add(SJ_ES[p.y.s],1); add(SJ_EB[p.y.b],1);
    if(p.h){add(SJ_ES[p.h.s],1); add(SJ_EB[p.h.b],1);}
    var tot=sup+drain,ratio=tot?sup/tot:0.5;
    var strong=ratio>=0.5;
    // 억부용신: 신강이면 덜어내는 오행(식상·재성·관성), 신약이면 돕는 오행(인성·비겁)
    var yong = strong ? (de+1)%5 : (de+4)%5;   // 신강→식상(내가 생하는) / 신약→인성(나를 생하는)
    var yong2= strong ? (de+2)%5 : de;          // 보조: 신강→재성 / 신약→비겁
    return {strong:strong,ratio:ratio,yong:yong,yong2:yong2,de:de};
  }
  var SJ_YONG={
   목:{color:"초록·청색",dir:"동쪽",season:"봄",job:"교육·기획·의료·목재·출판 등 자라나게 하는 일",act:"새로운 것을 배우고 시작하는 활동"},
   화:{color:"빨강·주황",dir:"남쪽",season:"여름",job:"방송·디자인·요식·에너지·마케팅 등 드러내는 일",act:"사람 앞에 나서고 표현하는 활동"},
   토:{color:"노랑·갈색",dir:"중앙",season:"환절기",job:"부동산·건축·중개·관리·농업 등 중심을 잡는 일",act:"신뢰를 쌓고 관계를 중재하는 활동"},
   금:{color:"흰색·금색",dir:"서쪽",season:"가을",job:"금융·법률·기계·의료기기·군경 등 정리하는 일",act:"규칙을 세우고 결단하는 활동"},
   수:{color:"검정·남색",dir:"북쪽",season:"겨울",job:"연구·유통·무역·수산·IT 등 흐르게 하는 일",act:"정보를 모으고 유연하게 움직이는 활동"}};
  // 십이운성 — 일간이 각 지지에서 갖는 기운의 단계 (양간 순행 / 음간 역행)
  var SJ_UN=["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
  var SJ_UN_DESC={
   "장생":"갓 태어난 아기처럼 새로 시작하는 맑은 기운일세. 순수하고 앞으로 자랄 힘이 크며, 주변 사람들의 도움을 자연스럽게 받는 자리야.",
   "목욕":"멋을 내고 감정이 풍부해지는 자리일세. 사람을 끄는 매력이 큰 만큼 기분에 따라 마음이 잘 흔들리기도 하니, 결정은 차분할 때 하면 좋네.",
   "관대":"이제 막 세상에 나선 씩씩한 청년의 기운이야. 자신감과 의욕이 넘치는 대신 조금 성급해질 수 있으니, 한 박자만 쉬어 가면 되네.",
   "건록":"제 힘으로 벌어 제 발로 서는, 열두 단계 가운데서도 손꼽히게 단단한 자리일세. 실속이 있고 책임감이 강해서 곁의 사람들에게 믿음을 주네.",
   "제왕":"기운이 가장 왕성한 맨 꼭대기 자리야. 앞장서는 힘이 뛰어난 만큼, 고집으로 흐르지 않게 남의 말도 한 번 들어 주면 그 힘이 더 크게 빛나네.",
   "쇠":"가장 높은 때를 지나 안정으로 접어든 자리일세. 무리하지 않고 안을 다지는 데 강해서, 오래 가는 힘을 가졌네.",
   "병":"기운이 섬세하고 예민해지는 자리야. 대신 마음결이 깊고 배려심이 커서 사람을 잘 살피니, 몸만 잘 돌보면 그 따뜻함이 오래가네.",
   "사":"움직이는 것보다 생각이 깊어지는 자리일세. 연구나 기획처럼 안으로 파고드는 일에 잘 어울려서 조용한 집중력이 빛나네.",
   "묘":"거두어서 차곡차곡 챙기는 자리야. 모으고 지키는 힘이 있어서 살림을 관리하고 하나씩 쌓아 가는 데 특히 강하네.",
   "절":"한 번 멈췄다가 다시 이어지는 자리일세. 변화가 잦은 대신 새 출발의 기운도 함께 들어 있어서 다시 시작하는 힘이 크네.",
   "태":"새 생명이 막 생겨나는 자리야. 아이디어와 가능성이 씨앗처럼 자리를 잡아서 앞으로 크게 자랄 힘이 있네.",
   "양":"세상에 나오기 전에 품 안에서 자라는 자리일세. 보호받으며 준비하는 시기라서 성품이 온화하고 부드러워, 사람들과 잘 어울리네."};
  // 개념 삽화 파일명 매핑 — 한글 개념명을 이미지 파일명으로 연결한다
  var ART_UN={"장생":"un-jangsaeng","목욕":"un-mogyok","관대":"un-gwandae","건록":"un-geollok","제왕":"un-jewang","쇠":"un-soe","병":"un-byeong","사":"un-sa","묘":"un-myo","절":"un-jeol","태":"un-tae","양":"un-yang"};
  var ART_SINSAL={"천을귀인":"sinsal-cheoneul","문창귀인":"sinsal-munchang","도화살":"sinsal-dohwa","역마살":"sinsal-yeokma","화개살":"sinsal-hwagae","양인살":"sinsal-yangin","백호대살":"sinsal-baekho","괴강살":"sinsal-gwaegang"};
  var ART_GYEOK={"건록격":"gyeok-geollok","양인격":"gyeok-yangin","식신격":"gyeok-siksin","상관격":"gyeok-sanggwan","편재격":"gyeok-pyeonjae","정재격":"gyeok-jeongjae","편관격":"gyeok-pyeongwan","정관격":"gyeok-jeonggwan","편인격":"gyeok-pyeonin","정인격":"gyeok-jeongin"};
  var ART_ILGAN=["ilgan-gap","ilgan-eul","ilgan-byeong","ilgan-jeong","ilgan-mu","ilgan-gi","ilgan-gyeong","ilgan-sin","ilgan-im","ilgan-gye"];
  // 오행 상생·상극 삽화 — 인덱스는 SJ_EL 순서(목0 화1 토2 금3 수4). 상생은 i를 낳는 그림
  var ART_SAENG=["el-saeng-sumok","el-saeng-mokhwa","el-saeng-hwato","el-saeng-togeum","el-saeng-geumsu"];
  var ART_GEUK=["el-geuk-geummok","el-geuk-suhwa","el-geuk-mokto","el-geuk-hwageum","el-geuk-tosu"];
  // 지지·천간 관계 삽화
  var ART_HAP={"천간합":"hap-cheongan","삼합":"hap-samhap","육합":"hap-yukhap","충":"hap-chung","형":"hap-hyeong","해":"hap-hae"};
  // 개념 삽화 한 장. 파일이 없으면 스스로 사라져 레이아웃이 깨지지 않는다
  function conceptArt(file,alt){
    if(!file)return "";
    return '<img class="sj-art" width="520" height="520" src="img/char/'+file+'.webp" alt="'+escH(alt||"")+'" loading="lazy" onerror="this.remove()">';}
  // 십이운성 무드 — 하루의 '온도'를 총운에 접합 (오늘의 운세 총운 조립용, SJ_UN_DESC와 별개)
  var UN_MOOD={
   "장생":"몸이 가볍고 마음이 열리는 날이라 새로 시작하는 일에 힘이 붙네. 첫걸음을 내딛기 좋은 하루일세.",
   "목욕":"감정이 풍부해져서 매력이 살아나는 날일세. 다만 기분 따라 정하면 마음이 흔들리기 쉬우니 큰 결정은 한 번 더 생각하게.",
   "관대":"의욕이 차오르고 자신감도 넘치는 날이야. 다만 마음이 앞서 서두르면 마무리가 거칠어지니 끝맺음을 한 번 더 살펴보게.",
   "건록":"발밑이 단단해서 마음이 놓이는 날일세. 지금 손에 쥔 일부터 하나씩 끝내면 하루가 알차게 쌓이네.",
   "제왕":"기운이 가장 높이 오른 날이라 밀어붙이는 힘이 아주 좋네. 속도만 조금 늦추면 더 멀리 가네.",
   "쇠":"속도를 줄이고 안을 차분히 다지기 좋은 날이야. 새 일을 벌이기보다 정리하고 돌보는 일이 잘 어울리네.",
   "병":"마음결이 섬세하고 예민해지는 날일세. 몸이 보내는 신호가 잘 느껴지니 컨디션부터 먼저 챙겨 주면 하루가 편안하네.",
   "사":"생각이 안으로 깊어지는 날이라 혼자 집중하는 일에서 좋은 성과가 나네. 조용한 시간을 만들어 보게.",
   "묘":"모아 둔 것을 거두고 챙기는 날일세. 새 판을 벌이기보다 가진 것을 지키고 정리하면 마음이 차분해지네.",
   "절":"흐름이 잠시 멈췄다가 새로 이어지는 날이야. 변화가 와도 놀라지 말고 새 출발의 신호로 받아들이게. 다시 시작하기 좋은 때일세.",
   "태":"새로운 생각이 씨앗처럼 자리를 잡는 날일세. 바로 실행하기보다 적어 두고 키워 가기 좋은 때일세.",
   "양":"보호받으며 차분히 준비하는 날이야. 서두르지 말고 배우고 쉬며 힘을 기르게. 몸도 마음도 조금씩 자라는 하루일세."};
  var SJ_JS=[11,6,2,9,2,9,5,0,8,3]; // 천간별 장생 지지
  function sjUnseong(s,b){var js=SJ_JS[s];return SJ_UN[(s%2===0)?((b-js+12)%12):((js-b+12)%12)];}
  // 신살 — 룩업 테이블 (일간·삼합 기준)
  var SJ_CHEONEUL={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],8:[5,3],9:[5,3],7:[6,2]};
  var SJ_MUNCHANG=[5,6,8,9,8,9,11,0,2,3];
  // 공망(空亡): 일주가 속한 순(旬)에서 짝을 얻지 못한 두 지지. start=순의 첫 지지(갑과 짝인 지지)
  var SJ_SUN={0:"갑자순",10:"갑술순",8:"갑신순",6:"갑오순",4:"갑진순",2:"갑인순"};
  function sjGongmang(s,b){var st=(b-s+12)%12;return {sun:SJ_SUN[st],start:st,empty:[(st+10)%12,(st+11)%12]};}
  // 종합 점수와 네 항목 점수의 평균이 어긋나 보이지 않게: 항목 사이 벌어진 폭은 두고 평균만 종합 점수에 맞춘다(각 30~99 안에서)
  function subBal(score,vals){var n=vals.length,m=vals.reduce(function(a,b){return a+b;},0)/n,
    raw=vals.map(function(v){return score+v-m;}),
    out=raw.map(function(v){return Math.max(30,Math.min(99,Math.round(v)));}),
    diff=score*n-out.reduce(function(a,b){return a+b;},0),k=0,
    ord=raw.map(function(v,i){return i;}).sort(function(a,b){return diff>0?(raw[b]-out[b])-(raw[a]-out[a]):(out[b]-raw[b])-(out[a]-raw[a]);});
    while(diff!==0&&k++<500){for(var j=0;j<n&&diff!==0;j++){var i=ord[j],s=diff>0?1:-1;if(out[i]+s>=30&&out[i]+s<=99){out[i]+=s;diff-=s;}}}
    return out;}
  /*NM-BEGIN*/
  /* 이름 궁합(획수) — 순수 함수. 한글 획수는 사이트마다 다르다. 이 도구는 선분수(ㄱ=2·ㅎ=3) 기준이고,
     쌍자음·겹받침·복합 모음은 구성 자모를 더한다. 안내글의 예시 숫자는 build_site.js 가 이 블록을 읽어 같은 함수로 만든다 */
  var NM_C={"ㄱ":2,"ㄴ":2,"ㄷ":3,"ㄹ":5,"ㅁ":4,"ㅂ":4,"ㅅ":2,"ㅇ":1,"ㅈ":3,"ㅊ":4,"ㅋ":3,"ㅌ":4,"ㅍ":4,"ㅎ":3};
  var NM_V={"ㅏ":2,"ㅑ":3,"ㅓ":2,"ㅕ":3,"ㅗ":2,"ㅛ":3,"ㅜ":2,"ㅠ":3,"ㅡ":1,"ㅣ":1};
  var NM_X={"ㄲ":"ㄱㄱ","ㄸ":"ㄷㄷ","ㅃ":"ㅂㅂ","ㅆ":"ㅅㅅ","ㅉ":"ㅈㅈ","ㄳ":"ㄱㅅ","ㄵ":"ㄴㅈ","ㄶ":"ㄴㅎ","ㄺ":"ㄹㄱ","ㄻ":"ㄹㅁ","ㄼ":"ㄹㅂ","ㄽ":"ㄹㅅ","ㄾ":"ㄹㅌ","ㄿ":"ㄹㅍ","ㅀ":"ㄹㅎ","ㅄ":"ㅂㅅ",
    "ㅐ":"ㅏㅣ","ㅒ":"ㅑㅣ","ㅔ":"ㅓㅣ","ㅖ":"ㅕㅣ","ㅘ":"ㅗㅏ","ㅙ":"ㅗㅏㅣ","ㅚ":"ㅗㅣ","ㅝ":"ㅜㅓ","ㅞ":"ㅜㅓㅣ","ㅟ":"ㅜㅣ","ㅢ":"ㅡㅣ"};
  var NM_CHO="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ",NM_JUNG="ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ",
    NM_JONG=["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  function nmJ(j){var t=0,q,i;if(!j)return 0;if(NM_C[j])return NM_C[j];if(NM_V[j])return NM_V[j];q=NM_X[j]||"";for(i=0;i<q.length;i++)t+=nmJ(q.charAt(i));return t;}
  function nmChar(ch){var c=String(ch).charCodeAt(0),q,a,b,d;if(!(c>=0xAC00&&c<=0xD7A3))return null;q=c-0xAC00;a=NM_CHO.charAt(Math.floor(q/588));b=NM_JUNG.charAt(Math.floor((q%588)/28));d=NM_JONG[q%28];
    return {ch:String.fromCharCode(c),cho:a,jung:b,jong:d,n:nmJ(a)+nmJ(b)+nmJ(d)};}
  // 두 이름(한글 음절만 센다)을 번갈아 놓고 이웃한 수를 더해 일의 자리만 남기며 두 자리가 될 때까지 줄인다. 마지막 두 자리가 점수(00이면 100)
  function nmCalc(a,b){
    function syl(t){var r=[],i,x;t=String(t||"");for(i=0;i<t.length;i++){x=nmChar(t.charAt(i));if(x)r.push(x);}return r;}
    var A=syl(a),B=syl(b),mix=[],L,i,steps,cur,nx,j,score;
    if(!A.length||!B.length)return null;
    L=Math.max(A.length,B.length);
    for(i=0;i<L;i++){if(A[i])mix.push(A[i]);if(B[i])mix.push(B[i]);}
    steps=[mix.map(function(x){return x.n%10;})];cur=steps[0];
    while(cur.length>2){nx=[];for(j=0;j<cur.length-1;j++)nx.push((cur[j]+cur[j+1])%10);steps.push(nx);cur=nx;}
    score=cur[0]*10+cur[1];if(score===0)score=100;
    return {A:A,B:B,mix:mix,steps:steps,score:score};}
  // 점수대별 유형과 풀이 문장(90/75/55/35 — build_site.js 의 점수대별 표와 같아야 한다)
  function nmBand(s){
    return s>=90?{type:"운명형",msg:"운명이라 불러도 될 점수일세! 오늘 바로 연락해 보게.",good:"서로의 리듬이 거의 같네. 말하지 않아도 다음 행동이 짐작되니 함께 있는 시간이 참 편안하지.",care:"너무 닮아서 새로움이 줄 수 있으니, 둘 다 미뤄 두던 일을 함께 해 보면 새 기운이 생기네.",tip:"이 정도로 잘 맞으면 표현을 아끼기 쉽네. 당연한 것도 말로 확인하는 습관이 이 관계를 오래 지켜 주지."}
    : s>=75?{type:"안정형",msg:"아주 잘 어울리는 짝이야. 함께 있으면 웃음이 끊이지 않겠네.",good:"기본 호흡이 잘 맞는 조합일세. 큰 갈등 없이 오래 이어지는 사이야.",care:"무난함에 익숙해지면 서로의 변화를 놓치기 쉬우니, 눈여겨보고 한마디 건네 보게.",tip:"가끔 새로운 것을 함께 해 보게. 이 조합은 자극이 조금만 더해져도 다시 반짝이네."}
    : s>=55?{type:"성장형",msg:"함께 무르익는 궁합일세. 반은 하늘이, 반은 두 사람이 만들어 가네.",good:"처음엔 낯설어도 시간이 지날수록 서로에게 맞춰지는 조합일세.",care:"맞춰 가는 동안 한쪽이 더 양보한다고 느낄 수 있으니 고마운 마음을 자주 말해 주게.",tip:"서로 다른 점은 고치려 들지 말고 규칙으로 정해 보게. 이 조합은 대화의 양이 좋은 결과를 만드네."}
    : s>=35?{type:"밀당형",msg:"밀고 당기는 재미가 있는 사이야. 다름이 매력이 될 걸세.",good:"끌리는 힘과 서로를 궁금해하는 힘이 함께 있네. 지루할 틈이 없는 조합이야.",care:"감정의 폭이 커서 뜨거울 때와 식을 때의 온도차가 있으니, 그럴 땐 잠깐 쉬었다 이야기해 보게.",tip:"화가 난 상태에서는 결론을 내지 말고 마음이 가라앉은 뒤에 말하게. 이 조합은 타이밍만 맞춰도 훨씬 좋아지네."}
    : {type:"도전형",msg:"불꽃이 튀는 짝일세! 다른 만큼 더 끌리는 법이지.",good:"서로 완전히 다른 결을 가진 조합일세. 배울 것이 많은 만큼 함께 자라기 좋은 사이야.",care:"기본 바탕이 달라 같은 말도 다르게 들릴 수 있으니, 뜻을 한 번 더 물어보는 습관이 도움이 되네.",tip:"이 놀이의 점수는 낮아도 실제 관계와는 별개일세. 다른 만큼 서로에게 없는 것을 건네 줄 수 있지."};}
  /*NM-END*/
  /* 궁합 깊이 있는 풀이 — 원고 D(content_gunghap.js → gh/deep.json)에서 두 사람의 명식에 맞는 문장을 골라 잇는 순수 함수.
     엔진에 둔 이유: verify.js 가 무작위 쌍으로 검사한다. 이름 토큰은 {B:이/가} 꼴(받침 있으면 앞, 없으면 뒤)로 조사를 맞춘다 */
  function ghJ(w,pair){var p=pair.split("/"),c=String(w).charCodeAt(String(w).length-1);return (c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0)?p[0]:p[1];}
  function ghFill(s,map){return String(s).replace(/\{([A-Za-z]+)(?::([^}]+))?\}/g,function(m,k,j){var v=map[k];if(v==null)return m;return j?v+ghJ(v,j):v;});}
  var GH_GRP={비견:"비",겁재:"비",식신:"식",상관:"식",편재:"재",정재:"재",편관:"관",정관:"관",편인:"인",정인:"인"};
  function ghTg(p){var ds=p.d.s,c={재:0,관:0,식:0,인:0,비:0}; // 일간을 뺀 천간과 지지 본기의 십성 무리별 개수
    [p.y.s,p.m.s].concat(p.h?[p.h.s]:[]).forEach(function(s){c[GH_GRP[sjTenGod(ds,s)]]++;});
    [p.y.b,p.m.b,p.d.b].concat(p.h?[p.h.b]:[]).forEach(function(b){c[GH_GRP[sjTenGod(ds,SJ_BMAIN[b])]]++;});
    return c;}
  function ghEl(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].concat(p.h?[p.h]:[]).forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return c;}
  var GH_YB={비견:74,겁재:62,식신:88,상관:70,편재:80,정재:85,편관:60,정관:86,편인:68,정인:84};
  // 그해 점수 — 신년운세 도구와 같은 식: 십성 기본점수 + 띠·일지와 태세의 삼합·육합 +5 / 충 -6, 40~97
  function ghYear(p,Y){var ys=((Y-4)%10+10)%10,yb=((Y-4)%12+12)%12,rel=sjTenGod(p.d.s,ys),sc=GH_YB[rel];
    [p.y.b,p.d.b].forEach(function(b){if(b%4===yb%4&&b!==yb)sc+=5;else if(sjYukhap(b)===yb)sc+=5;else if(Math.abs(b-yb)===6)sc-=6;});
    return {rel:rel,score:Math.max(40,Math.min(97,sc))};}
  // c: {nb:상대 이름(이미 이스케이프), grade:등급, axes:[[축이름,점수]×4], now:기준 연도}
  // 한 결과 안에서 같은 문장이 두 번 나오지 않게 — 뒤에 나온 같은 문장(14자 이상)을 뺀다. 정규식 뒷보기(lookbehind)는 옛 사파리에서 스크립트 전체를 깨뜨려 쓰지 않는다
  function noRepeat(secs){var seen={};function keep(s){var k=s.replace(/<[^>]+>/g,"").trim();if(k.length<14)return true;if(seen[k])return false;seen[k]=1;return true;}
    function dd(p){return (String(p).match(/[^.!?]+[.!?]*\s*/g)||[String(p)]).filter(keep).join("").trim();}
    secs.forEach(function(s){if(s.p)s.p=s.p.map(dd).filter(function(x){return x;});if(s.roles)s.roles.forEach(function(r){r.t=dd(r.t)||r.t;});});return secs;}
  function ghDeep(A,B,c,D){
    if(!(A.h&&B.h)){A={y:A.y,m:A.m,d:A.d,h:null};B={y:B.y,m:B.m,d:B.d,h:null};} // 시각은 두 사람 다 알 때만 쓴다(점수와 같은 규칙)
    var nb=c.nb||"상대",ea=SJ_ES[A.d.s],eb=SJ_ES[B.d.s],hap=Math.abs(A.d.s-B.d.s)===5,r1=hap?"합":sjTenGod(A.d.s,B.d.s),R=D.rel[r1],M={B:nb},secs=[],i;
    var axes=c.axes.slice().sort(function(x,y){return y[1]-x[1];}),low=axes[axes.length-1][0];
    var sum=ghFill(D.sum[c.grade],{top:axes[0][0],low:low,t:R.t});
    var pic=['<b>자네</b> '+SJ_ILGAN_ID[A.d.s],'<b>'+nb+'</b> '+SJ_ILGAN_ID[B.d.s]];
    if(hap)pic.push(D.hap[Math.min(A.d.s,B.d.s)]);
    else{var lo=ea<=eb,pe=D.pairEl[lo?SJ_EL[ea]+SJ_EL[eb]:SJ_EL[eb]+SJ_EL[ea]];
      pic.push('두 글자를 한 장의 그림으로 그리면 「'+pe.img+'」일세. '+ghFill(pe.body,{X:lo?"자네":nb,Y:lo?nb:"자네"}));}
    secs.push({k:"pic",h:"두 사람을 한 장의 그림으로",p:pic,n:D.note.pic});
    secs.push({k:"bond",h:"서로에게 어떻게 보이나 — "+R.t,p:['<b>끌리는 이유</b> '+ghFill(R.pull,M),'<b>부딪히는 지점</b> '+ghFill(R.clash,M),'<b>풀어 가는 법</b> '+ghFill(R.fix,M),ghFill(R.you,M)]});
    var Mo=D.mode[r1];
    secs.push({k:"mode",h:"연애일 때, 결혼일 때, 함께 일할 때",p:['<b>연애</b> '+Mo.love,'<b>결혼</b> '+Mo.marry,'<b>함께 일하기</b> '+Mo.work]});
    var cA=ghEl(A),cB=ghEl(B),el=[];
    function elLine(cx,co,pn,qn){var mx=0,z=[],out=[],k;for(k=0;k<5;k++){if(cx[k]>cx[mx])mx=k;if(cx[k]===0)z.push(k);}
      if(cx[mx]>=3)out.push(ghFill(D.elx.many[SJ_EL[mx]],{P:pn}));
      if(z.length){var zi=z[0];for(k=0;k<z.length;k++)if(co[z[k]]>=2){zi=z[k];break;}
        out.push(ghFill(D.elx.none[SJ_EL[zi]],{P:pn}));if(co[zi]>=2)out.push(ghFill(D.elx.fill,{P:pn,Q:qn,E:SJ_EL[zi]}));}
      return out;}
    el=elLine(cA,cB,"자네",nb).concat(elLine(cB,cA,nb,"자네"));
    var dl=0;for(i=0;i<5;i++)dl+=Math.abs(cA[i]-cB[i]);
    if(!el.length)el.push(dl<=3?D.elx.same:ghFill(D.elx.flat,M));
    secs.push({k:"el",h:"오행이 서로에게 하는 일",p:el,n:D.note.el});
    function seas(b){return b>=2&&b<=4?"봄":b>=5&&b<=7?"여름":b>=8&&b<=10?"가을":"겨울";}
    var SA=seas(A.m.b),SB=seas(B.m.b),SO=["봄","여름","가을","겨울"],pk=SO.indexOf(SA)<=SO.indexOf(SB)?SA+SB:SB+SA;
    secs.push({k:"season",h:"태어난 계절이 서로에게 하는 일",p:[ghFill(D.season[SA],{P:"자네"}),ghFill(D.season[SB],{P:nb}),D.seasonPair[pk]],n:D.note.season});
    function rk(a,b){return a===b?"같음":(a%4===b%4)?"삼합":(a+b===13||(a===0&&b===1)||(a===1&&b===0))?"육합":Math.abs(a-b)===6?"충":"무난";}
    var tk=rk(A.y.b,B.y.b),ik=rk(A.d.b,B.d.b),tm={ta:SJ_TTI[A.y.b]+"띠",tb:SJ_TTI[B.y.b]+"띠"};
    secs.push({k:"home",h:"겉의 호흡(띠)과 속의 호흡(배우자 자리)",p:['<b>사람들 앞에서</b> '+ghFill(D.home.tti[tk],tm),'<b>집 안에서</b> '+D.home.ilji[ik]],n:D.note.home});
    var sa=sjStrength(A),sb=sjStrength(B);
    secs.push({k:"str",h:"힘의 균형 — 누가 앞서고 누가 받치나",p:[ghFill(D.str[(sa.strong?"강":"약")+(sb.strong?"강":"약")],M)],n:D.note.str+" (자네 "+Math.round(sa.ratio*100)+"%, "+nb+" "+Math.round(sb.ratio*100)+"%)"});
    var gA=ghTg(A),gB=ghTg(B),roles=[];
    ["재","관","식","인","비"].forEach(function(g){var a=gA[g],b=gB[g],d=D.role[g],who,txt;
      if(a>=3&&b>=3){who="둘 다";txt=d.both;}
      else if(Math.abs(a-b)>=2){var pa=a>b;who=pa?"자네":nb;txt=ghFill(d.lead,{P:who});}
      else if(a<=1&&b<=1){who="둘 다 적은 편";txt=d.none;}
      else{who="비슷";txt=d.even;}
      roles.push({k:d.t,w:who,t:txt});});
    secs.push({k:"role",h:"역할 나누기 — 누가 무엇을 맡으면 편한가",roles:roles,n:D.note.role});
    var YA=sa.yong,YB=sb.yong;
    secs.push({k:"work",h:"함께하면 잘 풀리는 일의 결",p:[ghFill(D.work.a,{P:"자네",E:SJ_EL[YA],J:SJ_YONG[SJ_EL[YA]].job}),ghFill(D.work.a,{P:nb,E:SJ_EL[YB],J:SJ_YONG[SJ_EL[YB]].job}),YA===YB?D.work.same:((YA+1)%5===YB||(YB+1)%5===YA)?D.work.chain:D.work.other],n:D.note.work});
    var years=[],y0=c.now,best,worst,Y;
    for(Y=y0;Y<y0+6;Y++){var ya=ghYear(A,Y),yb=ghYear(B,Y),av=Math.round((ya.score+yb.score)/2),flag=Math.min(ya.score,yb.score)<=62?(ya.score<yb.score?D.yr.a:D.yr.b):"";
      years.push({y:Y,la:D.yt[ya.rel],lb:D.yt[yb.rel],a:ya.score,b:yb.score,s:av,v:av>=80?"좋은 해":av>=70?"무난":"차분히",j:av>=80?D.yr.good:av>=70?D.yr.ok:D.yr.care,flag:flag});}
    best=years[0];worst=years[0];years.forEach(function(r){if(r.s>best.s)best=r;if(r.s<worst.s)worst=r;});
    var yp=best.s-worst.s<=6?[D.yr.flat]:[ghFill(D.yr.best,{Y:best.y})].concat(worst.s<70?[ghFill(D.yr.worst,{Y:worst.y})]:[]);
    secs.push({k:"yr",h:"함께 나아가기 좋은 해 — 결혼·동거·큰 계약을 정한다면",p:yp,years:years,n:D.note.yr});
    secs.push({k:"tip",h:"마음 맞추는 약속 세 가지",list:D.tip[r1].slice(),p:[D.axis[low]]});
    noRepeat(secs);
    return {sum:sum,secs:secs,meta:{r1:r1,title:R.t,years:years,gA:gA,gB:gB,cA:cA,cB:cB,tk:tk,ik:ik,SA:SA,SB:SB,YA:YA,YB:YB,sa:sa.strong,sb:sb.strong}};}
  /* 사주 결과 '타고난 성격' — 일간·힘의 세기·태어난 계절·가장 두터운 십성 무리에서 네 조각을 골라 잇는 순수 함수.
     원고 D = content_saju_char.js(→ sj/char.json). 무리 개수가 같으면 비겁·식상·재성·관성·인성 차례로 앞의 것을 고른다 */
  function sjChar(p,D){
    var st=sjStrength(p),mb=p.m.b,sea=mb>=2&&mb<=4?"봄":mb>=5&&mb<=7?"여름":mb>=8&&mb<=10?"가을":"겨울",cnt=ghTg(p),ord=["비","식","재","관","인"],best="비",i;
    for(i=1;i<5;i++)if(cnt[ord[i]]>cnt[best])best=ord[i];
    return [D.core[p.d.s],D.power[st.strong?"strong":"weak"][SJ_ES[p.d.s]],D.season[sea],D.group[best],D.love[p.d.s],D.work[p.d.s],D.rest[p.d.s]];}
  /* 신년운세 깊이 풀이 — 원고 D(content_newyear.js → ny/deep.json). 그 해(입춘~입춘)의 열두 달을 세워 달마다 십성·일지와의 합충·용신 적합을 보고,
     항목별(재물·일·사랑·건강)·곁에 둘 것·약속을 고른다. 해의 오행에 기대지 않고 십성 관계로만 써서 어느 해에 보아도 맞는다. 순수 함수 — verify 가 무작위 생일로 검사한다 */
  var NY_TERM=["입춘","경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한"];
  // 일 종류별로 십성이 얼마나 받쳐 주는가(-3~3). 그 달의 십성과 그 해의 십성을 같은 표로 읽는다
  var NY_EV=[
    ["job","이직·새 일 시작",{식신:3,상관:3,정관:2,편재:2,정재:1,정인:0,비견:0,편인:-1,겁재:-2,편관:-2}],
    ["deal","계약·큰 결제",{정재:3,정인:3,정관:2,식신:1,편재:0,비견:0,편인:0,상관:-2,겁재:-3,편관:-2}],
    ["study","시험·자격·공부",{정인:3,편인:3,정관:2,식신:1,정재:0,비견:0,편재:-1,상관:-1,겁재:-2,편관:-1}],
    ["meet","만남·인연",{식신:3,정재:2,정관:2,편재:1,정인:1,비견:0,상관:0,편인:-1,겁재:-2,편관:-1},4],
    ["biz","투자·사업 확장",{편재:3,식신:3,정재:2,정관:1,정인:0,비견:0,상관:0,편인:-1,겁재:-3,편관:-2}]],
    NY_GRP={비견:"비겁",겁재:"비겁",식신:"식상",상관:"식상",편재:"재성",정재:"재성",편관:"관성",정관:"관성",편인:"인성",정인:"인성"};
  function nyDeep(me,YR,YW,D){
    var ds=me.d.s,ys=((YR-4)%10+10)%10,rel=sjTenGod(ds,ys),st=sjStrength(me),yEl=SJ_EL[st.yong],y2El=SJ_EL[st.yong2],
      fit=SJ_EL[SJ_ES[ys]]===yEl?2:SJ_EL[SJ_ES[ys]]===y2El?1:0,M={Y:YW,E:yEl},R=D.rel[rel],months=[],i;
    var seenTg={},usedMid={},nFit=0,nCh=0,nHp=0,nSm=0;
    for(i=0;i<12;i++){var mm=i<11?i+2:1,yy=i<11?YR:YR+1,mp=sjPillars(yy,mm,20,12,0,false).m,tg=sjTenGod(ds,mp.s),el=SJ_EL[SJ_ES[mp.s]],
        mf=el===yEl?2:el===y2El?1:0,ch=Math.abs(mp.b-me.d.b)===6,hp=sjYukhap(me.d.b)===mp.b||(mp.b%4===me.d.b%4&&mp.b!==me.d.b),
        MT=D.month[tg],sc=GH_YB[tg]+(mf===2?6:mf===1?3:0)+(hp?5:0)-(ch?8:0),mid=mf===0?MT[2]:MT[1],
        fitN=mf===1?(nFit++?(D.monthMore.fit[nFit-2]||""):D.monthFit):"",noteN=ch?(nCh++?(D.monthMore.chung[nCh-2]||""):D.monthChung):hp?(nHp++?(D.monthMore.hap[nHp-2]||""):D.monthHap):"",
        prev=seenTg[tg],head=prev?"":MT[0];
      // 앞에서 이미 한 말은 되풀이하지 않는다: 같은 결의 달이면 그 달을 가리키고, 같은 문장이면 짧게 잇는다
      if(usedMid[mid])mid=D.monthSame[Math.min(nSm++,D.monthSame.length-1)];usedMid[mid]=1;
      var mo={i:i,m:mm,y:yy,tg:tg,pil:SJ_S[mp.s]+SJ_B[mp.b],han:SJ_SH[mp.s]+SJ_BH[mp.b],sc:sc,ch:ch,hp:hp,fit:mf,term:NY_TERM[i]};
      mo.t=(prev?ghFill(D.monthAgain,{prev:ml(prev)}):head)+" "+(fitN?fitN+" ":"")+mid+(noteN?" "+noteN:"");
      if(!prev)seenTg[tg]=mo;months.push(mo);}
    function ml(x){return (x.y>YR?"이듬해 ":"")+x.m+"월";}
    function nm(a){return a.map(ml).join("·");}
    function byI(a){return a.slice().sort(function(p,q){return p.i-q.i;});}
    var srt=months.slice().sort(function(a,b){return b.sc-a.sc||a.i-b.i;}),best=byI(srt.filter(function(x){return x.sc>=92;}).slice(0,3)),worst=byI(srt.filter(function(x){return x.sc<=60;}).reverse().slice(0,2));
    var mrows=months.map(function(x){var isB=best.indexOf(x)>=0,isW=worst.indexOf(x)>=0;
      return {h:ml(x),v:isB?"힘이 실리는 달":isW?"차분히 가는 달":"무난",c:isB?"g":isW?"c":"o",
        sub:x.pil+"("+x.han+")월 · "+x.tg+(x.ch?" · 일지와 충":x.hp?" · 일지와 합":"")+" · "+x.term+"부터",t:x.t};});
    var evRows=NY_EV.map(function(E){var k=E[0],w=E[2],ysc=w[rel]+(fit===2?1:0),
        sm=months.map(function(x){return {x:x,s:w[x.tg]+(x.fit===2?2:x.fit===1?1:0)+(k==="meet"&&x.hp?2:0)-(x.ch?2:0)};}).sort(function(a,b){return b.s-a.s||a.x.i-b.x.i;}),
        good=byI(sm.filter(function(o){return o.s>=(E[3]||3);}).slice(0,3).map(function(o){return o.x;})),bad=byI(sm.filter(function(o){return o.s<=-1;}).reverse().slice(0,2).map(function(o){return o.x;}));
      return {h:E[1],v:ysc>=3?"유리":ysc<=-1?"차분히":"무난",c:ysc>=3?"g":ysc<=-1?"c":"o",
        sub:(good.length?"좋은 달 "+nm(good):"뚜렷하게 좋은 달 없음")+(bad.length?" · 미뤄 두면 좋은 달 "+nm(bad):""),t:ghFill(D.ev[k][NY_GRP[rel]],M)};});
    var sm=best.length&&worst.length?D.sum.both:best.length?D.sum.bestOnly:worst.length?D.sum.worstOnly:D.sum.flat,Yo=SJ_YONG[yEl],secs=[];
    secs.push({k:"sum",h:"이 해 한눈에",p:[ghFill(D.fit[fit],M),ghFill(sm,{best:nm(best),worst:nm(worst)})]});
    secs.push({k:"money",h:"재물 — 돈이 오가는 모양",p:[ghFill(R.money,M)],n:D.note.money});
    secs.push({k:"work",h:"일과 자리",p:[ghFill(R.work,M)]});
    secs.push({k:"love",h:"사랑과 사람",p:[ghFill(R.love,M)]});
    secs.push({k:"health",h:"몸과 건강",p:[ghFill(R.health,M)]});
    secs.push({k:"months",h:"달마다 흐름 — "+YR+"년 입춘부터 열두 달",rows:mrows,n:D.note.months});
    secs.push({k:"events",h:"일마다 좋은 달 — 이직·계약·공부·인연·투자",rows:evRows,n:D.note.events});
    secs.push({k:"help",h:"곁에 둘 것 — 나를 받쳐 주는 기운",p:[ghFill(D.help,{Y:YW,E:yEl,color:Yo.color,dir:Yo.dir,season:Yo.season,job:Yo.job,act:Yo.act})],n:D.note.help});
    secs.push({k:"tip",h:"약속 세 가지",list:D.tip[rel].slice()});
    return {secs:secs,meta:{rel:rel,fit:fit,yong:yEl,months:months,best:best,worst:worst,events:evRows}};}
  var SJ_YANGIN={0:3,2:6,4:6,6:9,8:0};
  function sjSamhap(b){return b%4;} // 0:신자진 1:사유축 2:인오술 3:해묘미 (지지 index%4 그룹)
  var SJ_DOHWA={2:3,0:9,1:6,3:0},SJ_YEOKMA={2:8,0:2,1:11,3:5},SJ_HWAGAE={2:10,0:4,1:1,3:7};
  var SJ_BAEKHO=["갑진","을미","병술","정축","무진","임술","계축"],SJ_GWAEGANG=["경진","경술","임진","무술"];
  // 2026-10-09 신살 4종 추가(검색 많은 순 현침·홍염·귀문·원진). 유파마다 표가 달라 널리 쓰는 것을 따른다 — content_sinsal.js 와 같은 값(빌드가 대조)
  var SJ_HONGYEOM=[6,6,2,7,4,4,10,9,0,8];            // 일간별 홍염 지지(갑·을 오, 병 인, 정 미, 무·기 진, 경 술, 신 유, 임 자, 계 신)
  var SJ_HYEONCHIM_S=[0,7],SJ_HYEONCHIM_B=[3,6,8];   // 현침 글자: 천간 갑·신(辛), 지지 묘·오·신(申) — 사주에 2개 이상
  var SJ_GWIMUN=[[0,9],[1,6],[2,7],[3,8],[4,11],[5,10]],SJ_WONJIN=[[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];  // 일지와 다른 지지의 짝
  var SJ_SINSAL_DESC={
   "천을귀인":"사주에서 가장 좋은 길신일세. 어려울 때 사람이 나타나 큰 고비를 넘기게 해주는 힘이 있어.",
   "문창귀인":"학문과 글재주의 별이야. 공부든 시험이든 글이든 기획이든, 머리 쓰는 자리에서 두각이 나네.",
   "도화살":"매력과 인기의 별일세. 사람을 끄는 힘이 강해 예술·연예·서비스·영업 쪽에서 강점이 되네.",
   "역마살":"이동과 변화의 별이야. 해외든 출장이든 이사든 유통이든, 움직이는 일에서 기회가 열리네.",
   "화개살":"혼자 깊어지는 시간과 예술의 별일세. 혼자 깊이 파고드는 힘이 있어 연구·종교·예술·전문직에 어울려.",
   "양인살":"승부에 강한 기운이야. 결단력과 추진력이 뛰어나니 차분히 벼려서 쓰면 남을 지키는 힘이 되네.",
   "백호대살":"강렬한 기운의 별일세. 승부처에서 힘을 내니 건강과 안전만 곁들여 챙기면 든든하네.",
   "괴강살":"우두머리의 기운이야. 카리스마와 리더십이 강해 이끄는 자리에서 빛나네.",
   "홍염살":"은은한 매력과 감성의 별일세. 말투와 분위기에 사람이 끌려 예술·연애·대인 관계에서 빛이 나네.",
   "현침살":"바늘처럼 섬세한 손끝과 날카로운 눈의 별이야. 의료·디자인·기술처럼 정교함이 필요한 일에서 두각이 나네.",
   "귀문관살":"남다른 직관과 섬세한 감수성의 별일세. 예술·상담·연구에서 남이 못 보는 걸 읽어 내니 쉴 때는 푹 쉬게.",
   "원진살":"가까운 사이일수록 결이 달라 부딪히기 쉬운 짝이야. 말로 한 번 더 확인하는 습관이 관계를 오히려 단단하게 하네."};
  function sjSinsal(p){
    var ds=p.d.s,found=[],bs=[p.y.b,p.m.b,p.d.b];if(p.h)bs.push(p.h.b);
    var ce=SJ_CHEONEUL[ds]||[];if(bs.some(function(b){return ce.indexOf(b)>=0;}))found.push("천을귀인");
    if(bs.indexOf(SJ_MUNCHANG[ds])>=0)found.push("문창귀인");
    var base=sjSamhap(p.y.b),base2=sjSamhap(p.d.b);
    if(bs.indexOf(SJ_DOHWA[base])>=0||bs.indexOf(SJ_DOHWA[base2])>=0)found.push("도화살");
    if(bs.indexOf(SJ_YEOKMA[base])>=0||bs.indexOf(SJ_YEOKMA[base2])>=0)found.push("역마살");
    if(bs.indexOf(SJ_HWAGAE[base])>=0||bs.indexOf(SJ_HWAGAE[base2])>=0)found.push("화개살");
    if(SJ_YANGIN[ds]!==undefined&&bs.indexOf(SJ_YANGIN[ds])>=0)found.push("양인살");
    var dj=SJ_S[p.d.s]+SJ_B[p.d.b];
    if(SJ_BAEKHO.indexOf(dj)>=0)found.push("백호대살");
    if(SJ_GWAEGANG.indexOf(dj)>=0)found.push("괴강살");
    if(bs.indexOf(SJ_HONGYEOM[ds])>=0)found.push("홍염살");
    var ss=[p.y.s,p.m.s,p.d.s];if(p.h)ss.push(p.h.s);
    if(ss.filter(function(x){return SJ_HYEONCHIM_S.indexOf(x)>=0;}).length+bs.filter(function(x){return SJ_HYEONCHIM_B.indexOf(x)>=0;}).length>=2)found.push("현침살");
    var others=bs.slice();others.splice(2,1);   // 일지와 나머지 지지
    var pair=function(T){return others.some(function(o){return T.some(function(t){return (t[0]===p.d.b&&t[1]===o)||(t[1]===p.d.b&&t[0]===o);});});};
    if(pair(SJ_GWIMUN))found.push("귀문관살");
    if(pair(SJ_WONJIN))found.push("원진살");
    return found;
  }
  /* 지장간 — 지지 속에 숨은 천간. 지지마다 [천간 번호, 일수] 를 여기·중기·정기 순으로 둔다(일수 합 30).
     마지막이 정기(본기)라 SJ_BMAIN 과 같다(verify 가 대조). 자·오·해 등 일부는 학파에 따라 적는 방식이 달라 동네보살은 널리 쓰는 표를 따른다 */
  var SJ_JJG=[[[8,10],[9,20]],[[9,9],[7,3],[5,18]],[[4,7],[2,7],[0,16]],[[0,10],[1,20]],[[1,9],[9,3],[4,18]],[[4,7],[6,7],[2,16]],
    [[2,10],[5,9],[3,11]],[[3,9],[1,3],[5,18]],[[4,7],[8,7],[6,16]],[[6,10],[7,20]],[[7,9],[3,3],[4,18]],[[4,7],[0,7],[8,16]]];
  /* 대운 시작 — 남자·양년(연간이 짝수 번호) 또는 여자·음년은 순행, 그 반대는 역행.
     태어난 순간에서 다음(순행)·이전(역행) 절기까지의 날수를 3으로 나눈 값이 첫 대운의 나이(1~10세). 0.25일 단위로 센다.
     m60 은 월주가 60갑자에서 몇 번째인지(대운 간지는 여기서 한 칸씩 앞뒤로 간다) */
  function sjDaeunStart(p,male,jd0){
    var fwd=(p.y.s%2===0)===male;
    function mIdxOf(jd){return Math.floor((((sjSunLong(jd)-315)%360)+360)%360/30);}
    var base=mIdxOf(jd0),days=30;
    for(var t=0.25;t<=32;t+=0.25){if(mIdxOf(jd0+(fwd?t:-t))!==base){days=t;break;}}
    var su=Math.max(1,Math.min(10,Math.round(days/3)));
    var m60=0;for(var k=0;k<60;k++)if(k%10===p.m.s&&k%12===p.m.b){m60=k;break;}
    return {fwd:fwd,days:days,su:su,m60:m60};}
  // 격국 — 월지 본기의 십성으로 판정
  var SJ_GYEOK={"비견":"건록격","겁재":"양인격","식신":"식신격","상관":"상관격","편재":"편재격","정재":"정재격","편관":"편관격","정관":"정관격","편인":"편인격","정인":"정인격"};
  var SJ_GYEOK_DESC={
   "건록격":"스스로 벌어 스스로 서는 자수성가의 구조일세. 남에게 기대기보다 제 힘으로 기반을 만드는 짜임이라 독립·전문직·자기 사업이 잘 맞네.",
   "양인격":"강한 추진력과 승부 기질을 타고났네. 극한에서 오히려 힘을 내는 구조라, 평소엔 그 기운을 운동이나 전문 기술로 풀어줘야 하네.",
   "식신격":"먹을 복과 표현력의 구조야. 만들고 창작하고 가르치는 일에서 결실이 나고 성격도 여유로운 편일세.",
   "상관격":"재능이 밖으로 뻗는 구조일세. 틀을 깨는 발상이 강점이나 조직의 규율과는 부딪히기 쉬우니 자율이 있는 자리가 좋네.",
   "편재격":"큰 판을 보는 사업가의 구조야. 돈의 흐름을 읽는 감이 뛰어나 유통·영업·투자처럼 규모가 움직이는 데가 어울리네.",
   "정재격":"성실하게 쌓아 올리는 구조일세. 정해진 수입을 꾸준히 굴려 자산을 만드는 데 강하고, 신용이 곧 재산이 되네.",
   "편관격":"압박을 이겨내며 크는 구조야. 경쟁이 치열한 자리, 위기를 관리해야 하는 자리에서 능력이 드러나네.",
   "정관격":"질서와 명예를 중히 여기는 구조일세. 원칙대로 갈 때 인정받으니 공직·대기업·전문 자격 쪽이 잘 맞네.",
   "편인격":"독특한 관점과 직관의 구조야. 남들이 안 보는 걸 보니 전문 연구·기술·예술처럼 깊이 파는 데서 빛나네.",
   "정인격":"배우고 품는 구조일세. 학문·교육·상담처럼 지식을 쌓아 나누는 일에서 인정받고 귀인의 도움도 따르네."};
  function sjTenGod(dayS,otherS){ // 십성
    var de=SJ_ES[dayS],oe=SJ_ES[otherS],same=(dayS%2)===(otherS%2);
    if(de===oe)return same?"비견":"겁재";
    if((de+1)%5===oe)return same?"식신":"상관";
    if((de+2)%5===oe)return same?"편재":"정재";
    if((oe+2)%5===de)return same?"편관":"정관";
    return same?"편인":"정인";}
  /* 사주 결과 '상위 N%' — 1950~2009년생 모든 날짜 × 12시진(262,980건; 시각 모름은 날짜 21,915건)을 이 엔진으로 돌려 센
     십성 무리(비겁·식상·재성·관성·인성)별 칸 수 분포(h: 시각 있음 7칸, n: 시각 모름 5칸). 지어낸 순위가 아니다.
     tools/sajupct/make_pct.js 가 만들고 verify.js 가 표본으로 다시 재서 맞춰 본다 */
  var SJ_PCT={h:[[57009,95468,70369,30390,8131,1435,167,11],[58711,93694,69691,30357,8735,1601,181,10],[57355,94854,70340,30761,8187,1335,142,6],[55827,96037,71867,30102,7775,1262,106,4],[57820,94638,70081,30290,8436,1540,166,9]],
    n:[[7334,8778,4449,1185,157,12,0,0],[7324,8790,4451,1176,163,11,0,0],[7335,8786,4451,1168,165,10,0,0],[7325,8801,4439,1169,171,10,0,0],[7328,8787,4465,1161,163,11,0,0]]};
  var SJ_GRP5=["비겁","식상","재성","관성","인성"];
  // 칸 수가 c 이상인 사람의 비율(%) = "상위 N%". 1 아래는 1로 둔다
  function sjPct(gi,c,hasH){var a=SJ_PCT[hasH?"h":"n"][gi],t=0,s=0;for(var i=0;i<a.length;i++){t+=a[i];if(i>=c)s+=a[i];}return Math.max(1,Math.round(s/t*100));}
  /* 사주 결과 맨 위 '한 장 요약' — 일주 별명(sj/ilju.json 의 t, 결과가 뜬 뒤 채운다)·큰 일간 글자·칩·오행 칸·십성 별 그림·상위 N%·풀이 한 스푼.
     o: {p, cnt(오행 5), G(십성 무리 {비겁..}), strong, yEl, nm(호칭, 없으면 ""), hasH}. 문장은 보살 말투, 근거 주석만 존댓말 */
  // 칸이 하나 이상인 무리 가운데 드문 순서로 셋. 평범한 값(상위 60% 밖)은 빼되, 하나도 없으면 가장 드문 하나는 보여 준다
  function sjPcList(G,hasH){
    return SJ_GRP5.map(function(k,i){return {k:k,c:G[k],v:sjPct(i,G[k],hasH)};}).filter(function(x){return x.c>0;}).sort(function(a,b){return a.v-b.v||b.c-a.c;})
      .filter(function(x,i){return x.v<=60||i===0;}).slice(0,3);}
  /* 한 장 요약을 그림 한 장(1080 폭)으로 — 화면 카드와 같은 어두운 금빛. 생년월일은 싣지 않는다(공유 카드 규칙)
     d={ttl,sub,arch,archd,glyph:{ch,el},chips:[],five:[[목..수 개수]],radar:{lab:[],val:[],top},pcts:[[v,설명]],line} */
  function sumCanvas(d){
    if(typeof document==="undefined")return null;
    var W=1080,F='"Noto Sans KR","Malgun Gothic",sans-serif',EH={목:"#5fbe84",화:"#e57468",토:"#d9a648",금:"#a9b0ba",수:"#5f9de0"},HJ={목:"木",화:"火",토:"土",금:"金",수:"水"};
    var H=570+(d.five?290:0)+610+(d.line?100:0)+(d.pcts&&d.pcts.length?190:0)+170,c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");
    var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,"#2a2219");g.addColorStop(1,"#17120d");x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle="rgba(230,178,90,.45)";x.lineWidth=2;x.strokeRect(40,40,W-80,H-80);
    function rr(px,py,w,h,r){x.beginPath();if(x.roundRect)x.roundRect(px,py,w,h,r);else x.rect(px,py,w,h);}
    x.textAlign="left";x.fillStyle="#e6b25a";x.font="800 30px "+F;x.fillText("한눈에",90,120);
    x.fillStyle="#fff";x.font="900 58px "+F;x.fillText(d.ttl,90,192);
    x.fillStyle="#bba98a";x.font="500 30px "+F;x.fillText(d.sub,90,240);
    var y=280;rr(90,y,W-180,170,24);x.fillStyle="rgba(230,178,90,.10)";x.fill();x.strokeStyle="rgba(230,178,90,.45)";x.stroke();
    var gx=120;if(d.glyph){rr(120,y+25,120,120,18);x.strokeStyle="#e6b25a";x.lineWidth=3;x.stroke();x.lineWidth=2;x.textAlign="center";x.fillStyle=EH[d.glyph.el]||"#f0c46e";x.font="900 84px "+F;x.fillText(d.glyph.ch,180,y+116);gx=270;}
    x.textAlign="left";x.fillStyle="#f0c46e";x.font="900 46px "+F;var at=wrapText(x,d.arch,W-90-gx-40);x.fillText(at[0],gx,y+(at.length>1?72:88));if(at[1])x.fillText(at[1],gx,y+124);
    x.fillStyle="#efe3c9";x.font="500 27px "+F;if(at.length<2){var ad=wrapText(x,d.archd||"",W-90-gx-60);x.fillText((ad[0]||"")+(ad.length>1?"…":""),gx,y+136);}
    y+=200;
    // 칩
    x.font="800 26px "+F;var cx0=90;(d.chips||[]).forEach(function(t,i){var w=x.measureText(t).width+44;if(cx0+w>W-90)return;rr(cx0,y,w,50,25);
      x.fillStyle=i?"rgba(255,255,255,.04)":"rgba(230,178,90,.16)";x.fill();x.strokeStyle="rgba(230,178,90,.6)";x.stroke();x.fillStyle=i?"#efe3c9":"#f0c46e";x.fillText(t,cx0+22,y+34);cx0+=w+14;});
    y+=90;
    // 다섯 기운 칸
    if(d.five){x.fillStyle="#e6b25a";x.font="900 30px "+F;x.fillText("五行",90,y+10);x.fillStyle="#fff";x.font="800 30px "+F;x.fillText("타고난 다섯 기운",170,y+10);
      var mx=Math.max.apply(null,d.five)||1,tw=(W-180-4*24)/5;["목","화","토","금","수"].forEach(function(e,i){var tx=90+i*(tw+24),ty=y+36,th=110;
        rr(tx,ty,tw,th,18);x.fillStyle="rgba(255,255,255,.06)";x.fill();var fh=th*d.five[i]/mx;
        if(fh>0){x.save();rr(tx,ty,tw,th,18);x.clip();x.fillStyle=EH[e];x.fillRect(tx,ty+th-fh,tw,fh);x.restore();}
        x.textAlign="center";x.fillStyle=EH[e];x.font="900 40px "+F;x.fillText(HJ[e],tx+tw/2,ty+th+48);x.fillStyle="#efe3c9";x.font="800 26px "+F;x.fillText(String(d.five[i]),tx+tw/2,ty+th+82);x.textAlign="left";});
      y+=290;}
    // 별 그림
    var R=d.radar,N=R.lab.length,ccx=W/2,ccy=y+312,rad=200,top=R.top||Math.max.apply(null,R.val)||1;
    x.fillStyle="#e6b25a";x.font="900 30px "+F;x.fillText(d.five?"十星":"四軸",90,y+10);x.fillStyle="#fff";x.font="800 30px "+F;x.fillText(d.five?"무엇에 무게가 실렸나":"어디에 힘이 실렸나",170,y+10);
    function P(k,r){var a=(-90+360/N*k)*Math.PI/180;return [ccx+r*Math.cos(a),ccy+r*Math.sin(a)];}
    x.strokeStyle="#4a3d29";x.lineWidth=2;[1,2/3,1/3].forEach(function(f){x.beginPath();for(var k=0;k<N;k++){var q=P(k,rad*f);k?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}x.closePath();x.stroke();});
    for(var k=0;k<N;k++){var q=P(k,rad);x.beginPath();x.moveTo(ccx,ccy);x.lineTo(q[0],q[1]);x.stroke();}
    x.beginPath();for(k=0;k<N;k++){q=P(k,rad*R.val[k]/top);k?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}x.closePath();x.fillStyle="rgba(230,178,90,.28)";x.fill();x.strokeStyle="#e6b25a";x.lineWidth=4;x.stroke();
    var vmax=Math.max.apply(null,R.val);x.textAlign="center";
    for(k=0;k<N;k++){q=P(k,rad*R.val[k]/top);x.beginPath();x.arc(q[0],q[1],10,0,6.283);x.fillStyle=R.val[k]===vmax&&vmax?"#f08a7c":"#e6b25a";x.fill();
      var l=P(k,rad+52);x.fillStyle="#efe3c9";x.font="800 30px "+F;x.fillText(R.lab[k]+" "+R.val[k],l[0],l[1]+10);}
    y+=610;
    if(d.line){x.fillStyle="#fff";x.font="700 30px "+F;wrapText(x,d.line,W-200).slice(0,2).forEach(function(t,i){x.fillText(t,W/2,y+40+i*44);});y+=100;}
    // 상위 %
    if(d.pcts&&d.pcts.length){var pw=(W-180-(d.pcts.length-1)*24)/d.pcts.length;d.pcts.forEach(function(p,i){var px=90+i*(pw+24);rr(px,y,pw,150,22);x.fillStyle="rgba(230,178,90,.10)";x.fill();x.strokeStyle="rgba(230,178,90,.45)";x.stroke();
        x.fillStyle="#efe3c9";x.font="800 26px "+F;x.fillText("상위",px+pw/2,y+42);x.fillStyle="#f08a7c";x.font="900 56px "+F;x.fillText(p[0]+"%",px+pw/2,y+102);x.fillStyle="#bba98a";x.font="600 22px "+F;x.fillText(p[1],px+pw/2,y+136);});y+=190;}
    x.fillStyle="#e6b25a";x.font="800 40px "+F;x.fillText("동네보살",W/2,H-110);x.fillStyle="#bba98a";x.font="600 28px "+F;x.fillText(BRAND_URL,W/2,H-68);
    return c;}
  function sjSumHtml(o){
    var p=o.p,ds=p.d.s,cnt=o.cnt,H={목:"木",화:"火",토:"土",금:"金",수:"水"},myEl=SJ_EL[SJ_ES[ds]];
    var mxV=Math.max.apply(null,cnt),mxI=cnt.indexOf(mxV),tied=cnt.filter(function(c){return c===mxV;}).length;
    var line=tied>1?"가장 두꺼운 기운이 "+tied+"갈래로 나뉘어 고르게 퍼져 있네.":H[SJ_EL[mxI]]+"("+SJ_EL[mxI]+")"+josa(SJ_EL[mxI],"가/이")+" 가장 두껍네("+mxV+"자)."+(cnt.indexOf(0)>=0?" 비어 있는 칸은 채우면 좋은 자리일세.":" 다섯 칸이 모두 들어 있어 고르게 퍼진 편일세.");
    var tiles=SJ_EL.map(function(e,i){var f=mxV?Math.round(cnt[i]/mxV*100):0;
      return '<div class="ss-t5"><div class="ss-box"><i class="bg-'+e+'" style="height:'+f+'%"></i></div><b class="el-'+e+'">'+H[e]+'</b><span>'+cnt[i]+'</span></div>';}).join("");
    // 십성 별 그림: 위부터 시계 방향 자아(비겁)·표현(식상)·재물(재성)·명예(관성)·학문(인성)
    var LBL=["자아","표현","재물","명예","학문"],cx=130,cy=116,R=78,vals=SJ_GRP5.map(function(k){return o.G[k];}),top=Math.max(3,Math.max.apply(null,vals));
    var pt=function(k,r){var a=(-90+72*k)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];};
    var poly=function(f){return [0,1,2,3,4].map(function(k){var q=pt(k,R*f(k));return q[0].toFixed(1)+","+q[1].toFixed(1);}).join(" ");};
    var svg='<svg class="ss-radar" viewBox="0 0 260 240" role="img" aria-label="십성 분포: '+LBL.map(function(l,k){return l+" "+vals[k];}).join(", ")+'">'+
      [1,2/3,1/3].map(function(s){return '<polygon points="'+poly(function(){return s;})+'" class="rg"/>';}).join("")+
      [0,1,2,3,4].map(function(k){var q=pt(k,R);return '<line x1="'+cx+'" y1="'+cy+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" class="rg"/>';}).join("")+
      '<polygon points="'+poly(function(k){return vals[k]/top;})+'" class="rv"/>'+
      [0,1,2,3,4].map(function(k){var q=pt(k,R*vals[k]/top),l=pt(k,R+20);return '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="'+(vals[k]?4.5:2.5)+'" class="rd'+(vals[k]===Math.max.apply(null,vals)&&vals[k]?' on':'')+'"/>'+
        '<text x="'+l[0].toFixed(1)+'" y="'+(l[1]+4).toFixed(1)+'" text-anchor="middle" class="rl">'+LBL[k]+' '+vals[k]+'</text>';}).join("")+'</svg>';
    // 상위 N%: 칸이 하나 이상인 무리 가운데 드문 순서로 셋
    var PL={비겁:"자아·자립",식상:"표현·재주",재성:"재물",관성:"명예·자리",인성:"학문·도움"};
    var pc=sjPcList(o.G,o.hasH);
    var pcts=pc.map(function(x){return '<div class="ss-pc"><b>상위 <em>'+x.v+'</em>%</b><span>'+PL[x.k]+' 기운 '+x.c+'칸</span></div>';}).join("");
    var who=o.nm?o.nm.replace(/[&<>"']/g,""):"";
    return '<div class="sj-sum">'+
      '<div class="ss-k">한눈에</div><div class="ss-ttl">'+(who?who+' 한 장 요약':'한 장 요약')+'</div><div class="ss-sub">타고난 기운의 무게중심</div>'+
      '<div class="ss-arch"><b class="ss-arch-t">'+SJ_S[ds]+SJ_B[p.d.b]+'일주</b><span class="ss-arch-d"></span></div>'+
      '<div class="ss-id"><div class="ss-glyph el-'+myEl+'">'+SJ_SH[ds]+'</div><div><div class="ss-ilju">'+SJ_SH[ds]+SJ_BH[p.d.b]+' 일주 <small>'+SJ_S[ds]+SJ_B[p.d.b]+'</small></div>'+
      '<div class="ss-chips"><span class="on">'+H[myEl]+' · '+(o.strong?'힘이 넉넉한 편':'채워 가며 크는 편')+'</span><span>필요한 기운 '+H[o.yEl]+'</span><span>'+SJ_TTI[p.y.b]+'띠</span></div></div></div>'+
      '<div class="ss-h"><b>五行</b> 타고난 다섯 기운</div><div class="ss-five">'+tiles+'</div><p class="ss-line">'+line+'</p>'+
      '<div class="ss-h"><b>十星</b> 무엇에 무게가 실렸나</div>'+svg+
      (pcts?'<div class="ss-pcs">'+pcts+'</div><p class="ss-note">상위 N%는 1950~2009년생 '+(o.hasH?'26만 2천여 건(날짜×12시진)':'2만 1천여 건(날짜)')+'을 같은 계산으로 돌려, 그 기운이 같은 칸 수 이상인 사람의 비율로 매긴 것입니다.</p>':'')+
      '<div class="ss-mo"></div>'+
      '<button type="button" class="ss-save">이 요약 이미지로 저장</button>'+
      '<div class="ss-spoon"><b>풀이 한 스푼</b>오행은 세상을 이루는 다섯 기운, 나무·불·흙·쇠·물이네. 위 다섯 칸이 '+(who?who+josa(who,"가/이"):'자네가')+' 타고난 기운의 균형이고, 별 모양 그림은 여덟 글자가 나·표현·재물·명예·학문 가운데 어디에 무게를 싣는지 보여 주네.</div>'+
      '</div>';}
  /* 앞으로 열두 달 그래프 — 사주 '달마다 흐름'이 매긴 달 점수(MSC: [{y,m,sc}])를 꺾은선으로. 힘이 실리는 달(3점 이상) 금색, 아낄 달(0점 아래) 붉은 점 */
  function sjMonthSvg(M){
    if(!M||M.length<2)return "";
    var W=300,H=130,L=12,Rr=12,T=18,B=28,vs=M.map(function(x){return x.sc;}),hi=Math.max(4,Math.max.apply(null,vs)),lo=Math.min(-2,Math.min.apply(null,vs));
    var X=function(i){return L+(W-L-Rr)*i/(M.length-1);},Y=function(v){return T+(H-T-B)*(hi-v)/(hi-lo);};
    var line=M.map(function(x,i){return X(i).toFixed(1)+","+Y(x.sc).toFixed(1);}).join(" ");
    var best=M.filter(function(x){return x.sc>=3;}).map(function(x){return x.m+"월";}),bad=M.filter(function(x){return x.sc<0;}).map(function(x){return x.m+"월";});
    return '<div class="ss-h"><b>月運</b> 앞으로 열두 달</div>'+
      '<svg class="ss-mchart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="앞으로 열두 달 흐름: '+M.map(function(x){return x.m+"월 "+x.sc;}).join(", ")+'">'+
      '<line x1="'+L+'" x2="'+(W-Rr)+'" y1="'+Y(0).toFixed(1)+'" y2="'+Y(0).toFixed(1)+'" class="rg"/>'+
      '<polygon points="'+X(0).toFixed(1)+','+Y(lo).toFixed(1)+' '+line+' '+X(M.length-1).toFixed(1)+','+Y(lo).toFixed(1)+'" class="ma"/>'+
      '<polyline points="'+line+'" class="ml"/>'+
      M.map(function(x,i){return '<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(x.sc).toFixed(1)+'" r="'+(x.sc>=3||x.sc<0?4.5:2.5)+'" class="'+(x.sc>=3?"mg":x.sc<0?"mb":"mn")+'"/>'+
        '<text x="'+X(i).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" class="rl'+(i===0?" now":"")+'">'+x.m+'</text>';}).join("")+'</svg>'+
      '<p class="ss-line">'+(best.length?'힘이 실리는 달은 <b>'+best.join("·")+'</b>':'크게 튀는 달 없이 고르게 가네')+(bad.length?', 몸과 돈을 아낄 달은 <b>'+bad.join("·")+'</b>일세.':best.length?'일세.':'.')+' 자세한 풀이는 아래 ‘달마다 흐름’에 있네.</p>';}
  /* 궁합·신년운세용 한 장 요약 — 사주 것(sjSumHtml)과 같은 어두운 금빛 카드. 점수 축(0~100)을 별 그림으로.
     o={ttl,sub,arch,archd,chips:[],axes:[[이름,점수]],spoon} — 상위 %는 실측 분포가 없어 싣지 않는다 */
  // 궁합 점수 분포(35~99점 칸별 개수) — tools/sajupct/make_gh_pct.js 로 1950~2009년생 짝 20만 쌍(시각 모름)을 같은 점수 함수로 돌린 값
  var GH_PCT=[0,0,0,0,0,0,0,0,227,0,0,142,0,200,0,244,767,0,137,1155,2993,638,0,1865,1137,2806,355,2208,7071,1180,1881,9940,11236,5851,767,5895,9585,10310,3961,3874,8049,11389,7415,6244,4925,6630,7618,2893,5936,9139,2851,4699,2301,5319,6481,1486,1381,2029,2099,4092,965,1938,1146,1106,5444];
  function ghPct(sc){var t=0,c=0;for(var i=0;i<GH_PCT.length;i++){t+=GH_PCT[i];if(i+35>=sc)c+=GH_PCT[i];}return Math.max(1,Math.round(c/t*100));}
  function sumCard(o){
    var A=o.axes,N=A.length,cx=130,cy=116,R=78,mx=A.reduce(function(m,x){return x[1]>m[1]?x:m;}),mn=A.reduce(function(m,x){return x[1]<m[1]?x:m;});
    var pt=function(k,r){var a=(-90+360/N*k)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];};
    var poly=function(f){return A.map(function(x,k){var q=pt(k,R*f(k));return q[0].toFixed(1)+","+q[1].toFixed(1);}).join(" ");};
    var svg='<svg class="ss-radar" viewBox="0 0 260 240" role="img" aria-label="'+escH(A.map(function(x){return x[0]+" "+x[1]+"점";}).join(", "))+'">'+
      [1,2/3,1/3].map(function(s){return '<polygon points="'+poly(function(){return s;})+'" class="rg"/>';}).join("")+
      A.map(function(x,k){var q=pt(k,R);return '<line x1="'+cx+'" y1="'+cy+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" class="rg"/>';}).join("")+
      '<polygon points="'+poly(function(k){return A[k][1]/100;})+'" class="rv"/>'+
      A.map(function(x,k){var q=pt(k,R*x[1]/100),l=pt(k,R+20);return '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="4.5" class="rd'+(x===mx?' on':'')+'"/>'+
        '<text x="'+l[0].toFixed(1)+'" y="'+(l[1]+4).toFixed(1)+'" text-anchor="middle" class="rl">'+escH(x[0])+' '+x[1]+'</text>';}).join("")+'</svg>';
    return '<div class="sj-sum">'+
      '<div class="ss-k">한눈에</div><div class="ss-ttl">'+escH(o.ttl)+'</div><div class="ss-sub">'+escH(o.sub)+'</div>'+
      '<div class="ss-arch"><b class="ss-arch-t">'+escH(o.arch)+'</b><span class="ss-arch-d">'+escH(o.archd)+'</span></div>'+
      (o.chips&&o.chips.length?'<div class="ss-chips">'+o.chips.map(function(c,i){return '<span'+(i?'':' class="on"')+'>'+escH(c)+'</span>';}).join("")+'</div>':'')+
      // 상위 %는 자랑할 만할 때만(60% 안). 평범한 값은 사주 한 장 요약처럼 싣지 않는다
      (o.pct&&o.pct.v<=60?'<div class="ss-pcs"><div class="ss-pc"><b>상위 <em>'+o.pct.v+'</em>%</b><span>'+escH(o.pct.t)+'</span></div></div><p class="ss-note">'+escH(o.pct.n)+'</p>':'')+
      '<div class="ss-h"><b>四軸</b> 어디에 힘이 실렸나</div>'+svg+
      '<p class="ss-line">가장 힘 있는 쪽은 '+escH(mx[0])+'('+mx[1]+'점)'+(mx!==mn?', 공을 들이면 좋은 쪽은 '+escH(mn[0])+'('+mn[1]+'점)':'')+'일세.</p>'+
      '<div class="ss-spoon"><b>풀이 한 스푼</b>'+escH(o.spoon)+'</div><button type="button" class="ss-save">이 요약 이미지로 저장</button></div>';}
  /* 웹툰 칸 — 풀이 덩어리 사이에 아기보살이 말풍선으로 길을 잡아 준다. 라벨 첫머리로 자리를 찾고, 못 찾으면 그 칸은 건너뛴다 */
  function sjToonSaju(o){
    var QL={money:"재물",job:"일",love:"인연",health:"건강"},nm=o.nm||"자네";
    return [["종합","magnifier",nm+" 사주를 펼쳐 봤네. 먼저 큰 그림부터 짚어 주지."],
      ["한눈에 보기","crystal",(QL[o.q]?QL[o.q]+" 얘기가 제일 궁금하다 했지? ":"")+"이제 돈·일·인연·몸, 네 갈래로 나눠 보세."],
      ["나를 뜻하는 글자","scroll","여기서부터는 왜 그렇게 읽었는지, 보살의 셈법일세. "+(o.strong?"힘이 넉넉한 사주라":"채워 가며 크는 사주라")+" "+o.yEl+" 기운이 어디서 들어오는지가 열쇠야."],
      ["달마다 흐름","diary","이제 시간 순서로 보세. 앞으로 열두 달, 그리고 10년씩 바뀌는 큰 물결일세."],
      ["맺는 말","bow","끝까지 읽어 줬구먼. 마지막으로 한마디만 더 하지."]];}
  // P: [[라벨 첫머리, 포즈, 대사]] — 라벨은 접힌 칸(.fold-lab)이나 덩어리 제목(h3)에서 찾는다
  /* 결과를 장으로 나눈다 — 첫 장만 보이고, 버튼을 눌러야 다음 장이 열린다. C=[[경계 웹툰 칸 이름, 장 제목, 버튼 글]]
     경계는 sjToon 이 단 data-k. 못 찾은 경계는 건너뛴다. 다음 장 버튼은 앞 장 끝에 둬서 앞 장이 닫혀 있으면 같이 숨는다 */
  function sjChapters(out,C){
    if(!out||typeof document==="undefined")return;
    var M=[];C.forEach(function(c){var t=out.querySelector('.sj-toon[data-k="'+c[0]+'"]');if(!t)return;while(t.parentNode&&t.parentNode!==out)t=t.parentNode;if(t.parentNode)M.push({n:t,c:c});});
    var total=M.length+1,wraps=[];
    M.forEach(function(m,i){
      var w=document.createElement("div");w.className="sj-chap";w.hidden=true;out.insertBefore(w,m.n);
      var stop=M[i+1]?M[i+1].n:null,n=m.n;while(n&&n!==stop){var nx=n.nextSibling;w.appendChild(n);n=nx;}
      var b=document.createElement("div");b.className="sj-next";
      b.innerHTML='<button type="button" class="sj-next-b"><small>'+(i+2)+' / '+total+'</small><b>'+escH(m.c[1])+'</b><span>'+escH(m.c[2])+'</span></button>'+
        (i<M.length-1?'<button type="button" class="sj-next-all">남은 이야기 한 번에 다 보기</button>':'');
      if(i)wraps[i-1].appendChild(b);else out.insertBefore(b,w);
      wraps.push(w);
      b.querySelector(".sj-next-b").addEventListener("click",function(){w.hidden=false;b.remove();track("chap_"+(i+2));
        try{w.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}});
      var all=b.querySelector(".sj-next-all");
      if(all)all.addEventListener("click",function(){track("chap_all");[].forEach.call(out.querySelectorAll(".sj-chap"),function(x){x.hidden=false;});
        [].forEach.call(out.querySelectorAll(".sj-next"),function(x){x.remove();});try{w.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}});});
    // 공유·저장 버튼은 장 밖 맨 끝에 둬서 첫 장만 보고도 쓸 수 있게 한다
    wraps.forEach(function(w){[].slice.call(w.children).forEach(function(n){if(n.matches(".share-btn,.save-btn"))out.appendChild(n);});});}
  function sjToon(out,P){
    if(!out||!P||typeof document==="undefined")return;
    var labs=[].slice.call(out.querySelectorAll(".fold-lab,h3"));
    P.forEach(function(x){
      for(var i=0;i<labs.length;i++){if(labs[i].textContent.trim().indexOf(x[0])!==0)continue;
        var box=labs[i].closest("details.fold,div.fold,.sj-sec")||labs[i];if(!box.parentNode)return;
        var d=document.createElement("div");d.className="sj-toon";d.setAttribute("data-k",x[0]);d.innerHTML=bosalSay(x[1],escH(x[2]));
        box.parentNode.insertBefore(d,box);return;}});
  }
  // ---------- shared: 소득세(간이 연 결정세액 근사) ----------
  function earnedDed(g){if(g<=5e6)return g*0.7;if(g<=15e6)return 3.5e6+(g-5e6)*0.4;if(g<=45e6)return 7.5e6+(g-15e6)*0.15;if(g<=1e8)return 12e6+(g-45e6)*0.05;return 14.75e6+(g-1e8)*0.02;}
  function progressive(b){if(b<=14e6)return b*0.06;if(b<=50e6)return .84e6+(b-14e6)*.15;if(b<=88e6)return 6.24e6+(b-50e6)*.24;if(b<=15e7)return 15.36e6+(b-88e6)*.35;if(b<=3e8)return 37.06e6+(b-15e7)*.38;if(b<=5e8)return 94.06e6+(b-3e8)*.4;if(b<=1e9)return 174.06e6+(b-5e8)*.42;return 384.06e6+(b-1e9)*.45;}
  function incomeTaxMonthly(taxableMonthly,family,np,hi,ltc,ei){
    var g=taxableMonthly*12,earned=g-earnedDed(g),base=Math.max(earned-np*12-(hi+ltc+ei)*12-family*15e5,0);
    var c=progressive(base),cr=c<=13e5?c*.55:715000+(c-13e5)*.3,lim=g<=33e6?74e4:g<=7e7?66e4:g<=12e7?5e5:2e5;
    return Math.max(c-Math.min(cr,lim),0)/12;}
  function escH(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  // 한글 조사 자동 선택 — 앞 글자의 받침 유무로 고른다. josa("불","와/과")="과"
  function josa(w,pair){
    var p=pair.split("/"),c=String(w).charCodeAt(String(w).length-1);
    var hasJong=(c>=0xAC00&&c<=0xD7A3)&&((c-0xAC00)%28!==0);
    return hasJong?p[1]:p[0];}
  function loadPrefs(){try{return JSON.parse(localStorage.getItem("dnbs")||"{}");}catch(e){return {};}}
  function savePrefs(p){try{var c=loadPrefs();for(var k in p)c[k]=p[k];localStorage.setItem("dnbs",JSON.stringify(c));}catch(e){}}
  // 생년월일·시각·성별·이름은 저장하지 않는다(2026-09 사용자 결정). 예전에 자동으로 남겨 둔 값은 여기서 지운다
  (function(){try{var c=loadPrefs(),ch=false;["birth","birthHour","birthTime","gender","name","partnerBirth","partnerGender"].forEach(function(k){if(k in c){delete c[k];ch=true;}});
    if(ch)localStorage.setItem("dnbs",JSON.stringify(c));}catch(e){}})();
  // 자체 통계(worker.js)에는 이벤트 이름만 보낸다. p 에 든 값은 서버로 보내지 않는다
  /* 한 사람의 오늘은 하나다. 오늘의 운세(일진 천간 × 내 일간 십성 + 일지 합충 + 억부용신)가 기준값이고,
     띠·별자리 운세는 같은 무리 모두의 공통 흐름이라 생일을 알면 이 값을 먼저 보여 준다.
     (2026-09 감사: 같은 날 오늘 62점 "지갑 잠가라", 띠 90점 "큰돈 움직인다"가 함께 나왔다) */
  // 12시진 — [이름, 표준시 기준 범위(진태양시 30분 보정 반영)]. 사주·궁합 시각 입력이 같이 쓴다
  var SIJIN=[["자시","23:30~01:29"],["축시","01:30~03:29"],["인시","03:30~05:29"],["묘시","05:30~07:29"],["진시","07:30~09:29"],["사시","09:30~11:29"],
    ["오시","11:30~13:29"],["미시","13:30~15:29"],["신시","15:30~17:29"],["유시","17:30~19:29"],["술시","19:30~21:29"],["해시","21:30~23:29"]];
  function sjHourOpts(sv){return SIJIN.map(function(x,i){return '<option value="'+(i*2)+'"'+(i*2===sv?' selected':'')+'>'+(i?x[0]+' ('+x[1]+')':'자시·새벽 (00:00~01:29)')+'</option>';}).join("")+
    '<option value="23"'+(sv===23?' selected':'')+'>자시·밤 (23:30~23:59)</option>';}
  // 명식 표(시·일·월·연 네 기둥, 십성·십이운성은 그 사람 일간 기준) — 사주·궁합 결과가 같이 쓴다
  function sjGridHtml(p,dayLabel){var ds=p.d.s;
    function cell(s,b){var tg1=sjTenGod(ds,s),tg2=sjTenGod(ds,SJ_BMAIN[b]);
      return '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_ES[s]]+'">'+SJ_SH[s]+'</div><div class="sj-ko">'+SJ_S[s]+' · '+SJ_EL[SJ_ES[s]]+'</div><div class="sj-tg">'+tg1+'</div></div>'+
      '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_EB[b]]+'">'+SJ_BH[b]+'</div><div class="sj-ko">'+SJ_B[b]+' · '+SJ_EL[SJ_EB[b]]+'</div><div class="sj-tg">'+tg2+'</div>'+
      '<div class="sj-tg" style="color:var(--muted)">'+sjUnseong(ds,b)+'</div></div>';}
    var cols=[["시각 자리",p.h?cell(p.h.s,p.h.b):'<div class="sj-cell"><div class="sj-han" style="opacity:.25">?</div><div class="sj-ko">시각 모름</div></div>'],
      [dayLabel,cell(p.d.s,p.d.b)],["달 자리",cell(p.m.s,p.m.b)],["해 자리",cell(p.y.s,p.y.b)]];
    return '<div class="sj-grid">'+cols.map(function(c){return '<div class="sj-col"><div class="h">'+c[0]+'</div>'+c[1]+'</div>';}).join("")+'</div>';}
  var TF_BASE={"비견":78,"겁재":62,"식신":85,"상관":68,"편재":80,"정재":83,"편관":58,"정관":82,"편인":65,"정인":84};
  // 오늘의 운세 한 줄 요약(십성별) — 홈 오늘 카드와 오늘의 운세 결과가 같이 쓴다
  var TF_LINE={"비견":"내 걸음대로 가도 좋은 날. 돈은 각자 계산.","겁재":"마음 넉넉한 날. 쓸 한도만 정해 둘 것.","식신":"말도 복도 술술 풀리는 날. 담아 둔 말은 꺼낼 것.","상관":"아이디어 번뜩이는 날. 입만 한 박자 늦출 것.","편재":"큰돈과 기회가 오가는 날. 계산기부터 두드릴 것.","정재":"성실함이 돈이 되는 날. 확실한 쪽을 잡을 것.","편관":"도전이 오는 날. 정면으로 가되 몸은 아낄 것.","정관":"인정받는 날. 원칙대로 가는 게 지름길.","편인":"생각이 깊어지는 날. 결정은 내일로.","정인":"도움이 찾아오는 날. 혼자 애쓰지 말 것."};
  function tfGrade(s){return s>=85?"대길":s>=75?"길":s>=60?"평온":"주의";}
  /* 오늘 점수 — (내 일간 ds, 내 일지 db, 필요한 기운 yong)과 오늘 일진 today 로 정해진다. tfToday 와 상위 %(tfPct)가 같이 쓴다 */
  function tfScore(ds,db,yong,today){
    var score=TF_BASE[sjTenGod(ds,today.d.s)],tB=today.d.b,art="";
    if(db%4===tB%4&&db!==tB){score+=8;art="삼합";}
    else if(Math.abs(db-tB)===6){score-=10;art="충";}
    else if(sjYukhap(db)===tB){score+=6;art="육합";}
    var todayEl=SJ_ES[today.d.s],yongHit=todayEl===yong,yongClash=(todayEl+2)%5===yong;
    if(yongHit)score+=5;else if(yongClash)score-=3;
    return {score:Math.max(35,Math.min(98,score)),art:art,todayEl:todayEl,yongHit:yongHit,yongClash:yongClash};}
  function tfToday(y,m,d,now){
    now=now||new Date();
    var me=sjPillars(y,m,d,null,0,false),today=sjPillars(now.getFullYear(),now.getMonth()+1,now.getDate(),null,0,false);
    var st=sjStrength(me),r=tfScore(me.d.s,me.d.b,st.yong,today);
    return {me:me,today:today,rel:sjTenGod(me.d.s,today.d.s),score:r.score,grade:tfGrade(r.score),art:r.art,st:st,todayEl:r.todayEl,yongHit:r.yongHit,yongClash:r.yongClash};}
  // 1950~2009년생(시각 모름) 60일주 × 필요한 기운(목화토금수) 칸별 사람 수 — tools/sajupct/make_tf_pct.js 로 잰 값
  var TF_PCT=[[0,178,0,0,187],[0,56,0,0,309],[184,0,181,0,0],[186,0,179,0,0],[0,131,0,234,0],[0,132,0,233,0],[0,0,269,0,96],[0,0,128,0,237],[183,0,0,182,0],[182,0,0,183,0],[0,55,0,0,310],[0,178,0,0,187],[303,0,62,0,0],[305,0,60,0,0],[0,269,0,96,0],[0,269,0,96,0],[0,0,130,0,235],[0,0,269,0,96],[58,0,0,307,0],[59,0,0,306,0],[0,56,0,0,309],[0,55,0,0,310],[305,0,60,0,0],[305,0,60,0,0],[0,268,0,97,0],[0,133,0,232,0],[0,0,269,0,96],[0,0,269,0,96],[59,0,0,306,0],[59,0,0,306,0],[0,56,0,0,309],[0,56,0,0,309],[307,0,59,0,0],[306,0,60,0,0],[0,135,0,231,0],[0,271,0,95,0],[0,0,274,0,92],[0,0,131,0,235],[57,0,0,309,0],[59,0,0,307,0],[0,56,0,0,310],[0,55,0,0,311],[183,0,183,0,0],[307,0,59,0,0],[0,270,0,96,0],[0,271,0,95,0],[0,0,129,0,237],[0,0,268,0,97],[180,0,0,185,0],[58,0,0,307,0],[0,174,0,0,191],[0,174,0,0,191],[305,0,60,0,0],[186,0,179,0,0],[0,132,0,233,0],[0,133,0,232,0],[0,0,127,0,238],[0,0,129,0,236],[58,0,0,307,0],[180,0,0,185,0]];
  // 오늘 이 점수 이상인 사람의 비율(상위 N%) — 같은 날 모든 1950~2009년생을 같은 식으로 매긴 것
  function tfPct(score,today){var t=0,c=0;for(var i=0;i<60;i++)for(var e=0;e<5;e++){var n=TF_PCT[i][e];if(!n)continue;t+=n;if(tfScore(i%10,i%12,e,today).score>=score)c+=n;}return Math.max(1,Math.round(c/t*100));}
  /* 출생 당시 한국 시계가 지금 표준시(UTC+9)와 몇 분 달랐나.
     IANA tzdb Asia/Seoul·Rule ROK 기준: 1954-03-21~1961-08-10 표준시 UTC+8:30, 서머타임 +1시간.
     1987·88년 기간은 tzdb·국가기록원·언론 기록이 같다. 1948~60년 기간은 tzdb 날짜를 쓰되
     국가기록원은 "1949~1961년, 대개 5~9월"로만 적어 기록마다 조금 다르다. [시작일, 끝나는 날(그날 0시에 해제)] */
  var KR_DST=[["1948-06-01","1948-09-13"],["1949-04-03","1949-09-11"],["1950-04-01","1950-09-10"],["1951-05-06","1951-09-09"],
    ["1955-05-05","1955-09-09"],["1956-05-20","1956-09-30"],["1957-05-05","1957-09-22"],["1958-05-04","1958-09-21"],
    ["1959-05-03","1959-09-20"],["1960-05-01","1960-09-18"],["1987-05-10","1987-10-11"],["1988-05-08","1988-10-09"]];
  function krClockShift(y,m,d){
    var k=y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0"),dst=false,std830=k>="1954-03-21"&&k<"1961-08-10";
    KR_DST.forEach(function(r){if(k>=r[0]&&k<r[1])dst=true;});
    return {min:(std830?-30:0)+(dst?60:0),dst:dst,std830:std830};}
  function sjKst(jd){var t=new Date(Math.round((jd-2440587.5)*86400000)+9*3600000);
    return t.getUTCFullYear()+"년 "+(t.getUTCMonth()+1)+"월 "+t.getUTCDate()+"일 "+String(t.getUTCHours()).padStart(2,"0")+":"+String(t.getUTCMinutes()).padStart(2,"0");}
  // 태어난 순간의 앞뒤 월 절기(황경 315+30k°) — 월주가 어느 절기부터 시작됐는지 보여 준다
  function sjMonthTerms(jd){
    var L=sjSunLong(jd),k=Math.floor((((L-315)%360)+360)%360/30),deg=(315+30*k)%360,y=new Date(Math.round((jd-2440587.5)*86400000)).getUTCFullYear();
    var prev=[y-1,y,y+1].map(function(Y){return sjTermJd(Y,deg);}).filter(function(j){return j<=jd;}).pop();
    var nd=(deg+30)%360,next=[y-1,y,y+1].map(function(Y){return sjTermJd(Y,nd);}).filter(function(j){return j>jd;})[0];
    var nm=function(g){for(var i=0;i<SJ_TERM.length;i++)if(SJ_TERM[i][1]===g)return SJ_TERM[i][0];};
    return {L:L,prev:prev,prevName:nm(deg),next:next,nextName:nm(nd)};}
  /* 계산 근거 — 결과가 어떤 계산에서 나왔는지 존댓말로 밝힌다(풀이는 보살 말투, 근거 고지는 존댓말).
     o: {y,mo,d,h,corr,male,p,su,days,fwd} */
  function sjBasisHtml(o){
    var p=o.p,jdB=sjJdKST(o.y,o.mo,o.d,o.h==null?12:o.h,o.h==null?0:o.mi),ip=sjIpchun(o.y),mt=sjMonthTerms(jdB),sh=krClockShift(o.y,o.mo,o.d);
    var G=function(x){return SJ_S[x.s]+SJ_B[x.b]+"("+SJ_SH[x.s]+SJ_BH[x.b]+")";};
    var li=[];
    li.push("<b>연주 "+G(p.y)+"</b> — 사주의 해는 1월 1일이 아니라 입춘에 바뀝니다. "+o.y+"년 입춘은 "+sjKst(ip)+"이고, 태어난 때가 그 "+(jdB<ip?"전이라 "+(o.y-1)+"년의 간지를 씁니다.":"뒤라 "+o.y+"년의 간지를 씁니다."));
    li.push("<b>월주 "+G(p.m)+"</b> — 태어난 순간 태양의 황경은 "+mt.L.toFixed(2)+"°입니다. 달은 절기로 바뀌므로 "+mt.prevName+"("+sjKst(mt.prev)+")부터 "+mt.nextName+"("+sjKst(mt.next)+") 전까지가 이 달입니다.");
    li.push("<b>일주 "+G(p.d)+"</b> — 날짜는 자정에 바뀝니다. 밤 11시 이후(야자시)에 태어나도 일주는 그날 것을 쓰고, 시주만 다음 날 자시로 잡습니다. 밤 자시에 일주까지 다음 날로 넘기는 만세력(정자시)도 있어, 그런 곳과는 일주가 다를 수 있습니다.");
    li.push(o.h==null?"<b>시주</b> — 태어난 시각을 모른다고 하셔서 시주를 빼고 여섯 글자로 봤습니다.":
      "<b>시주 "+G(p.h)+"</b> — "+(o.exact?"적어 주신 시각(한국 표준시 "+String(o.h).padStart(2,"0")+":"+String(o.mi).padStart(2,"0")+")으로 정했습니다.":"고르신 시진으로 정했습니다.")+" 한국 표준시는 동경 135°에 맞춰져 서울의 실제 해 시각보다 약 30분 빠릅니다. 진태양시 보정은 "+(o.corr?"적용했습니다.":"끄셨습니다."));
    if(o.exact&&o.sh){
      li.push("<b>출생 당시 시계</b> — 이 날짜는 "+(sh.std830&&sh.dst?"표준시가 UTC+8:30이었고 서머타임도 시행 중이어서":sh.std830?"표준시가 UTC+8:30이어서":"서머타임 기간이어서")+" 적어 주신 "+o.exact+"에서 "+(o.sh>0?o.sh+"분을 빼":(-o.sh)+"분을 더해")+" 지금 한국 표준시로 바꿔 계산했습니다."+(sh.dst&&o.y<1962?" 1948~1960년 서머타임 기간은 기록마다 며칠씩 다릅니다.":""));
    }else if(sh.min!==0){
      var why=sh.std830&&sh.dst?"당시 표준시가 UTC+8:30이었고 서머타임(1시간 당김)도 시행 중이었습니다."
        :sh.std830?"당시 표준시가 지금보다 30분 늦은 UTC+8:30이었습니다.":"서머타임(시계를 1시간 당김)이 시행 중이었습니다.";
      li.push("<b>출생 당시 시계</b> — 이 날짜는 "+why+" 출생증명서에 적힌 시각은 지금 시계로 치면 "+(sh.min>0?sh.min+"분 앞선":(-sh.min)+"분 늦은")+" 시각입니다. 시진을 고를 때는 적힌 시각에서 "+(sh.min>0?sh.min+"분을 빼고":(-sh.min)+"분을 더해")+" 고르세요."+(sh.dst&&o.y<1962?" 1948~1960년 서머타임 기간은 기록마다 며칠씩 다릅니다.":"")+" 위의 정확한 시각 칸에 적힌 그대로 넣으시면 자동으로 맞춥니다.");}
    if(o.su)li.push("<b>대운</b> — "+(o.fwd?"순행":"역행")+"입니다(연간이 "+(p.y.s%2===0?"양":"음")+"이고 "+(o.male?"남":"여")+"자). 태어난 때부터 "+(o.fwd?"다음":"이전")+" 절기까지 "+(Math.round(o.days*4)/4)+"일이라, 3일을 1년으로 쳐서 "+o.su+"세에 첫 대운이 시작됩니다."+(o.h==null?" 시각을 몰라 정오로 보고 셌습니다.":""));
    return '<div class="sj-sec sj-basis"><h3>이 결과는 이렇게 계산했습니다</h3><p>'+bosalImg("point","bs-side","계산을 짚어 주는 아기보살")+li.join("<br><br>")+
      '<br><br><span style="color:var(--muted);font-size:12.5px">절기 시각은 태양 황경을 VSOP87 행성 이론으로 직접 계산한 값이며, 영국·미국 천문력 자료로 만든 공식 절기표와 1분 안에서 맞습니다. 절기 바로 1~2분 안에 태어났다면 만세력마다 월주가 갈릴 수 있습니다. 이 계산을 한 단계씩 따라 해 보고 싶으시면 <a href="learn.html">명리학 배우기</a>로 가 보세요.</span></p></div>';}
  /* AI에게 물어보기 — 범용 AI는 만세력을 자주 틀린다. 계산이 끝난 값만 담은 질문문을 복사해 넘긴다.
     생년월일은 넣지 않는다. o: {p,male,h,st,gyeok,sinsal,cnt,G,duList,su,fwd} */
  function sjAiPrompt(o){
    var p=o.p,ds=p.d.s,H=function(x){return SJ_SH[x.s]+SJ_BH[x.b];},K=function(x){return SJ_S[x.s]+SJ_B[x.b];};
    var cols=[p.y,p.m,p.d].concat(p.h?[p.h]:[]),now=new Date(),yp=sjPillars(now.getFullYear(),7,1,null,0,false).y;
    return ["아래는 만세력(절기는 태양 황경으로 계산)으로 계산을 마친 내 사주입니다. 간지를 다시 계산하지 말고 이 값을 그대로 써서 풀이해 주세요.",
      "- 성별: "+(o.male?"남":"여"),
      "- 사주("+(p.h?"연·월·일·시":"연·월·일, 태어난 시각 모름")+"): "+cols.map(H).join(" ")+" ("+cols.map(K).join(" · ")+")",
      "- 일간: "+SJ_S[ds]+SJ_EL[SJ_ES[ds]]+" · "+(o.st.strong?"신강":"신약")+" · 억부용신 "+SJ_EL[o.st.yong]+", 보조 "+SJ_EL[o.st.yong2],
      "- 오행 개수: "+SJ_EL.map(function(e,i){return e+" "+o.cnt[i];}).join(", "),
      "- 십성 분포: 비겁 "+o.G.비겁+", 식상 "+o.G.식상+", 재성 "+o.G.재성+", 관성 "+o.G.관성+", 인성 "+o.G.인성,
      "- 격국: "+o.gyeok+(o.sinsal.length?" · 신살: "+o.sinsal.join(", "):""),
      "- 대운("+(o.fwd?"순행":"역행")+", 대운수 "+o.su+"): "+o.duList.map(function(x){return x.age+"세 "+x.g+"("+x.tg+")";}).join(" → "),
      "- 올해 "+now.getFullYear()+"년 세운: "+H(yp)+"("+sjTenGod(ds,yp.s)+")",
      "",
      "질문: [여기에 궁금한 것을 적으세요. 예) 올해 이직해도 될까요? 어떤 일이 잘 맞나요?]",
      "",
      "풀이할 때는 단정하지 말고, 어느 글자와 어느 글자의 관계에서 그렇게 보는지 근거를 함께 말해 주세요."].join("\n");}
  function sjAiHtml(){
    return '<div class="sj-sec sj-ai"><h3>AI에게 더 물어보기</h3><p>'+bosalImg("magnifier","bs-side","돋보기로 보는 아기보살")+'챗GPT 같은 AI는 사주 여덟 글자를 자주 틀리게 셉니다. 아래 버튼은 여기서 계산을 마친 여덟 글자·오행·대운을 담은 질문문을 복사합니다. AI 창에 붙여 넣고 궁금한 것을 이어서 물어보세요. 생년월일은 들어가지 않습니다.</p>'+
      '<div class="ai-row"><span class="ai-copy" role="button" tabindex="0">질문문 복사</span>'+
      '<a href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a><a href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a><a href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini</a></div>'+
      '<p class="ai-done" aria-live="polite"></p></div>';}
  // 인생 시기표의 "그해 어땠나" — localStorage 에만 둔다. key: 생년월일, 값: {해: 맞음|애매|다름}
  function bindYearFb(el,bkey){
    var box=el.querySelector(".yrs");if(!box)return;var all={};
    try{all=JSON.parse(localStorage.getItem("dnbs_yfb")||"{}");}catch(e){}
    var mine=all[bkey]||{},sum=el.querySelector(".yr-sum");
    function paint(){var c={맞음:0,애매:0,다름:0};
      box.querySelectorAll(".yr.past").forEach(function(r){var v=mine[r.dataset.y];
        r.querySelectorAll(".yr-fb span").forEach(function(s){s.classList.toggle("on",s.dataset.v===v);});if(v)c[v]++;});
      var n=c.맞음+c.애매+c.다름;sum.textContent=n?"적어 둔 "+n+"해 가운데 맞았다 "+c.맞음+" · 애매 "+c.애매+" · 달랐다 "+c.다름+". 이 기록은 이 기기에만 있네.":"";}
    box.addEventListener("click",function(e){var s=e.target.closest(".yr-fb span");if(!s)return;var yy=s.closest(".yr").dataset.y;
      mine[yy]=mine[yy]===s.dataset.v?undefined:s.dataset.v;all[bkey]=mine;try{localStorage.setItem("dnbs_yfb",JSON.stringify(all));}catch(_){}paint();});
    paint();}
  // 궁합 초대 링크 만들기 — 사주 글자 6개와 성별·호칭만 보낸다(worker.js /api/invite, 7일 보관)
  function bindInvite(el,P,g){
    var b=el.querySelector(".gh-mk"),out=el.querySelector(".gh-link"),busy=false;if(!b)return;
    function make(){if(busy)return;busy=true;out.textContent="링크를 만드는 중이네…";
      var n=(el.querySelector(".gh-nick").value||"").trim().slice(0,10);
      fetch("/api/invite",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({p:[P.y.s,P.y.b,P.m.s,P.m.b,P.d.s,P.d.b],g:g,n:n})})
      .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(j){busy=false;track("invite_make",{});
        var url=location.origin+"/gunghap.html?i="+j.id,msg=(n?n+josa(n,"가/이"):"친구가")+" 동네보살에서 우리 사주 궁합 보자고 보냈어. 생일만 넣으면 돼!";
        out.innerHTML='링크를 만들었네. 7일 동안 열리네.<br><a href="'+url+'">'+url+'</a>';
        if(navigator.share)navigator.share({title:"우리 궁합 보자",text:msg,url:url}).catch(function(){});
        else if(navigator.clipboard)navigator.clipboard.writeText(msg+" "+url).then(function(){out.insertAdjacentHTML("beforeend","<br>주소를 복사했네. 카톡에 붙여 넣게.");},function(){});})
      .catch(function(){busy=false;out.textContent="링크를 만들지 못했네. 잠시 뒤 다시 눌러 보게.";});}
    b.addEventListener("click",make);b.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();make();}});}
  function bindAiCopy(el,text){
    var b=el.querySelector(".ai-copy"),msg=el.querySelector(".ai-done");if(!b)return;
    function done(ok){msg.textContent=ok?"복사했습니다. AI 창에 붙여 넣고 질문 칸만 고쳐 쓰세요.":"복사가 막혔습니다. 아래 글을 길게 눌러 복사하세요.";
      if(!ok){var pre=document.createElement("pre");pre.className="ai-text";pre.textContent=text;msg.after(pre);}}
    function copy(){track("share_click",{tool:"saju_ai"});
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){done(true);},function(){done(false);});else done(false);}
    b.addEventListener("click",copy);b.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();copy();}});}
  /* 띠 오늘 점수 — 띠별 운세와 홈 "오늘의 띠 순위"가 같이 쓴다.
     띠(연지)와 오늘 일지의 관계로 기본점수, 오늘 천간이 띠 본기 천간에 갖는 십성으로 보정한다. */
  var ZF_BASE={"삼합":88,"육합":84,"복음":74,"평":72,"해":60,"형":56,"충":52};
  var ZF_TG={"식신":4,"정재":4,"정관":3,"정인":4,"편재":2,"비견":0,"상관":-3,"편인":-2,"겁재":-5,"편관":-5};
  var ZF_LINE={"삼합":"사람이 붙는 날","육합":"걸림 없이 맞물리는 날","복음":"좋고 나쁨이 진해지는 날","평":"평평하게 흘러가는 날",
    "해":"작은 어긋남을 조심할 날","형":"밀어붙이면 마찰이 나는 날","충":"변수가 튀어나오는 날"};
  // 오늘 천간이 띠 본기에 갖는 십성을 짧게 — 띠 운세 총운과 홈 순위(합충 없는 "평"인 띠)가 쓴다
  var ZF_TGW={"비견":"내 힘으로 밀고 가는","겁재":"지출이 새기 쉬운","식신":"표현과 먹을 복이 좋은","상관":"말이 앞서기 쉬운","편재":"큰돈이 움직이는","정재":"성실함이 돈이 되는","편관":"압박과 도전이 따르는","정관":"원칙이 통하는","편인":"생각이 깊어지는","정인":"귀인과 문서의"};
  function zfRel(b,t){
    if(Math.abs(b-t)===6)return"충";
    var H=[[0,3],[2,5],[5,8],[8,2],[1,10],[10,7],[7,1]],i;
    for(i=0;i<H.length;i++)if((H[i][0]===b&&H[i][1]===t)||(H[i][0]===t&&H[i][1]===b))return"형";
    var Y=[[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
    for(i=0;i<Y.length;i++)if((Y[i][0]===b&&Y[i][1]===t)||(Y[i][0]===t&&Y[i][1]===b))return"해";
    if(b===t)return"복음";
    if(b%4===t%4)return"삼합";
    if(sjYukhap(b)===t)return"육합";
    return"평";}
  function zfScore(b,today){var rel=zfRel(b,today.d.b),tg=sjTenGod(SJ_BMAIN[b],today.d.s);
    return {rel:rel,tg:tg,score:Math.max(35,Math.min(98,ZF_BASE[rel]+(ZF_TG[tg]||0)))};}
  /* 띠별 운세 깊이 풀이 — 원고 D(content_zodiac_fortune.js → zf/deep.json)에서 오늘 일진과 내 띠의 관계(7)·오늘 하늘 글자의 역할(10)·띠(12)에 맞는 문장을 고른다.
     순수 함수 — verify 가 12띠 × 60일진으로 검사한다. art 는 관계 그림(있으면 총운 첫 문단 앞에 붙는다) */
  function zfDeep(b,today,D,art){var zf=zfScore(b,today),rel=zf.rel,tg=zf.tg;
    return {rel:rel,tg:tg,secs:[
      {k:"gen",h:"오늘의 총운",p:[(art||"")+D.gen[b][rel],D.tg[tg]]},
      {k:"money",h:"재물·일",p:[D.money[rel]]},
      {k:"love",h:"애정운",p:[D.love[rel]]},
      {k:"body",h:"몸과 마음",p:[D.body[rel]]},
      {k:"tip",h:"조언",p:[D.tip[rel]]}]};}
  function zfYear(b,D){function y(Yb,YW,A,P){var r=zfRel(b,Yb);return {k:"year",h:YW+" 한 해",p:[P&&D.yearAgain?ghFill(D.yearAgain[r],{Y:YW,A:A,P:P}):ghFill(D.year[r],{Y:YW,A:A})]};}
    return [y(7,"2027 정미년","미(未)"),y(6,"2026 병오년","오(午)",zfRel(b,7)===zfRel(b,6)?"2027 정미년":"")];}
  /* 별자리 오늘 점수 — 하루의 결은 오늘 달이 내 별자리와 이루는 각도(ST_MASP)와 이달의 배경인 태양의 각도(ST_ASP)를 반씩 섞고,
     요일 지배성이 내 수호성(+7)·같은 원소 지배성(+3)·그 밖(−3)을 더한다. 별자리 운세와 홈 "오늘의 별자리 순위"가 같이 쓴다.
     rk: 2 수호성의 요일, 1 결이 맞는 요일, 0 결이 다른 요일 / md: 달과의 각 0~6 / dist: 태양과의 각 0~6 */
  var HS_LINE=["달이 내 별자리에 든 날","잔잔하게 흐르는 날","손 뻗으면 기회가 닿는 날","마찰 끝에 자라는 날","순풍이 부는 날","조정과 타협의 날","관계가 주제인 날"];
  var HS_PH=["삭","초승달","상현달","차오르는 달","보름달","기우는 달","하현달","그믐달"];
  function hsGrade(s){return s>=85?"대길":s>=75?"길":s>=60?"평온":"주의";}
  function hsScore(mine,now){now=now||new Date();var y=now.getFullYear(),m=now.getMonth()+1,d=now.getDate(),
      sun=stOf(y,m,d),k=(sun-mine+12)%12,dist=Math.min(k,12-k),A=ST_ASP[dist],
      mo=hsMoon(y,m,d),k2=(mo.sign-mine+12)%12,md=Math.min(k2,12-k2),MA=ST_MASP[md],
      wdr=WD_RULER[now.getDay()],rk=wdr===ST_RULER[mine]?2:ST_ELE_RULERS[ST_ELE[mine%4]].indexOf(wdr)>=0?1:0;
    return {sun:sun,dist:dist,A:A,moon:mo,md:md,MA:MA,wdr:wdr,rk:rk,score:Math.max(35,Math.min(98,Math.round((A[0]+MA[0])/2)+(rk===2?7:rk===1?3:-3)))};}
  function hsRank(now){return ST_KO.map(function(n,i){var h=hsScore(i,now);h.i=i;return h;}).sort(function(x,y){return y.score-x.score||x.i-y.i;});}
  // 이번주 흐름 — 오늘부터 이레, 날마다 그날 달이 든 별자리와 등급
  function hsWeekSec(mine,now){var days=[],i;
    for(i=0;i<7;i++){var dt=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i),h=hsScore(mine,dt),g=hsGrade(h.score);
      days.push({d:(dt.getMonth()+1)+"."+dt.getDate()+" "+WD_KO[dt.getDay()],g:g,c:g==="대길"?"var(--fun-ink)":g==="길"?"var(--accent)":g==="주의"?"var(--deduct)":"var(--muted)",m:ST_SYM[h.moon.sign]+" "+ST_KO[h.moon.sign].replace("자리","")});}
    return {k:"week",h:"이번주 흐름 — 달이 옮겨 가는 길",days:days,n:"칸마다 그날 낮 12시(한국 시각)에 달이 든 별자리와 요일의 별로 매긴 등급입니다. 달은 하루에 약 13도씩 옮겨 가 2~3일마다 별자리가 바뀝니다."};}
  /* 별자리 운세 깊이 풀이 — 원고 D(content_horoscope.js → hs/deep.json)에서 오늘 달의 자리·모양과 내 별자리의 각도에 맞는 문장을 골라 잇는 순수 함수.
     엔진 옆에 둔 이유: verify.js 가 무작위 별자리·날짜로 검사한다. 토큰: {wd} 요일 글자 {wdr} 요일의 별 {ele} 내 원소 {ruler} 내 수호성 {color} 색 */
  function hsDeep(mine,now,D){var hs=hsScore(mine,now),mo=hs.moon,MT=D.moon[hs.md],wd=WD_KO[now.getDay()],M={wd:wd,wdr:hs.wdr,ele:ST_ELE[mine%4],ruler:ST_RULER[mine],color:D.lucky.color[hs.wdr]},secs=[];
    secs.push({k:"sky",h:"오늘 하늘 한눈에",p:[D.sign[mo.sign],D.phase[mo.phase]]});
    secs.push({k:"gen",h:"오늘의 총운",p:[MT.gen,ghFill(D.rnote[hs.rk],M)]});
    secs.push({k:"love",h:"애정운",p:[MT.love]});
    secs.push({k:"work",h:"재물·일",p:[MT.work]});
    secs.push({k:"body",h:"몸과 마음",p:[MT.body]});
    secs.push({k:"tip",h:"조언",p:[MT.tip]});
    secs.push(hsWeekSec(mine,now));
    secs.push({k:"sun",h:"이 달의 큰 배경",p:[D.sun[hs.dist]]});
    secs.push({k:"lucky",h:"오늘 곁에 둘 색",p:[ghFill(D.lucky.line,M)],n:D.note});
    return {secs:secs,hs:hs};}
  /* 별자리 궁합 깊이 풀이 — 원고 D(content_stargunghap.js → sg/deep.json)에서 두 별자리 쌍·원소 조합·각도·수호성 결에 맞는 글을 골라 잇는 순수 함수.
     엔진 옆에 둔 이유: verify.js 가 12×12 모든 조합으로 검사한다. 토큰: {ra} {rb} 두 별자리의 수호성 */
  var SG_ANG=[["같은 자리","합"],["이웃한 자리","세미섹스타일"],["손을 맞잡는 자리","섹스타일"],["직각으로 마주 본 자리","스퀘어"],["순풍이 부는 자리","트라인"],["결이 다른 자리","퀸컹스"],["정반대 자리","오포지션"]];
  function sgAng(dist){return SG_ANG[dist][0]+"("+SG_ANG[dist][1]+" "+dist*30+"°)";}
  function sgDeep(a,b,D){var k=(b-a+12)%12,dist=Math.min(k,12-k),ea=Math.min(a%4,b%4),eb=Math.max(a%4,b%4),rA=ST_RULER[a],rB=ST_RULER[b],
      rFit=(ST_ELE_RULERS[ST_ELE[b%4]].indexOf(rA)>=0?1:0)+(ST_ELE_RULERS[ST_ELE[a%4]].indexOf(rB)>=0?1:0),P=D.pair[Math.min(a,b)+"-"+Math.max(a,b)];
    return {secs:[
      {k:"core",h:"두 사람은 이런 사이야",p:[P.core]},
      {k:"good",h:"함께하면 더 빛나는 순간",p:[P.good]},
      {k:"el",h:"원소로 보면 — "+ST_ELE[a%4]+" × "+ST_ELE[b%4],p:[D.el[ST_ELE[ea]+"-"+ST_ELE[eb]]]},
      {k:"asp",h:"하늘에서의 거리 — "+sgAng(dist),p:[D.asp[dist]]},
      {k:"ruler",h:"수호성으로 보면",p:[ghFill(D.ruler[rFit],{ra:rA,rb:rB})],n:a===b?ST_KO[a]+"의 수호성은 "+rA+"입니다.":ST_KO[a]+"의 수호성은 "+rA+", "+ST_KO[b]+"의 수호성은 "+rB+"입니다."},
      {k:"tip",h:"이렇게 하면 더 좋아지네",p:[P.tip]}],dist:dist,rFit:rFit};}
  /* 공망 찾기 깊이 풀이 — 원고 D(content_gongmang.js → gm/deep.json)에서 자네 순·남는 두 글자·비어 있는 자리·채워지는 해에 맞는 글을 골라 잇는 순수 함수.
     P 사주 기둥, G = sjGongmang(일주), Y = sjGongmang(연주), year 는 채워지는 해를 세기 시작할 양력 해. 엔진 옆에 둔 이유: verify.js 가 60일주 × 시각 유무로 검사한다 */
  function gmDeep(P,G,Y,year,D){
    function nm(b){return SJ_B[b]+"("+SJ_BH.charAt(b)+")";}
    var e1=nm(G.empty[0]),e2=nm(G.empty[1]),B1=D.branch[G.empty[0]],B2=D.branch[G.empty[1]],
      slots=[["y","연지",P.y.b],["m","월지",P.m.b]].concat(P.h?[["h","시지",P.h.b]]:[]),
      hit=slots.filter(function(x){return G.empty.indexOf(x[2])>=0;}),
      pos=hit.length?hit.map(function(x){return '<b>'+x[1]+' '+nm(x[2])+'</b> — '+D.pos[x[0]];}):[D.none],
      lines=[],i,y,br,st;
    pos.push(D.filled);
    for(i=0;i<12;i++){y=year+i;br=((y-4)%12+12)%12;st=((y-4)%10+10)%10;
      if(G.empty.indexOf(br)>=0)lines.push('<b>'+y+'년 '+SJ_S[st]+SJ_B[br]+'년('+SJ_SH.charAt(st)+SJ_BH.charAt(br)+')</b> — '+nm(br)+' 글자가 들어오네.');}
    var yh=[["월지",P.m.b],["일지",P.d.b]].concat(P.h?[["시지",P.h.b]]:[]).filter(function(x){return Y.empty.indexOf(x[1])>=0;}),
      yearNote='연주('+SJ_S[P.y.s]+SJ_B[P.y.b]+') 기준으로 보는 학파도 있어 참고로 적네. 이쪽은 '+nm(Y.empty[0])+'·'+nm(Y.empty[1])+' 두 글자가 비는데, '+
        (yh.length?'자네 자리 중 거기 든 글자는 '+yh.map(function(x){return x[0]+" "+SJ_B[x[1]];}).join(", ")+'일세.':'자네 다른 자리 중에는 거기 드는 글자가 없네.');
    return {secs:[
      {k:"intro",h:"공망이 뭐야?",p:[ghFill(D.intro,{sun:G.sun,start:SJ_S[0]+SJ_B[G.start],end:SJ_S[9]+SJ_B[(G.start+9)%12],ea:e1,eb:e2})]},
      {k:"two",h:"자네 공망 두 글자 — "+e1+" · "+e2,p:[B1.gist.replace(e1,'<b>'+e1+'</b>')+' '+B1.empty,B2.gist.replace(e2,'<b>'+e2+'</b>')+' '+B2.empty]},
      {k:"pos",h:"내 사주에서 비어 있는 자리",p:pos,n:P.h?"":D.nohour},
      {k:"years",h:"공망이 채워지는 해",p:[D.years.head,lines.join("<br>"),D.years.tail]},
      {k:"read",h:"공망은 이렇게 읽으면 편하네",p:D.read.slice()},
      {k:"year",h:"연주 기준으로도 보면(참고)",p:[yearNote]}]};}
  /* 토정비결 결과 구성 — 원고 g(content_tojeong.js → tj/<괘>.json)로 한눈에·총운·분야별·실천·달 표·달별 풀이를 만든다.
     Y 볼 해, cur 이번 달(음력, 없으면 0), starts[m] = [양력 월, 일] 그 음력 달이 시작하는 날. 순수 함수 — verify.js 가 144괘 전부로 검사한다 */
  var TJ_FLOW={g:"좋은 달",o:"무난한 달",c:"차분히 가는 달"},TJ_SHORT={g:"좋은 달",o:"무난한 달",c:"차분한 달"};
  function tjDeep(g,Y,cur,starts){var secs=[],cells=[],order=[],i,m;
    secs.push({k:"sum",h:"올해 한눈에",p:['<span class="tj-sum">'+g.sum+'</span>','<b class="tj-l">옛 그림 풀이</b>'+g.image]});
    secs.push({k:"gen",h:Y+"년 총운",p:[g.chongun]});
    secs.push({k:"area",h:"분야별로 보면",p:['<b class="tj-l">돈</b>'+g.money,'<b class="tj-l">일</b>'+g.work,'<b class="tj-l">사람·사랑</b>'+g.love,'<b class="tj-l">몸과 마음</b>'+g.health]});
    secs.push({k:"tips",h:"이렇게 하면 더 좋아지네",list:g.tips.slice()});
    for(m=1;m<=12;m++){var f=g.flow.charAt(m-1),st=starts&&starts[m];cells.push({m:m,f:f,lab:TJ_SHORT[f],d:st?st[0]+"."+st[1]+"~":"",cur:m===cur});}
    secs.push({k:"grid",h:"달마다 흐름 한눈에",grid:cells,n:"칸 아래 날짜는 그 음력 달이 시작하는 양력 날짜일세. 달마다 자세한 풀이는 아래에 있네."});
    for(i=1;i<=12;i++)order.push(i);if(cur)order=[cur].concat(order.filter(function(x){return x!==cur;}));
    order.forEach(function(mo){var st=starts&&starts[mo],t=g.months[mo],sp=/^(.+?[.!?])\s+([\s\S]*)$/.exec(t);
      secs.push({k:"m"+mo,month:true,h:(mo===cur?"이번 달 — ":"")+"음력 "+mo+"월"+(st?" (양력 "+st[0]+"월 "+st[1]+"일부터)":"")+" · "+TJ_FLOW[g.flow.charAt(mo-1)],p:sp?[sp[1],sp[2]]:[t]});});
    return secs;}
  function tjSecHtml(s){if(s.month)return '<div class="sj-sec gh-deep fold-skip tj-m"><h3 class="tj-ml">'+s.h+'</h3><p class="tj-mh">'+s.p[0]+'</p>'+(s.p[1]?'<p>'+s.p[1]+'</p>':'')+'</div>';
    var h='<div class="sj-sec gh-deep fold-skip"><h3>'+s.h+'</h3>';
    (s.p||[]).forEach(function(x){h+='<p>'+x+'</p>';});
    if(s.list)h+='<ol class="gh-tips">'+s.list.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ol>';
    if(s.grid)h+='<div class="tj-grid">'+s.grid.map(function(c){return '<div class="tj-c'+(c.cur?' cur':'')+'"><div class="a">음력 '+c.m+'월</div><div class="g '+c.f+'1">'+c.lab+'</div><div class="a">'+(c.d||"&nbsp;")+'</div></div>';}).join("")+'</div>';
    if(s.n)h+='<p class="gh-note">'+s.n+'</p>';return h+'</div>';}
  // 12띠를 오늘 점수순으로 — 같은 점수면 자·축·인… 순서
  function zfRank(now){now=now||new Date();var t=sjPillars(now.getFullYear(),now.getMonth()+1,now.getDate(),null,0,false);
    return SJ_TTI.map(function(n,b){var z=zfScore(b,t);z.b=b;return z;}).sort(function(x,y){return y.score-x.score||x.b-y.b;});}
  // 띠·별자리 운세 맨 위에 붙이는 "자네 개인 오늘" — 생일을 모르면 빈 문자열
  function tfPersonalBox(birth){
    var p=(birth||"").split("-");if(p.length<3||!+p[0])return "";
    var t=tfToday(+p[0],+p[1],+p[2]);
    return '<div class="tf-me"><div class="tf-me-k">자네 개인 오늘 운세 <span>오늘의 운세 기준</span></div>'+
      '<div class="tf-me-v">'+t.score+'<small>점 · '+t.grade+' · '+t.rel+'의 날</small></div>'+
      '<p>아래는 같은 무리로 태어난 사람 모두에게 똑같이 나오는 공통 흐름일세. 자네 하루의 기준은 개인 운세야. 둘이 엇갈리면 개인 쪽을 따르게. <a href="todayfortune.html">개인 운세 자세히 →</a></p></div>';}
  function track(ev,p){try{if(typeof gtag==="function")gtag("event",ev,p||{});}catch(e){}try{navigator.sendBeacon("/api/hit",JSON.stringify(ev==="js_error"&&p?{e:ev,m:p.m,f:p.f,p:location.pathname}:{e:ev}));}catch(e){}}
  // P2-4 최소 에러 모니터링 — 외부 서비스 없이 GA4 이벤트로만 수집
  if(typeof window!=="undefined"){
    window.addEventListener("error",function(e){
      track("js_error",{m:String(e.message||"").slice(0,100),f:String(e.filename||"").split("/").pop()});});
    window.addEventListener("unhandledrejection",function(e){
      track("js_error",{m:("promise: "+(e.reason&&e.reason.message||e.reason||"")).slice(0,100)});});}
  function rateBar(n,v){var c=v>=80?"var(--fun)":v>=65?"var(--accent)":"var(--deduct)";
    return '<div class="sj-bar"><span class="n">'+n+'</span><span class="t" role="meter" aria-valuenow="'+v+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+n+' '+v+'점"><i style="width:'+v+'%;background:'+c+'"></i></span><span class="c">'+v+'</span></div>';}
  // ---------- 물어보기 게이트 ----------
  // 입력만 바꿔도 결과가 즉시 나오면 '물어본다'는 감각이 사라진다.
  // 답은 버튼을 눌러야 나오고, 나오기 직전에 보살이 짚어 보는 시간을 둔다.
  var ASK_LABEL="동네보살에게 물어보기";
  /* 점 일기 — 오늘의 운세·타로를 볼 때마다 날짜별로 기기 안(localStorage dnbs_diary)에 적는다.
     같은 날 같은 도구는 마지막 것만 남기고 120개까지. diary.html 이 읽어 "맞았나요?"를 묻는다 */
  function diaryAdd(e){try{var a=JSON.parse(localStorage.getItem("dnbs_diary")||"[]"),n=new Date(),k=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0");
    var old=a.filter(function(x){return x.d===k&&x.t===e.t;})[0];e.d=k;if(old&&old.v)e.v=old.v;
    a=a.filter(function(x){return !(x.d===k&&x.t===e.t);});a.unshift(e);localStorage.setItem("dnbs_diary",JSON.stringify(a.slice(0,120)));}catch(_){}}
  function diaryNote(){return '<p class="diary-note">'+bosalImg("diary","dn-bosal","")+'<span>이 결과는 <a href="diary.html">운세 일기</a>에 적어 뒀네. 며칠 뒤 맞았는지 눌러 보게.</span></p>';}
  /* 아기보살 — 동네보살의 얼굴. 자세별 그림(img/bosal/<자세>.webp)을 자리마다 골라 쓴다.
     점수로 고를 때: 85 이상 만세(cheer), 60 이상 미소(smile), 그 아래 걱정하며 토닥(worry) */
  function bosalImg(pose,cls,alt){return '<img class="bosal'+(cls?" "+cls:"")+'" src="img/bosal/'+pose+'.webp" alt="'+(alt||"아기보살")+'" loading="lazy" decoding="async" onerror="this.remove()">';}
  function bosalPose(score){return score>=85?"cheer":score>=60?"smile":"worry";}
  function bosalSay(pose,html){return '<div class="bosal-say">'+bosalImg(pose,"bs-av")+'<div class="bs-b">'+html+'</div></div>';}
  var BOSAL_LINE=[[85,"좋은 날일세! 오늘은 자네가 먼저 움직여도 되네."],[75,"괜찮은 흐름이야. 하던 일에 힘을 실어 보게."],[60,"무난한 날일세. 서두르지만 않으면 되네."],[0,"천천히 가면 더 좋은 날이네. 아래 '조언'부터 먼저 읽고 가게."]];
  function askWait(msg){
    return '<div class="ask-wait">'+bosalImg("smile","aw-bosal","자네를 기다리는 아기보살")+'<div class="ic">🔮</div><div class="t">'+(msg||"아직 안 물어봤네.")+'</div>'+
      '<div class="d">생년월일을 맞춘 뒤 위 버튼을 누르게.<br>같은 날 같은 생일이면 몇 번을 눌러도 같은 답이 나오네.</div></div>';}
  var ASK_GANJI="甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";
  // 버튼을 누른 뒤 결과까지 약 1초. 릴이 돌고 짚는 순서가 한 줄씩 지나간다.
  function askThink(out,btn,steps,done){
    var reel="";for(var i=0;i<14;i++)reel+=ASK_GANJI.charAt(Math.floor(Math.random()*ASK_GANJI.length));
    out.innerHTML='<div class="ask-think">'+bosalImg("crystal","at-bosal","수정구를 들여다보는 아기보살")+'<div class="ask-reel"><i>'+reel.split("").join("<br>")+'</i></div>'+
      '<div class="ask-step"></div><div class="ask-dots">'+steps.map(function(){return "<span></span>";}).join("")+'</div></div>';
    var stepEl=out.querySelector(".ask-step"),dots=out.querySelectorAll(".ask-dots span");
    var was=btn?btn.textContent:"",n=0;
    if(btn){btn.disabled=true;btn.textContent="보살이 짚어 보는 중…";}
    (function tick(){
      if(n<steps.length){
        stepEl.textContent=steps[n];
        if(dots[n])dots[n].classList.add("on");
        n++;setTimeout(tick,340);return;}
      if(btn){btn.disabled=false;btn.textContent=was;}
      done();
    })();}
  // 결과 섹션을 위에서부터 차례로 띄운다. 지연은 12번째 이후로는 늘리지 않는다.
  // 애니메이션이 끝나면 클래스를 걷어낸다. 백그라운드 탭처럼 애니메이션이
  // 아예 돌지 않는 상황에서 opacity:0인 채로 남는 것을 막는다.
  function reveal(out){
    var kids=Array.prototype.slice.call(out.children),i,d;
    for(i=0;i<kids.length;i++){
      d=Math.min(i,12)*55;
      kids[i].classList.add("rv");
      kids[i].style.animationDelay=d+"ms";}
    setTimeout(function(){
      kids.forEach(function(k){k.classList.remove("rv");k.style.animationDelay="";});},1300);}
  // 점수는 0에서 올라간다. 숫자가 멈추는 순간이 이 도구의 결과 발표다.
  function countUp(node,to,ms){
    if(!node)return;var t0=null,dur=ms||620;
    // 백그라운드 탭에서는 rAF가 멈춘다. 최종값을 먼저 써 두어야 점수 자리가 비지 않는다
    node.textContent=to;
    if(typeof requestAnimationFrame!=="function")return;
    function f(ts){
      if(t0===null)t0=ts;
      var p=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-p,3);
      node.textContent=Math.round(to*e);
      if(p<1)requestAnimationFrame(f);else node.textContent=to;}
    requestAnimationFrame(f);}
  // 막대도 0에서 채운다. 목표 폭은 인라인 style에 이미 들어 있으므로 잠깐 0으로 눌렀다 되돌린다.
  // rAF는 백그라운드 탭에서 멈춘다. 되돌리는 쪽은 타이머로 걸어야 막대가 0에 머물지 않는다
  function fillBars(out){
    var bars=out.querySelectorAll(".sj-bar .t i");
    Array.prototype.forEach.call(bars,function(b,i){
      var w=b.style.width;b.style.width="0";b.style.transition="width .7s cubic-bezier(.2,.8,.2,1) "+(i*90+120)+"ms";
      setTimeout(function(){b.style.width=w;},20);});}
  // 결과 카드에 등급 뱃지를 달고, 대길일 때만 한 번 번쩍인다.
  // 점수가 없는 도구(사주 명식)는 뱃지·번쩍임 없이 넘어간다.
  function gradeFx(out,score,grade){
    var card=out.querySelector(".out");if(!card)return;
    if(grade){var s=card.querySelector(".s");
      // 앞에 공백을 둔다. 없으면 스크린리더·복사 텍스트에서 "…의 날길"로 붙어 읽힌다
      if(s)s.insertAdjacentHTML("beforeend",' <span class="grade-tag g-'+grade+'">'+grade+'</span>');}
    if(typeof score!=="number"||!isFinite(score))return;
    var v=card.querySelector(".v");
    if(v){var small=v.querySelector("small"),txt=document.createElement("span");
      v.insertBefore(txt,v.firstChild);
      // 숫자만 0에서 올린다. 뒤에 붙는 "점 · 등급" 표기는 그대로 둔다
      Array.prototype.slice.call(v.childNodes).forEach(function(n){
        if(n!==txt&&n!==small&&n.nodeType===3)n.textContent="";});
      countUp(txt,score);}
    if(score>=85)card.classList.add("hit");}
  // ---------- 연속 확인 스트릭 ----------
  // 어제 봤으면 +1, 오늘 이미 봤으면 그대로, 끊겼으면 1부터 다시.
  function bumpStreak(){
    var p=loadPrefs(),today=new Date(),key=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    if(p.stDay===key)return {n:p.stN||1,fresh:false};
    var y=new Date(today.getFullYear(),today.getMonth(),today.getDate()-1);
    var yKey=y.getFullYear()+"-"+(y.getMonth()+1)+"-"+y.getDate();
    var n=(p.stDay===yKey)?(p.stN||1)+1:1;
    savePrefs({stDay:key,stN:n});
    return {n:n,fresh:true};}
  function streakHtml(s){
    var cal="";for(var i=0;i<7;i++)cal+='<i class="'+(i<Math.min(s.n,7)?"on":"")+'"></i>';
    var msg=s.n<=1?"오늘부터 세어 보겠네. 내일도 오게.":
      s.n<7?"자네, <b>"+s.n+"일</b> 연속으로 물어보러 왔군.":
      "<b>"+s.n+"일</b> 연속일세. 이쯤이면 습관이야.";
    return '<div class="streak"><span>🔥</span><span>'+msg+'</span><span class="cal">'+cal+'</span></div>';}
  // ---------- 오늘의 부적 ----------
  // 하루 한 번만 열린다. 같은 날 다시 눌러도 같은 문장이 나오도록 날짜+점수로 뽑는다.
  var BUJEOK=[
   ["막힌 문 앞에서 돌아서지 말 것","오늘 한 번 더 두드리면 열리는 문이 있네. 두 번은 말고 한 번만 더 하게."],
   ["작게 시작한 것을 끝까지","크게 벌인 것보다 작게 끝낸 것이 오늘 자네를 살리네."],
   ["말보다 한 박자 늦게","오늘 참은 한마디가 이번 주를 조용하게 만드네."],
   ["먼저 연락하는 쪽이 이긴다","자존심은 내일도 쓸 수 있네. 오늘은 관계를 먼저 놓게."],
   ["지갑은 닫고 귀는 열고","오늘 들어온 이야기는 값이 나가고, 오늘 나간 돈은 값이 없네."],
   ["몸이 먼저 보낸 신호를 믿게","오늘 피곤한 건 게을러서가 아닐세. 일찍 눕게."],
   ["아는 사람에게 물을 것","혼자 사흘 걸릴 일이 오늘은 한 통이면 풀리네."],
   ["오늘 적어둔 것이 내일의 증거","머리에만 두지 말고 날짜 찍히는 곳에 남기게."]];
  function bujeokHtml(score,grade){
    var p=loadPrefs(),now=new Date(),key=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    var idx=(now.getDate()+now.getMonth()*31+score)%BUJEOK.length,b=BUJEOK[idx];
    var first=(p.bjDay!==key);
    if(first)savePrefs({bjDay:key});
    return '<div class="bujeok">'+bosalImg("talisman","bj-bosal","부적을 든 아기보살")+'<div class="k">오늘의 부적 · '+(grade||"")+'</div>'+
      '<div class="w">'+b[0]+'</div><div class="m">'+b[1]+'</div>'+
      '<div class="m" style="margin-top:12px;opacity:.6">'+(first?"오늘 몫은 이걸로 다 썼네. 내일 새로 한 장 나오네.":"오늘은 이미 받아 갔네. 부적은 하루 한 장일세.")+'</div></div>';}
  // 결과 렌더 후 한 번에 거는 마무리 연출. o={score,grade,streak,bujeok}
  function askFx(el,o){
    var out=el.querySelector("#out");if(!out)return;o=o||{};
    if(o.streak)out.insertAdjacentHTML("afterbegin",streakHtml(bumpStreak()));
    if(o.sumO){out.insertAdjacentHTML("afterbegin",sumCard(o.sumO));var so=o.sumO,mx=so.axes.reduce(function(m,a){return a[1]>m[1]?a:m;});
      bindSave(el,{btn:".sj-sum .ss-save",ev:"sum_img",file:"한장요약",draw:function(cb){var bx=out.querySelector(".sj-sum"),tx=function(q){var n=bx&&bx.querySelector(q);return n?n.textContent:"";};
        cb(sumCanvas({ttl:so.ttl,sub:so.sub,arch:tx(".ss-arch-t")||so.arch,archd:tx(".ss-arch-d")||so.archd,chips:bx?[].map.call(bx.querySelectorAll(".ss-chips span"),function(n){return n.textContent;}):so.chips,
        radar:{lab:so.axes.map(function(a){return a[0];}),val:so.axes.map(function(a){return a[1];}),top:100},line:"가장 힘 있는 쪽은 "+mx[0]+"("+mx[1]+"점)일세.",
        pcts:so.pct&&so.pct.v<=60?[[so.pct.v,so.pct.t]]:[]}));}});}
    if(o.bujeok){
      // 공유 버튼 '앞'에 넣는다. parentNode 기준으로 넣으면 #out 밖으로 빠져나간다
      var sb=out.querySelector(".share-btn");
      if(sb)sb.insertAdjacentHTML("beforebegin",bujeokHtml(o.score,o.grade));
      else out.insertAdjacentHTML("beforeend",bujeokHtml(o.score,o.grade));}
    // 긴 풀이는 분류 + 핵심 한 문장으로 접는다. 첫 칸 하나만 펼쳐 둔다
    var pc=el.querySelectorAll(".ppl-c.on");
    if(pc.length===1&&el.querySelectorAll(".ppl").length===1&&!out.querySelector(".nm-done")){var pn=((pc[0].firstChild&&pc[0].firstChild.nodeValue)||"").trim();if(pn&&!/^(나|내|저|본인|자신)$/.test(pn))nmSwap(out,nmHon(pn));}
    plainWords(out);foldAll(out,{open:o.open||1});sjToon(out,o.toon);
    gradeFx(out,o.score,o.grade);reveal(out);fillBars(out);
    var top=out.querySelector(".out");
    if(o.score!=null&&top&&!out.querySelector(".bosal-say")){
      var ln=o.say||BOSAL_LINE.filter(function(x){return o.score>=x[0];})[0][1];
      top.insertAdjacentHTML("afterend",bosalSay(o.pose||bosalPose(o.score),ln));}
    if(top&&top.scrollIntoView)try{top.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}}
  // 물어보기 배선 — 초기엔 대기 화면, 버튼을 눌러야 짚어 보고 답이 나온다
  function askWire(el,go,steps,waitMsg,seer){
    var btn=el.querySelector("#go"),out=el.querySelector("#out");
    if(out)out.innerHTML=askWait(waitMsg);
    if(btn)btn.addEventListener("click",function(){if(seer)seerThink(out,btn,steps,go,seer);else askThink(out,btn,steps,go);});}
  /* 꼬리질문 — 결과 뒤에 보살이 "더 궁금한 게 있나? 어떤 내용이야?" 하고 묻는다. 칩을 누르면 답이 나오고,
     그 답에서 이어지는 다음 질문을 또 내민다(pool[k].next). 처음 묻는 화면(재물·일 고르기, 타로 고민 고르기)은 그대로 두고 그 뒤에만 붙는다.
     cfg: {tool, intro, first:[키], skip:[이미 물은 키], load:function(cb), pool:{키:{label, next:[키], ans:function(){return html;}}}} */
  function tailAsk(host,cfg){
    if(!host||!cfg)return;
    var asked={},RMq=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    (cfg.skip||[]).forEach(function(k){asked[k]=1;});
    host.innerHTML='<div class="tail"><div class="tail-h">'+bosalImg("magnifier","tail-bs","돋보기로 보는 아기보살")+'<div class="tail-say">'+cfg.intro+'</div></div>'+
      '<div class="tail-log" aria-live="polite"></div><div class="tail-chips"></div></div>';
    var log=host.querySelector(".tail-log"),chips=host.querySelector(".tail-chips");
    function rest(){return Object.keys(cfg.pool).filter(function(k){return !asked[k];});}
    function draw(list,more){
      chips.innerHTML=list.map(function(k){return '<span class="tail-chip" role="button" tabindex="0" data-k="'+k+'">'+cfg.pool[k].label+'</span>';}).join("")+
        (more?'<span class="tail-chip tail-more" role="button" tabindex="0" data-more="1">다른 것도 물어볼래</span>':"");}
    function offer(ids){
      var r=rest();
      if(!r.length){chips.innerHTML='<p class="tail-end">궁금한 건 여기까지 다 짚었네. 다른 걸 또 보고 싶으면 위에서 다시 물어보게.</p>';return;}
      var list=(ids||[]).filter(function(k){return cfg.pool[k]&&!asked[k];}).slice(0,3);
      if(!list.length)list=r.slice(0,3);
      draw(list,r.length>list.length);}
    chips.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("tail-chip")){e.preventDefault();e.target.click();}});
    chips.addEventListener("click",function(e){
      var b=e.target.closest&&e.target.closest(".tail-chip");if(!b)return;
      if(b.dataset.more){draw(rest(),false);return;}
      var k=b.dataset.k,q=cfg.pool[k];if(!q||asked[k])return;
      asked[k]=1;chips.innerHTML="";
      log.insertAdjacentHTML("beforeend",'<div class="tail-q">'+q.label+'</div><div class="tail-a tail-wait" aria-label="보살이 짚어 보는 중"><span></span><span></span><span></span></div>');
      var slot=log.lastElementChild;
      track("tail_ask",{tool:cfg.tool});
      function run(){
        var h="";try{h=q.ans();}catch(err){h="";}
        setTimeout(function(){
          slot.className="tail-a";
          slot.innerHTML=h||'<p>이 물음에 답할 글을 아직 못 불러왔네. 잠시 뒤에 다시 물어보게.</p>';
          if(typeof plainWords==="function")try{plainWords(slot);}catch(err){}
          try{slot.scrollIntoView({behavior:RMq?"auto":"smooth",block:"nearest"});}catch(err){}
          offer(q.next);},RMq?0:800);}
      if(cfg.load)cfg.load(run);else run();});
    offer(cfg.first);}
  // 풀이가 긴 도구 — 진지한 보살이 짚어 보는 시간을 최소 o.min 동안 둔다. 짧으면 긴 풀이가 가볍게 읽힌다
  function seerThink(out,btn,steps,done,o){
    o=o||{};
    var total=Math.max(o.min||4000,steps.length*600),per=total/steps.length,n=0,was=btn?btn.textContent:"";
    if(btn){btn.disabled=true;btn.textContent="보살이 짚어 보는 중…";}
    out.innerHTML='<div class="tr-seer"><div class="tr-aura"></div>'+
      '<img src="img/mascot-serious.webp" alt="진지하게 들여다보는 동네보살" width="335" height="560" onerror="this.remove()">'+
      '<p class="tr-seer-t">'+(o.title||"보살이 짚어 보는 중일세")+'</p><p class="tr-seer-s" aria-live="polite"></p><div class="tr-seer-bar"><i></i></div></div>';
    try{out.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}
    var sEl=out.querySelector(".tr-seer-s"),bar=out.querySelector(".tr-seer-bar i");
    bar.style.transition="width "+total+"ms linear";
    setTimeout(function(){bar.style.width="100%";},40);
    (function tick(){
      if(n<steps.length){sEl.textContent=steps[n++];setTimeout(tick,per);return;}
      if(btn){btn.disabled=false;btn.textContent=was;}
      done();})();}
  // 긴 결과는 앞 몇 덩어리만 차례로 띄우고, 나머지는 스크롤해 닿을 때 떠오르게 한다.
  // 스무 덩어리를 전부 줄 세워 띄우면 끝까지 기다리다 지친다
  function slowReveal(out,first,gap){
    first=first||6;gap=gap||380;
    var kids=Array.prototype.slice.call(out.children);
    var io=(typeof IntersectionObserver!=="undefined")?new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove("sj-wait");e.target.classList.add("tr-in");io.unobserve(e.target);}});},
      {rootMargin:"0px 0px -8% 0px"}):null;
    kids.forEach(function(k,i){
      if(i<first){k.classList.add("tr-in");k.style.animationDelay=(i*gap)+"ms";}
      else if(io){k.classList.add("sj-wait");io.observe(k);}});}
  /* [분류] + 핵심 한 문장만 보이고, 누르면 자세한 풀이가 펼쳐진다.
     핵심은 본문 첫 문장을 끌어올려 쓴다 — 도구마다 요약을 따로 쓰지 않아도 된다.
     opts.key 로 직접 정할 수도 있고, opts.open 이면 처음부터 펼쳐 둔다. */
  /* 명리 용어 → 쉬운 말. 처음 나올 때만 "쉬운 말(용어)"로 한 번 알려주고,
     그 뒤부터는 쉬운 말만 쓴다. 조사(은·는·이·가…)가 붙은 꼴만 바꾸므로
     "편관격"처럼 다른 낱말에 붙은 글자는 건드리지 않는다. */
  var PLAIN_WORDS=[
    ["십이운성","기운의 단계"],["신강","힘이 넉넉한 편"],["신약","채워 가며 크는 편"],
    ["용신","나를 받쳐 주는 기운"],["기신","나를 눌러 힘 빼는 기운"],
    ["일간","나를 뜻하는 글자"],["일지","태어난 날 글자"],["월지","태어난 달 글자"],["연지","태어난 해 글자"],
    ["천간","하늘 글자"],["지지","날짜 글자"],["본기","속 글자"],
    ["대운","10년 흐름"],["세운","올해 흐름"],["격국","타고난 그릇"],["신살","눈에 띄는 기운"],
    ["명식","사주 여덟 글자"],["원국","사주 여덟 글자"],["십성","열 가지 역할"],
    ["비겁","경쟁·자립의 기운"],["비견","나와 나란한 기운"],["겁재","나눠 갖는 기운"],
    ["식상","표현·재주의 기운"],["식신","느긋한 재주"],["상관","튀는 재주"],
    ["재성","돈 기운"],["정재","꾸준한 돈 기운"],["편재","크게 도는 돈 기운"],
    ["관성","일·책임의 기운"],["정관","반듯한 자리 기운"],["편관","밀어붙이는 기운"],
    ["인성","배움·도움의 기운"],["정인","기대게 해 주는 기운"],["편인","한발 물러서는 기운"],
    ["오행","다섯 기운"],["상생","서로 살리는 사이"],["상극","서로 누르는 사이"],
    ["삼합","셋이 뭉치는 짝"],["육합","둘이 맞는 짝"]];
  // 용어 풀이 상자와 표·칩은 그대로 둔다. 풀이 상자는 용어를 설명하는 곳이고,
  // 표는 칸이 좁아 긴 풀어쓴 말이 들어가면 줄이 깨진다
  // 조사 짝 — hub의 josa()는 "무받침/받침" 순서다
  var PLAIN_JOSA={"은":"는/은","는":"는/은","이":"가/이","가":"가/이","을":"를/을","를":"를/을",
    "과":"와/과","와":"와/과","으로":"로/으로","로":"로/으로","이라":"라/이라","라":"라/이라",
    "이란":"란/이란","란":"란/이란","이야":"야/이야","야":"야/이야"};
  var PLAIN_AMBIG={"세운":1,"상관":1,"인성":1,"지지":1};
  var PLAIN_SKIP="a,.sj-basis,.sj-ai,.yrs,.sj-gloss,.sj-daeun,.sj-grid,.sj-bars,.chips,.gh-pair,.sj-char,table";
  function plainTxt(t){if(typeof document==="undefined")return t;var d=document.createElement("div");d.textContent=t;plainWords(d);return d.textContent;}
  function plainWords(root){
    if(!root||typeof document==="undefined")return;
    var seen={},w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),tn,nodes=[];
    while((tn=w.nextNode()))nodes.push(tn);
    nodes.forEach(function(t){
      var s=t.nodeValue;
      if(!s||!/[가-힣]/.test(s))return;
      if(t.parentElement&&t.parentElement.closest(PLAIN_SKIP))return;
      s=plainStr(s,seen);
      if(s!==t.nodeValue)t.nodeValue=s;
    });
  }
  /* 글 한 토막의 용어를 쉬운 말로. seen 은 한 화면 안에서 처음 나온 용어에만 괄호를 달려고 이어 쓴다.
     빌드도 이걸 쓴다 — 서버가 끼우는 오늘의 운세 글(today/*.json)이 화면과 같은 말이 되게 */
  function plainStr(s,seen){
    PLAIN_WORDS.forEach(function(pair){
        var term=pair[0],plain=pair[1];
        /* 앞에 한글이 붙지 않은 자리에서만 바꾼다("편관격"은 건드리지 않는다).
           뒤에 붙은 조사는 함께 붙잡아 바꿔 넣을 말에 맞게 다시 고른다
           — 그러지 않으면 "천간이"가 "위 글자이"가 된다. */
        // 조사 뒤에 "는/도/만"이 한 번 더 붙는 꼴(…에게는, …으로도)까지 받는다
        var re=new RegExp("(^|[^가-힣])"+term+"(에게서|에서|에게|까지|부터|처럼|보다|으로|이라|이란|이야|이며|이고|일세|은|는|이|가|을|를|과|와|의|에|로|라|란|야|며|고|도|만)?(는|도|만|은)?(?=[^가-힣]|$)","g");
        s=s.replace(re,function(m,pre,jo,jo2,off,str){
          if(pre==="("&&str.charAt(off+m.length)===")")return m;
          // 일상어와 겹치는 용어는 조사 없이 뒤에 낱말이 이어지면 그 말로 본다
          // ("질서로 세운 기반", "상관 없이", "인성 교육", "기가 지지 않는다")
          if(!jo&&PLAIN_AMBIG[term]&&/^\s+[가-힣]/.test(str.slice(off+m.length)))return m;
          var first=!seen[term],word=first?plain+"("+term+")":plain;
          seen[term]=1;
          // 조사는 괄호 앞의 말(쉬운 말)에 맞춘다 — "느긋한 재주(식신)를", "나를 뜻하는 글자(일간)는"
          var base=plain;
          return pre+word+(jo?(PLAIN_JOSA[jo]?josa(base,PLAIN_JOSA[jo]):jo):"")+(jo2||"");});
    });
    return s;}
  /* 그려진 결과의 .sj-sec 단락들을 [분류] + 핵심 한 문장 + 펼쳐보기로 바꾼다.
     제목(h3)이 분류가 되고 본문 첫 문장이 핵심으로 올라간다. 도구마다 원고를 고칠 필요 없이
     렌더 끝에서 한 번만 부르면 된다. opts.open = 처음부터 펼쳐 둘 앞쪽 개수. */
  function foldAll(out,opts){
    if(!out||typeof document==="undefined")return;
    opts=opts||{};
    var secs=Array.prototype.slice.call(out.querySelectorAll(".sj-sec")),n=0;
    secs.forEach(function(sec){
      var h3=sec.querySelector("h3");
      if(!h3||sec.classList.contains("sj-glance")||sec.classList.contains("fold-skip"))return;
      var label=h3.textContent.trim();
      h3.parentNode.removeChild(h3);
      /* 첫 문장 뽑기는 글자(textContent)로 한다. 문단이 <img>나 <span>으로 시작하는 곳이 있어
         마크업째 훑으면 문장 끝을 못 찾는다. 뽑은 만큼은 텍스트 노드에서 지워 중복을 없앤다. */
      var key="",first=sec.querySelector("p");
      if(first){
        /* <br>은 textContent에서 사라져 "…있네.기운이…"처럼 두 문장이 붙는다.
           그러면 첫 문장 찾기가 문장 경계를 놓치고 두 문장을 한꺼번에 집어 올린다.
           훑을 때는 <br>을 줄바꿈으로 세고, 지울 때는 글자 노드에서만 뺀다. */
        var segs=[],scan="";
        (function collect(node){
          for(var c=node.firstChild;c;c=c.nextSibling){
            if(c.nodeType===3){segs.push({n:c,len:c.nodeValue.length});scan+=c.nodeValue;}
            else if(c.nodeName==="BR"){segs.push({br:1,len:1});scan+="\n";}
            else if(c.nodeType===1)collect(c);
          }
        })(first);
        var lead=scan.length-scan.replace(/^\s+/,"").length;
        var m=/^([\s\S]{6,120}?[.!?])(\s|$)/.exec(scan.slice(lead));
        if(m){
          key=m[1].trim();
          var left=lead+m[1].length;
          for(var i=0;i<segs.length&&left>0;i++){
            var sg=segs[i];
            if(sg.br){left-=1;continue;}
            if(sg.len<=left){left-=sg.len;sg.n.nodeValue="";}
            else{sg.n.nodeValue=sg.n.nodeValue.slice(left).replace(/^\s+/,"");left=0;}
          }
          // 앞에 남은 빈 태그와 줄바꿈을 걷어낸다. 안 그러면 본문이 빈 줄로 시작한다
          while(first.firstChild){
            var f=first.firstChild;
            if(f.nodeName==="BR"||(f.nodeType===3&&!f.nodeValue.trim())||
               (f.nodeType===1&&!f.textContent.trim()&&!f.querySelector("img"))){first.removeChild(f);continue;}
            break;
          }
          if(!first.textContent.trim()&&!first.querySelector("img,a"))first.parentNode.removeChild(first);
        }
      }
      var body=document.createElement("div");
      body.className="fold-body";
      while(sec.firstChild)body.appendChild(sec.firstChild);
      // 접을 내용이 없으면 화살표가 헛돈다. 그때는 details 대신 펼쳐진 한 줄로 둔다
      var has=body.textContent.trim().length>0||!!body.querySelector("img,table,.chips,.sj-daeun");
      /* 첫 문장을 뽑고 남은 글이 한두 줄(70자 미만)이면 접을 까닭이 없다 — 눌러서 한 문장 더 보는 카드가 줄줄이 이어지면 내용이 적어 보인다.
         그때는 접지 않고 제목·핵심 문장·남은 글을 그대로 펼쳐 둔다 */
      var flat=has&&body.textContent.trim().length<70&&!body.querySelector("img,table,.chips,.sj-daeun,a,input,button,select"),fold=has&&!flat;
      var d=document.createElement(fold?"details":"div");
      d.className="fold"+(fold?"":" fold-flat");
      if(has){var nth=n++;if(fold&&nth<(opts.open||0))d.open=true;}
      var s=document.createElement(fold?"summary":"div");
      s.className=fold?"":"fold-sum";
      s.innerHTML='<span class="fold-lab"></span><b class="fold-key"></b>';
      s.querySelector(".fold-lab").textContent=label;
      s.querySelector(".fold-key").textContent=key||label;
      d.appendChild(s);
      if(has)d.appendChild(body);
      sec.parentNode.replaceChild(d,sec);
    });
  }
  // 인쇄할 때는 접힌 것도 모두 펼쳐 준다. 접힌 채로 인쇄하면 핵심 문장만 찍힌다
  if(typeof window!=="undefined"&&window.addEventListener)
    window.addEventListener("beforeprint",function(){
      var d=document.querySelectorAll("details.fold");
      for(var i=0;i<d.length;i++)d[i].open=true;});
  // 생년월일 다이얼. 기존 input[type=date]를 감춘 채 값만 갱신하므로 각 도구의 계산 로직은 그대로다.
  // sel = 감출 input의 선택자, 돌릴 때마다 그 날짜의 일진 간지를 보여준다.
  function birthDial(el,sel,onChange){
    if(typeof document==="undefined")return null;
    var inp=el.querySelector(sel);if(!inp)return null;
    var host=inp.parentNode;if(!host)return null; // 검증 하네스의 mock DOM 대비
    var base=(inp.value||"1990-03-15").split("-");
    var Y=+base[0]||1990,M=+base[1]||3,D=+base[2]||15;
    var nowY=new Date().getFullYear();
    var wrap=document.createElement("div");wrap.className="dial";
    var gan=document.createElement("div");gan.className="dial-ganji";
    function pad(n){return n<10?"0"+n:""+n;}
    function daysIn(y,m){return new Date(y,m,0).getDate();}
    function build(unit,from,to,cur,suffix){
      var c=document.createElement("div");c.className="dial-col";c.dataset.unit=unit;
      c.tabIndex=0;c.setAttribute("role","listbox");c.setAttribute("aria-label",suffix);
      c.appendChild(Object.assign(document.createElement("div"),{className:"dial-pad"}));
      for(var v=from;v<=to;v++){
        var i=document.createElement("div");i.className="dial-item"+(v===cur?" on":"");
        i.textContent=v+suffix;i.dataset.v=v;i.setAttribute("role","option");
        c.appendChild(i);}
      c.appendChild(Object.assign(document.createElement("div"),{className:"dial-pad"}));
      return c;}
    var cols={y:build("y",1930,nowY,Y,"년"),m:build("m",1,12,M,"월"),d:build("d",1,daysIn(Y,M),D,"일")};
    wrap.appendChild(cols.y);wrap.appendChild(cols.m);wrap.appendChild(cols.d);
    var selBar=document.createElement("div");selBar.className="dial-sel";wrap.appendChild(selBar);
    /* 숫자 8자리를 직접 치는 칸이 기본이다(달력·다이얼은 폰에서 손이 많이 간다 — 궁합은 다이얼 둘이 화면 두 개 분량이었다).
       다이얼은 '돌려서 고르기'를 눌러야 펼쳐진다. 값은 늘 2000-01-01 꼴 문자열이라 각 도구의 계산은 그대로다 */
    inp.classList.add("dial-typed");
    inp.type="text";inp.inputMode="numeric";inp.maxLength=10;inp.placeholder="예) 19900315";inp.autocomplete="off";
    var err=document.createElement("p");err.className="tf-err";err.setAttribute("role","alert");
    var box=document.createElement("div");box.className="dial-box";
    var anchor=document.createElement("div");anchor.className="dial-anchor";
    var tog=document.createElement("span");tog.className="dial-tog";tog.setAttribute("role","button");tog.tabIndex=0;tog.setAttribute("aria-expanded","false");tog.textContent="돌려서 고르기";
    var after=inp.nextSibling;
    host.insertBefore(err,after);host.insertBefore(gan,after);host.insertBefore(anchor,after);host.insertBefore(tog,after);host.insertBefore(box,after);
    box.appendChild(wrap);
    function center(col){ // 스크롤 위치로 가운데 항목을 판정한다
      var items=col.querySelectorAll(".dial-item");
      var idx=Math.round(col.scrollTop/44);
      return items[Math.max(0,Math.min(items.length-1,idx))];}
    function mark(col){
      var it=center(col);if(!it)return;
      col.querySelectorAll(".dial-item").forEach(function(x){x.classList.toggle("on",x===it);});
      return +it.dataset.v;}
    function scrollTo(col,v,smooth){
      var items=col.querySelectorAll(".dial-item");
      for(var i=0;i<items.length;i++)if(+items[i].dataset.v===v){
        col.scrollTo({top:i*44,behavior:smooth?"smooth":"auto"});return;}}
    /* 연대 점프.
       연도 열은 97칸인데 화면에 3칸만 보인다. 1990(기본값)에서 1966까지 24칸,
       1,056px을 훑어야 한다. 검색 유입은 40~80년대생이 많아 그 거리가 매번 든다.
       10년 단위로 바로 뛰는 칩을 얹는다 — scrollTo/apply를 그대로 쓴다. */
    var era=document.createElement("div");era.className="dial-era";
    var eraFrom=1930, eraTo=Math.floor(nowY/10)*10;
    for(var e=eraFrom;e<=eraTo;e+=10){
      // button 을 쓰면 .tool button 의 !important 배경에 먹힌다. span 으로 피한다
      var chip=document.createElement("span");
      chip.className="dial-era-chip";chip.dataset.era=e;
      chip.setAttribute("role","button");chip.tabIndex=0;
      chip.textContent=(e%100<10?"0":"")+(e%100)+"년대";
      era.appendChild(chip);}
    box.insertBefore(era,wrap);
    era.addEventListener("keydown",function(ev){
      if(ev.key!=="Enter"&&ev.key!==" ")return;
      var t=ev.target.closest(".dial-era-chip");if(!t)return;
      ev.preventDefault();t.click();});
    era.addEventListener("click",function(ev){
      var t=ev.target.closest(".dial-era-chip");if(!t)return;
      var y=+t.dataset.era;
      // 그 연대의 첫 해로 간다. 이미 그 연대면 값은 그대로 두고 위치만 맞춘다
      var target=(Math.floor(Y/10)*10!==y)?y:Y;
      jumping=cols.y;
      scrollTo(cols.y,target,true);
      if(target!==Y)apply(cols.y,target);
      // smooth 스크롤에는 완료 이벤트가 없다. 목표에 닿으면 푼다.
      (function settle(tries){
        var items=cols.y.querySelectorAll('.dial-item');
        var want=-1;
        for(var i2=0;i2<items.length;i2++)if(+items[i2].dataset.v===target){want=i2*44;break;}
        if(want<0||Math.abs(cols.y.scrollTop-want)<2||tries>40){
          jumping=null;mark(cols.y);markEra();return;}
        setTimeout(function(){settle(tries+1);},50);
      })(0);
      markEra();});
    function markEra(){
      var cur=Math.floor(Y/10)*10;
      era.querySelectorAll(".dial-era-chip").forEach(function(c){
        c.classList.toggle("on",+c.dataset.era===cur);});}
    // 일 목록은 실제 일수가 바뀔 때만 다시 만든다. 매번 교체하면 스크롤이 끊긴다
    var dayCount=daysIn(Y,M);
    function rebuildDays(){
      var max=daysIn(Y,M);
      if(max===dayCount&&D<=max)return;
      dayCount=max;if(D>max)D=max;
      var fresh=build("d",1,max,D,"일");
      wrap.replaceChild(fresh,cols.d);cols.d=fresh;bind(fresh);scrollTo(fresh,D,false);}
    var wheelLock=false;
    var jumping=null;   // 연대 점프가 끝날 때까지 scroll 판정을 멈춘다
    // 현재 선택에서 n칸 이동 — 휠·키보드가 함께 쓴다
    function step(col,n){
      var items=col.querySelectorAll(".dial-item"),cur=center(col);
      for(var i=0;i<items.length;i++){
        if(items[i]!==cur)continue;
        var t=items[Math.max(0,Math.min(items.length-1,i+n))];
        col.scrollTo({top:(i+n<0?0:Math.min(items.length-1,i+n))*44,behavior:"smooth"});
        apply(col,+t.dataset.v);
        return;}}
    // 값 확정 — 단위에 따라 Y/M/D를 갱신하고 결과를 다시 계산한다
    function apply(col,v){
      if(col===cols.y&&typeof markEra==="function")setTimeout(markEra,0);
      var u=col.dataset.unit;
      if(u==="y"){if(Y===v)return;Y=v;rebuildDays();}
      else if(u==="m"){if(M===v)return;M=v;rebuildDays();}
      else{if(D===v)return;D=v;}
      mark(col);commit();}
    var selfSet=false; // commit이 만든 change를 직접입력 핸들러가 되받지 않게 하는 표시
    function commit(){
      var v=Y+"-"+pad(M)+"-"+pad(D);
      selfSet=true;inp.value=v;setTimeout(function(){selfSet=false;},0);
      try{ // 간지 미리보기 — 만세력 엔진 재사용
        var p=sjPillars(Y,M,D,null,0,false);
        gan.innerHTML='이 날의 일진 <b>'+SJ_SH[p.d.s]+SJ_BH[p.d.b]+'</b> ('+SJ_S[p.d.s]+SJ_B[p.d.b]+') · '+SJ_TTI[p.y.b]+'띠';
      }catch(e){gan.textContent="";}
      inp.dispatchEvent(new Event("change",{bubbles:true}));
      if(typeof onChange==="function")onChange(v);
      // 날짜를 돌리는 것만으로 답이 나오면 '물어본다'는 감각이 사라진다.
      // 다이얼은 입력만 바꾸고, 답은 물어보기 버튼에서만 나온다.
      }
    var timer=null;
    function bind(col){
      col.addEventListener("scroll",function(){
        if(jumping===col)return;   // 점프 애니메이션 중간값은 버린다
        var v=mark(col);if(v==null)return;
        clearTimeout(timer);
        timer=setTimeout(function(){apply(col,v);},90);});
      // 마우스 휠은 한 틱에 100px 안팎이라 44px 항목을 두세 칸씩 건너뛴다.
      // 기본 스크롤을 막고 한 틱 = 정확히 한 칸으로 고정한다.
      col.addEventListener("wheel",function(e){
        e.preventDefault();
        if(wheelLock)return;
        wheelLock=true;setTimeout(function(){wheelLock=false;},70);
        step(col, e.deltaY>0?1:-1);
      },{passive:false});
      // 클릭 후 드래그로 돌리기 — 손가락으로 굴리듯 위아래로 끈다
      var dragging=false,startY=0,startTop=0,dragMoved=0;
      col.addEventListener("pointerdown",function(e){
        dragging=true;dragMoved=0;startY=e.clientY;startTop=col.scrollTop;
        col.setPointerCapture(e.pointerId);col.style.scrollSnapType="none";});
      col.addEventListener("pointermove",function(e){
        if(!dragging)return;
        var dy=e.clientY-startY;dragMoved=Math.max(dragMoved,Math.abs(dy));
        col.scrollTop=startTop-dy;});
      function endDrag(e){
        if(!dragging)return;
        dragging=false;col.style.scrollSnapType="";
        try{col.releasePointerCapture(e.pointerId);}catch(_){}
        var it=center(col);if(!it)return;
        col.scrollTo({top:Math.round(col.scrollTop/44)*44,behavior:"smooth"});
        apply(col,+it.dataset.v);}
      col.addEventListener("pointerup",endDrag);
      col.addEventListener("pointercancel",endDrag);
      // 끌지 않고 눌렀다 뗀 경우만 클릭으로 본다 (6px 미만)
      col.addEventListener("click",function(e){
        if(dragMoved>6)return;
        var it=e.target.closest(".dial-item");if(!it)return;
        scrollTo(col,+it.dataset.v,true);apply(col,+it.dataset.v);});
      col.addEventListener("keydown",function(e){
        var d=e.key==="ArrowDown"?1:e.key==="ArrowUp"?-1:0;if(!d)return;
        e.preventDefault();
        step(col,d);});}
    bind(cols.y);bind(cols.m);bind(cols.d);
    // 직접 입력 → 다이얼 위치를 맞춘다 (달력에서 고르거나 타이핑한 경우)
    function syncFromInput(){
      if(selfSet)return;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(inp.value||""))return; // 치는 도중의 반쪽 값(1983-06-2)을 다이얼이 06-02 로 채워 마지막 숫자를 밀어내지 않게
      var v=(inp.value||"").split("-");
      if(v.length<3)return;
      var y=+v[0],m=+v[1],d=+v[2];
      if(!y||!m||!d||y<1930||y>nowY)return;
      Y=y;M=m;D=d;rebuildDays();
      // 즉시 이동 — 부드럽게 굴리면 지나가는 중간 연도가 scroll 판정으로 확정돼 입력을 덮어쓴다(1987 입력 → 1988로 계산)
      scrollTo(cols.y,Y,false);scrollTo(cols.m,M,false);scrollTo(cols.d,D,false);
      mark(cols.y);mark(cols.m);mark(cols.d);commit();}
    // 숫자만 쳐도 1990-03-15 꼴로 이어 붙이고, 칸을 누르면 통째로 선택해 바로 덮어쓸 수 있게 한다
    inp.addEventListener("input",function(){if(this.selectionStart===this.value.length){var dg=this.value.replace(/[^0-9]/g,"").slice(0,8),f=dg.slice(0,4)+(dg.length>4?"-"+dg.slice(4,6):"")+(dg.length>6?"-"+dg.slice(6,8):"");if(f!==this.value)this.value=f;}err.textContent="";});
    inp.addEventListener("focus",function(){var e2=this;setTimeout(function(){e2.select();},0);});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();var goBtn=el.querySelector("#go");if(goBtn)goBtn.click();}});
    function bdOk(v){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||"");if(!m)return false;var y=+m[1],mo=+m[2],d=+m[3],t=new Date(y,mo-1,d);return y>=1900&&t.getFullYear()===y&&t.getMonth()===mo-1&&t.getDate()===d&&t<=new Date();}
    // 틀린 값이면 이유를 밝히고 물어보기로 가지 않는다(조상 요소의 캡처 단계라 도구의 버튼 처리보다 먼저 돈다)
    el.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest||!t.closest("#go")||host.offsetParent===null||bdOk(inp.value))return;
      var dg=inp.value.replace(/[^0-9]/g,"");err.textContent=dg.length===8?"없는 날짜예요. 다시 확인해 주세요.":"생년월일 8자리를 숫자로 입력해 주세요. 예) 19900315";
      e.stopImmediatePropagation();e.preventDefault();inp.focus();},true);
    function dialOpen(o){box.classList.toggle("open",o);tog.setAttribute("aria-expanded",String(o));tog.textContent=o?"접기":"돌려서 고르기";
      if(o)requestAnimationFrame(function(){scrollTo(cols.y,Y,false);scrollTo(cols.m,M,false);scrollTo(cols.d,D,false);mark(cols.y);mark(cols.m);mark(cols.d);});}
    tog.addEventListener("click",function(){dialOpen(!box.classList.contains("open"));});
    tog.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();dialOpen(!box.classList.contains("open"));}});
    inp.addEventListener("change",syncFromInput);
    inp.addEventListener("input",syncFromInput);
    // rAF는 백그라운드 탭에서 실행되지 않아 휠이 0(1930년)에 머문 채 값과 어긋난다.
    // 타이머로도 한 번 더 맞춰 초기 위치를 보장한다.
    function settle(){scrollTo(cols.y,Y,false);scrollTo(cols.m,M,false);scrollTo(cols.d,D,false);commit();}
    requestAnimationFrame(settle);setTimeout(settle,0);
    setTimeout(settle,180);
    lunarPick(host,inp,anchor,nowY);
    peopleChips(host,inp,host.querySelector(".lunar-pick")||anchor);
    return wrap;}
  /* 여러 사람 저장 — 나·가족·연인 생일을 이름표로 두고 눌러서 바로 넣는다. 기기 안(localStorage)에만, 8명까지.
     궁합처럼 입력이 둘인 도구는 칸마다 같은 목록을 쓴다 */
  function peopleChips(host,inp,before){
    var box=document.createElement("div");box.className="ppl";host.insertBefore(box,before);
    function get(){try{return JSON.parse(localStorage.getItem("dnbs_people")||"[]");}catch(e){return [];}}
    function put(a){try{localStorage.setItem("dnbs_people",JSON.stringify(a.slice(0,8)));}catch(e){}
      document.querySelectorAll(".ppl").forEach(function(b){if(b._draw)b._draw();});}
    function draw(){var a=get();
      box.innerHTML=a.map(function(x,i){return '<span class="ppl-c'+(x.b===inp.value?' on':'')+'" data-i="'+i+'" role="button" tabindex="0">'+escH(x.n)+'<i data-del="'+i+'" role="button" aria-label="'+escH(x.n)+' 지우기">×</i></span>';}).join("")+
        '<span class="ppl-add" role="button" tabindex="0">+ 지금 생일 저장</span>';}
    box._draw=draw;
    function fill(v){inp.value=v;inp.dispatchEvent(new Event("input",{bubbles:true}));inp.dispatchEvent(new Event("change",{bubbles:true}));draw();}
    function act(e){var t=e.target,a=get();
      if(t.dataset.del!=null){a.splice(+t.dataset.del,1);put(a);return;}
      var c=t.closest(".ppl-c");if(c){var x=a[+c.dataset.i];if(x)fill(x.b);return;}
      if(t.closest(".ppl-add")){t.outerHTML='<input class="ppl-n" maxlength="8" placeholder="이름 (예: 민지)" aria-label="저장할 이름"><span class="ppl-ok" role="button" tabindex="0">저장</span>';box.querySelector(".ppl-n").focus();return;}
      if(t.closest(".ppl-ok")){var n=(box.querySelector(".ppl-n").value||"").trim().slice(0,8);if(!n||!inp.value){draw();return;}
        a=a.filter(function(x){return x.n!==n;});a.unshift({n:n,b:inp.value});put(a);}}
    box.addEventListener("click",act);
    box.addEventListener("keydown",function(e){if(e.key==="Enter"){if(e.target.classList.contains("ppl-n")){e.preventDefault();box.querySelector(".ppl-ok").click();}else if(e.target.getAttribute("role")==="button"){e.preventDefault();e.target.click();}}});
    inp.addEventListener("change",function(){if(!box.querySelector(".ppl-n"))draw();});
    draw();}
  /* 음력 생일 — 40대 이상은 음력 생일을 기억한다. 열면 위 양력 칸의 날짜를 음력으로 바꿔 연·월·일 칸에 먼저 보여 주고(고칠 자리가 보이게),
     그 칸들을 고치면 바로(0.4초 뒤) 양력으로 바꿔 위 입력칸에 넣는다. 반대로 위 양력 칸을 고치면 음력 칸도 따라온다. 계산은 늘 양력 한 가지로 한다.
     예전엔 열어도 1월 1일 같은 엉뚱한 값이 떠 있고 [양력으로 넣기]를 따로 눌러야 해서 "음력 생일을 고쳐도 안 바뀐다"는 말이 나왔다.
     변환(KASI 기준 vendor-lunar.js)은 펼칠 때만 받는다. */
  function lunarPick(host,inp,before,nowY){
    var lp=document.createElement("details");lp.className="lunar-pick";
    var mo="",dd="";for(var i=1;i<=12;i++)mo+='<option value="'+i+'">'+i+'월</option>';for(i=1;i<=30;i++)dd+='<option value="'+i+'">'+i+'일</option>';
    lp.innerHTML='<summary>음력 생일이세요?</summary><div class="lp-row">'+
      '<input type="number" class="lp-y" min="1930" max="'+nowY+'" value="'+((inp.value||"1990").split("-")[0])+'" aria-label="음력 연도" inputmode="numeric">'+
      '<select class="lp-m" aria-label="음력 월">'+mo+'</select><select class="lp-d" aria-label="음력 일">'+dd+'</select>'+
      '<label class="lp-leap"><input type="checkbox" class="lp-l"> 윤달</label>'+
      '<span class="lp-go" role="button" tabindex="0">양력으로 넣기</span></div><p class="lp-note" aria-live="polite"></p>';
    host.insertBefore(lp,before);
    var note=lp.querySelector(".lp-note"),go=lp.querySelector(".lp-go"),busy=false,timer=0;
    // 변환 라이브러리는 열 때 한 번만 받고, 받은 뒤에 할 일을 이어서 한다
    function whenLib(cb){var K=window.KoreanLunarCalendar;if(K){cb(K);return;}
      var sc=document.getElementById("vendor-lunar");
      if(!sc){sc=document.createElement("script");sc.id="vendor-lunar";sc.src="vendor-lunar.js";document.head.appendChild(sc);}
      sc.addEventListener("load",function(){if(window.KoreanLunarCalendar)cb(window.KoreanLunarCalendar);});}
    function q(c){return lp.querySelector(c);}
    // 위 양력 칸 → 음력 칸: 지금 넣은 생일이 음력으로 며칠인지 보여 준다
    function fromSolar(){var v=inp.value||"";if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return;var p=v.split("-");
      whenLib(function(K){var cal=new K();if(!cal.setSolarDate(+p[0],+p[1],+p[2]))return;var L=cal.getLunarCalendar();
        busy=true;q(".lp-y").value=L.year;q(".lp-m").value=L.month;q(".lp-d").value=L.day;q(".lp-l").checked=!!L.intercalation;busy=false;
        note.textContent="지금 넣은 양력 "+(+p[0])+"년 "+(+p[1])+"월 "+(+p[2])+"일은 음력 "+L.year+"년 "+L.month+"월"+(L.intercalation?"(윤달)":"")+" "+L.day+"일일세. 음력 생일이 다르면 이 칸을 고치게. 고치면 바로 위 양력 칸이 바뀌네.";});}
    // 음력 칸 → 위 양력 칸
    function apply(){
      whenLib(function(K){
        var y=+q(".lp-y").value,m=+q(".lp-m").value,d=+q(".lp-d").value,leap=q(".lp-l").checked,cal=new K();
        if(!y||!cal.setLunarDate(y,m,d,leap)){note.textContent="그 해에는 음력 "+m+"월"+(leap?"(윤달)":"")+" "+d+"일이 없네. 날짜나 윤달 표시를 다시 보게.";return;}
        var sl=cal.getSolarCalendar(),v=sl.year+"-"+String(sl.month).padStart(2,"0")+"-"+String(sl.day).padStart(2,"0");
        busy=true;inp.value=v;inp.dispatchEvent(new Event("input",{bubbles:true}));inp.dispatchEvent(new Event("change",{bubbles:true}));busy=false;
        note.textContent="음력 "+y+"년 "+m+"월"+(leap?"(윤달)":"")+" "+d+"일은 양력 "+sl.year+"년 "+sl.month+"월 "+sl.day+"일일세. 위 생년월일 칸에 이 날짜를 넣었네.";});}
    lp.addEventListener("toggle",function(){if(lp.open)fromSolar();});
    // 음력 칸을 고치면 잠깐 뒤 자동으로 넣는다(연도는 네 자리가 될 때까지 기다린다)
    function auto(e){if(busy||!e.target.closest(".lp-row")||e.target===go)return;
      if(e.target.classList.contains("lp-y")&&!/^\d{4}$/.test(e.target.value))return;
      clearTimeout(timer);timer=setTimeout(apply,400);}
    lp.addEventListener("input",auto);lp.addEventListener("change",auto);
    // 위 양력 칸을 손으로 고치면(완성된 날짜일 때) 열려 있는 음력 칸도 따라온다
    function sync(){if(lp.open&&!busy){clearTimeout(timer);timer=setTimeout(fromSolar,300);}}
    inp.addEventListener("input",sync);inp.addEventListener("change",sync);
    go.addEventListener("click",function(){clearTimeout(timer);apply();});
    go.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();clearTimeout(timer);apply();}});}

  function shareBtn(){return '<button type="button" class="share-btn">결과 공유하기</button>'+
    '<button type="button" class="save-btn">이미지로 저장</button>';}
  // 캔버스는 자동 줄바꿈이 없다. 폭을 넘기기 직전 어절에서 끊어 줄 배열로 돌려준다
  function wrapText(ctx,text,maxW){
    var words=String(text).split(" "),lines=[],cur="";
    for(var i=0;i<words.length;i++){
      var test=cur?cur+" "+words[i]:words[i];
      if(ctx.measureText(test).width>maxW&&cur){lines.push(cur);cur=words[i];}else cur=test;}
    if(cur)lines.push(cur);return lines;}
  // 결과 카드 PNG. 점수 카드는 스토리·상태 사진에 바로 쓰도록 9:16(1080×1920), 사주 명식 카드는 3:4. 외부 라이브러리 없이 Canvas만 사용
  // 저장·공유 이미지에 찍히는 주소. 커스텀 도메인이 붙으면 여기 한 줄만 바꾼다
  var BRAND_URL="dongnebosal.com";
  function fortuneCard(o){
    if(typeof document==="undefined")return null;
    // 사주 카드(명식 있음)는 3:4. 나머지는 9:16 — 예전 1350 높이용 배치를 그대로 두고 oy 만큼 내려 가운데에 둔다
    var W=1080,H=o.pillars?1440:1920,oy=o.pillars?0:285,c=document.createElement("canvas");c.width=W;c.height=H;
    var x=c.getContext("2d");
    var g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#0d1424");g.addColorStop(.55,"#131c30");g.addColorStop(1,"#0a0f1a");
    x.fillStyle=g;x.fillRect(0,0,W,H);
    // 별: 좌표는 결정적이어야 같은 결과가 같은 그림을 낸다
    x.fillStyle="rgba(255,255,255,.55)";
    for(var i=0;i<90;i++){var sx=(i*137.5)%W,sy=(i*89.3)%(H*.62),r=(i%3)*.7+.6;
      x.beginPath();x.arc(sx,sy,r,0,6.283);x.fill();}
    x.strokeStyle="rgba(212,175,110,.5)";x.lineWidth=2;x.strokeRect(48,48,W-96,H-96);
    var F='"Noto Sans KR","Malgun Gothic",sans-serif';
    x.textAlign="center";
    x.fillStyle="#d4af6e";x.font="600 34px "+F;
    // 사주 카드만 위로 당겨 공간을 번다. 다른 도구 카드는 예전 좌표 그대로
    x.fillText(o.tool||"오늘의 운세",W/2,o.pillars?150:168+oy);
    if(o.ident){x.fillStyle="#8b95a6";x.font="400 30px "+F;x.fillText(o.ident,W/2,o.pillars?204:224+oy);}
    if(o.pillars&&o.pillars.length){
      // 그림(왼쪽) + 명식 네 기둥(오른쪽). 그림을 못 불러오면 기둥이 폭 전체를 쓴다
      var top=252,side=300,px0=o.art?96+side+28:100,pwid=o.art?W-100-px0:W-200;
      if(o.art){
        x.save();x.beginPath();
        if(x.roundRect)x.roundRect(96,top,side,side,20);else x.rect(96,top,side,side);
        x.clip();x.drawImage(o.art,96,top,side,side);x.restore();
        x.strokeStyle="rgba(212,175,110,.4)";x.lineWidth=2;
        x.beginPath();if(x.roundRect)x.roundRect(96,top,side,side,20);else x.rect(96,top,side,side);x.stroke();}
      var pw=pwid/o.pillars.length;
      for(var q=0;q<o.pillars.length;q++){
        var col=o.pillars[q], cx=px0+pw*q+pw/2, bx=px0+pw*q+5;
        x.fillStyle="rgba(255,255,255,.045)";x.fillRect(bx,top,pw-10,side);
        x.strokeStyle="rgba(212,175,110,.28)";x.lineWidth=1;x.strokeRect(bx,top,pw-10,side);
        x.fillStyle="#8b95a6";x.font="600 23px "+F;x.fillText(col[0],cx,top+42);
        x.fillStyle=col[3]||"#fff";x.font="800 66px "+F;x.fillText(col[1],cx,top+156);
        x.fillStyle=col[4]||"#fff";x.font="800 66px "+F;x.fillText(col[2],cx,top+262);}
      // 오행 분포 한 줄 — 어느 기운이 많고 비었는지
      if(o.bars&&o.bars.length){
        var bw=(W-200)/o.bars.length, byy=top+side+64;
        for(var z=0;z<o.bars.length;z++){
          var e=o.bars[z], ex=100+bw*z+bw/2;
          x.textAlign="right";x.fillStyle=e[2]||"#8b95a6";x.font="700 30px "+F;x.fillText(e[0],ex-4,byy);
          x.textAlign="left";x.fillStyle="#fff";x.font="800 34px "+F;x.fillText(String(e[1]),ex+6,byy);}
        x.textAlign="center";}
      // 상위 % 띠(사주 한 장 요약과 같은 값) — 있으면 그 높이만큼 아래 글을 내린다
      var bo=0;
      if(o.badge){x.font="800 30px "+F;var bwd=x.measureText(o.badge).width+64,bx0=(W-bwd)/2,by0=top+side+104;
        x.fillStyle="rgba(230,178,90,.16)";x.beginPath();if(x.roundRect)x.roundRect(bx0,by0,bwd,54,27);else x.rect(bx0,by0,bwd,54);x.fill();
        x.strokeStyle="rgba(230,178,90,.7)";x.lineWidth=2;x.stroke();x.fillStyle="#f0c46e";x.fillText(o.badge,W/2,by0+38);bo=74;}
      x.strokeStyle="rgba(212,175,110,.25)";x.lineWidth=1;
      x.beginPath();x.moveTo(140,top+side+104+bo);x.lineTo(W-140,top+side+104+bo);x.stroke();
      // 핵심 문장 — 결과 맨 위 한 줄. 원문의 줄 나눔(<br>)을 그대로 살린다
      x.fillStyle="#fff";x.font="800 46px "+F;
      var hs=String(o.headline||"").split("\n"),hl=[];
      for(var h=0;h<hs.length;h++)hl=hl.concat(wrapText(x,hs[h],W-200));
      hl=hl.slice(0,3);
      var hy=top+side+176+bo;
      for(var j=0;j<hl.length;j++)x.fillText(hl[j],W/2,hy+j*60);
      // 본문 200자 내외 — 줄 수를 넘기면 마지막 줄을 말줄임한다
      if(o.body){
        x.fillStyle="#c3ccd9";x.font="400 30px "+F;
        var bl=wrapText(x,o.body,W-220),by=hy+hl.length*60+34,cap=o.badge?7:9;
        if(bl.length>cap){bl=bl.slice(0,cap);bl[cap-1]=bl[cap-1].replace(/.$/,"…");}
        for(var k=0;k<bl.length;k++)x.fillText(bl[k],W/2,by+k*45);}
    }else{
      if(o.score!=null){
        x.fillStyle="#fff";x.font="900 210px "+F;x.fillText(String(o.score),W/2,470+oy);
        x.fillStyle="#d4af6e";x.font="700 60px "+F;x.fillText(o.grade||"",W/2,556+oy);
        // 상위 % 띠(사주 카드와 같은 모양) — 등급과 핵심 문장 사이
        if(o.badge){x.font="800 28px "+F;var sbw=x.measureText(o.badge).width+60,sbx=(W-sbw)/2,sby=590+oy;
          x.fillStyle="rgba(230,178,90,.16)";x.beginPath();if(x.roundRect)x.roundRect(sbx,sby,sbw,48,24);else x.rect(sbx,sby,sbw,48);x.fill();
          x.strokeStyle="rgba(230,178,90,.7)";x.lineWidth=2;x.stroke();x.fillStyle="#f0c46e";x.fillText(o.badge,W/2,sby+34);}}
      else if(o.big){ // 점수 없는 카드(내 일주): 큰 이름 + 한자
        x.fillStyle="#fff";x.font="900 168px "+F;x.fillText(o.big,W/2,470+oy);
        x.fillStyle="#d4af6e";x.font="700 60px "+F;x.fillText(o.grade||"",W/2,556+oy);}
      x.fillStyle="#fff";x.font="800 54px "+F;
      var hl2=wrapText(x,o.headline||"",W-200),hy2=(o.score!=null||o.big?700:520)+oy+(o.badge&&o.score!=null?40:0),endY=hy2+(Math.min(hl2.length,3)-1)*74;
      for(var j2=0;j2<hl2.length&&j2<3;j2++){x.fillText(hl2[j2],W/2,hy2+j2*74);}
      if(o.body){
        x.fillStyle="#c3ccd9";x.font="400 38px "+F;
        var bl2=wrapText(x,o.body,W-220),by2=hy2+hl2.length*74+56,cap2=o.bosalImg||o.photo?4:6;if(bl2.length>cap2){bl2=bl2.slice(0,cap2);bl2[cap2-1]=bl2[cap2-1].replace(/.$/,"…");}
        for(var k2=0;k2<bl2.length&&k2<cap2;k2++){x.fillText(bl2[k2],W/2,by2+k2*60);}
        endY=by2+(Math.min(bl2.length,cap2)-1)*60;}
      // 그림(내 일주 그림처럼 바탕이 있는 그림) — 글이 끝난 아래부터 브랜드 위까지 남는 높이(220~440)에 비율 그대로, 둥근 모서리 + 금빛 테
      if(o.photo){var ph=o.photo,mh=Math.max(220,Math.min(440,H-218-(endY+70))),mw=Math.round(ph.width*mh/ph.height);if(mw>W-240){mw=W-240;mh=Math.round(ph.height*mw/ph.width);}
        var pxx=(W-mw)/2,pyy=H-218-mh;
        x.save();x.beginPath();if(x.roundRect)x.roundRect(pxx,pyy,mw,mh,22);else x.rect(pxx,pyy,mw,mh);x.clip();x.drawImage(ph,pxx,pyy,mw,mh);x.restore();
        x.strokeStyle="rgba(212,175,110,.55)";x.lineWidth=2;x.beginPath();if(x.roundRect)x.roundRect(pxx,pyy,mw,mh,22);else x.rect(pxx,pyy,mw,mh);x.stroke();}
      // 아기보살 — 점수에 맞는 자세. 본문을 네 줄로 줄여 겹치지 않게 한다
      else if(o.bosalImg){var bh=300,bw=Math.round(o.bosalImg.width*bh/o.bosalImg.height);x.drawImage(o.bosalImg,(W-bw)/2,H-218-bh,bw,bh);}}
    // 저장 이미지는 출처를 달고 돌아다닌다. 도메인이 안 보이면 퍼져도 유입이 없다
    // 주소 기준선이 테두리(H-48)와 4px 떨어져 'g' 꼬리가 선을 넘었다. 블록째 올려 테두리와 띄운다
    x.fillStyle="#d4af6e";x.font="700 46px "+F;x.fillText("동네보살",W/2,H-158);
    x.fillStyle="#8b95a6";x.font="400 30px "+F;x.fillText("무료 사주 · 오늘의 운세",W/2,H-118);
    x.fillStyle="#d4af6e";x.font="600 34px "+F;x.fillText(BRAND_URL,W/2,H-76);
    return c;}
  function bindSave(el,opts){
    var b=el.querySelector(opts&&opts.btn||".save-btn");if(!b)return;var lab=b.textContent;
    b.addEventListener("click",function(){
      track(opts&&opts.ev||"image_save",{tool:location.pathname});
      var name=(opts&&opts.file||"dongnebosal")+".png";
      function reset(){b.textContent=lab;}
      function finish(c){
        if(!c){reset();return;}
        try{c.toBlob(function(blob){
          if(!blob){b.textContent="저장 실패";return;}
          var f=null;
          try{f=new File([blob],name,{type:"image/png"});}catch(e){}
          if(f&&navigator.canShare&&navigator.canShare({files:[f]})){
            navigator.share({files:[f]}).catch(function(){}).then(reset);
          }else{
            var u=URL.createObjectURL(blob),a=document.createElement("a");
            a.href=u;a.download=name;document.body.appendChild(a);a.click();
            document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(u);},1500);
            reset();}
        },"image/png");}catch(e){b.textContent="저장 실패";}}
      b.textContent="만드는 중...";
      // 카드 그림처럼 불러와야 그릴 수 있는 이미지는 draw 가 다 그린 뒤 캔버스를 넘긴다
      if(opts&&opts.draw){opts.draw(finish);return;}
      var o2=typeof opts==="function"?opts():opts;
      if(o2&&o2.score!=null&&!o2.pillars){var bi=new Image();
        bi.onload=function(){o2.bosalImg=bi;finish(fortuneCard(o2));};bi.onerror=function(){finish(fortuneCard(o2));};
        bi.src="img/bosal/"+(o2.pose||bosalPose(o2.score))+".webp";return;}
      finish(fortuneCard(o2));});}
  function ymd3(y,m,d){return y+"."+String(m).padStart(2,"0")+"."+String(d).padStart(2,"0");}
  // 신년운세 깊이 풀이 한 칸을 그린다(접지 않고 펼친 채로). 달·일 종류별 줄, 약속 목록, 근거 고지까지
  function nySecHtml(s){var h='<div class="sj-sec gh-deep fold-skip"><h3>'+s.h+'</h3>';
    (s.p||[]).forEach(function(x){h+='<p>'+x+'</p>';});
    if(s.rows)h+='<div class="gh-yrs">'+s.rows.map(function(r){return '<div class="gh-yr"><div><b>'+r.h+'</b> <span class="gh-v '+r.c+'">'+r.v+'</span></div><div class="gh-yl">'+r.sub+'</div><p class="ny-mt">'+r.t+'</p></div>';}).join("")+'</div>';
    if(s.list)h+='<ol class="gh-tips">'+s.list.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ol>';
    if(s.n)h+='<p class="gh-note">'+s.n+'</p>';return h+'</div>';}
  // 별자리 운세 깊이 풀이 한 칸을 그린다(접지 않고 펼친 채로). 이번주 표(days)와 근거 고지까지
  function hsSecHtml(s){var h='<div class="sj-sec gh-deep fold-skip"><h3>'+s.h+'</h3>';
    (s.p||[]).forEach(function(x){h+='<p>'+x+'</p>';});
    if(s.days)h+='<div class="sj-daeun" tabindex="0" role="group" aria-label="'+s.h+'">'+s.days.map(function(d){return '<div class="sj-du"><div class="a">'+d.d+'</div><div class="g" style="font-size:14px;color:'+d.c+'">'+d.g+'</div><div class="a">'+d.m+'</div></div>';}).join("")+'</div>';
    if(s.n)h+='<p class="gh-note">'+s.n+'</p>';return h+'</div>';}
  // 생년월일 숫자 입력: 8자리만 치면 1995.01.01 꼴로 이어 붙이고, 틀리면 이유를 밝히며 결과로 가지 않는다
  function bdFmt(v){var d=v.replace(/[^0-9]/g,"").slice(0,8);return d.slice(0,4)+(d.length>4?"."+d.slice(4,6):"")+(d.length>6?"."+d.slice(6,8):"");}
  function bdParse(v,err){var d=v.replace(/[^0-9]/g,""),msg="";
    if(d.length!==8)msg="생년월일 8자리를 숫자로 입력해 주세요. 예) 19900315";
    else{var y=+d.slice(0,4),m=+d.slice(4,6),dd=+d.slice(6,8),t=new Date(y,m-1,dd);if(y<1900||t.getFullYear()!==y||t.getMonth()!==m-1||t.getDate()!==dd||t>new Date())msg="없는 날짜예요. 다시 확인해 주세요.";}
    if(msg){if(err)err.textContent=msg;return "";}if(err)err.textContent="";return d.slice(0,4)+"-"+d.slice(4,6)+"-"+d.slice(6,8);}
  function bdBind(el,sel,errSel){var inp=el.querySelector(sel),err=el.querySelector(errSel),btn=el.querySelector("#go");if(!inp)return;
    inp.addEventListener("input",function(){if(this.selectionStart===this.value.length){var f=bdFmt(this.value);if(f!==this.value)this.value=f;}if(err)err.textContent="";});
    inp.addEventListener("focus",function(){var e=this;setTimeout(function(){e.select();},0);});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"&&btn){e.preventDefault();btn.click();}});
    if(btn)btn.addEventListener("click",function(e){if(!bdParse(inp.value,err)){e.stopImmediatePropagation();inp.focus();}});}
  // 태어난 시각 칸 — 0930·930·9:30·9시 30분·오후 2시 30분·14 처럼 사람이 적는 꼴을 HH:MM 으로 읽는다.
  // 못 읽으면 이유(err)를 돌려준다: 조용히 버리면 시주 카드만 빠진 채 결과가 나와 왜 빠졌는지 모른다
  function clockSay(H,M){function z(n){return n<10?"0"+n:""+n;}
    var w=H===0?"밤 12시":H<6?"새벽 "+H+"시":H<12?"오전 "+H+"시":H===12?"낮 12시":H<18?"오후 "+(H-12)+"시":H<21?"저녁 "+(H-12)+"시":"밤 "+(H-12)+"시";
    return w+(M?" "+M+"분":"")+" ("+z(H)+":"+z(M)+")";}
  function clockParse(s){s=String(s==null?"":s).trim();if(!s)return {ok:true,v:"",say:"",err:""};
    var pm=/오후|저녁|밤|낮|p\.?m/i.test(s),am=/오전|새벽|아침|a\.?m/i.test(s),night=/밤/.test(s),
      t=s.replace(/오전|오후|새벽|아침|저녁|밤|낮|[ap]\.?m\.?/ig,"").trim(),H=-1,M=0,m;
    if((m=/^(\d{1,2})\s*[:.시]\s*(\d{1,2})\s*분?$/.exec(t))){H=+m[1];M=+m[2];}
    else if((m=/^(\d{1,2})\s*시?$/.exec(t)))H=+m[1];
    else if((m=/^(\d)(\d{2})$/.exec(t))){H=+m[1];M=+m[2];}
    else if((m=/^(\d{2})(\d{2})$/.exec(t))){H=+m[1];M=+m[2];}
    if(H>=0){if(pm&&H<12)H+=12;if(H===12&&night)H=0;if(H===12&&am&&!pm)H=0;}
    if(H<0||H>23||M>59)return {ok:false,v:"",say:"",err:"시각을 읽지 못했네. 숫자 4자리(24시간제)로 적어 주게. 예) 오전 9시 30분은 0930, 오후 2시 30분은 1430일세."};
    return {ok:true,v:(H<10?"0"+H:""+H)+":"+(M<10?"0"+M:""+M),say:clockSay(H,M),err:""};}
  // 이름을 물었으면 결과에서 그 이름으로 부른다("민지 님"). 엄마·아빠처럼 이미 호칭이면 님을 더 붙이지 않는다
  function nmHon(n){n=String(n||"").trim();if(!n)return "";return /(님|씨|엄마|아빠|어머니|아버지|할머니|할아버지|언니|오빠|누나|형|동생|이모|삼촌|고모|남편|아내|남친|여친|아들|딸|친구)$/.test(n)?n:n+" 님";}
  // 결과 글의 섹션마다 첫 "자네"를 이름으로 바꾼다(한 섹션에 한 번). 조사는 이름의 받침에 맞춘다. 종합(.sj-synth)은 글 쓸 때 이미 이름을 넣는다
  function nmSwap(root,n){if(!root||!n||typeof document==="undefined")return;var JO={"는":"는/은","가":"가/이","를":"를/을","와":"와/과"};
    [].forEach.call(root.querySelectorAll(".sj-sec,.tf-me"),function(sec){
      if(sec.classList.contains("sj-synth")||sec.classList.contains("nm-done"))return;
      var w=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,null,false),tn;
      while((tn=w.nextNode())){
        if(tn.parentElement&&tn.parentElement.closest(".gh-note,.note"))continue;
        var s=tn.nodeValue,m=/자네(는|가|를|와|에게는|에게|의|도|만|한테|께)?(?![가-힣])/.exec(s);
        if(m){tn.nodeValue=s.slice(0,m.index)+n+(m[1]?(JO[m[1]]?josa(n,JO[m[1]]):m[1]):"")+s.slice(m.index+m[0].length);sec.classList.add("nm-done");return;}}});}
  /* 사주 종합 — 원고 D(content_saju_easy.js → sj/easy.json)에서 이 사람의 일간·힘의 세기·짜임(월지 십성)·눈에 띄는 별·비어 있는 기운·지금의 큰 흐름과 올해로 쉬운 문장을 골라 잇는다.
     f = {ds,strong,yong:용신 오행 이름,wolTg,sin:[신살 이름],miss:[비어 있는 십성 무리],duTg,seTg,duOk,seOk,nm:"민지 님"|""}. 문단(HTML) 배열을 돌려준다. 순수 함수 — verify 가 무작위 명식으로 검사한다 */
  var SJ_MISS_LAB={재성:"돈",관성:"일과 책임",인성:"배움과 도움",식상:"재주와 표현",비겁:"동료와 자립"};
  function sjEasy(f,D){
    var N=f.nm?f.nm+josa(f.nm,"는/은"):"자네는",sk=f.strong?"strong":"weak",du=D.du[f.duTg],se=D.se[f.seTg],fk=f.duOk&&f.seOk?"both":f.duOk?"du":f.seOk?"se":"none",Yo=SJ_YONG[f.yong],
      sn=(f.sin||[]).filter(function(k){return D.sin[k];}).slice(0,2),ms=(f.miss||[]).filter(function(k){return D.miss[k];}).slice(0,2),p=[];
    p.push('<b>쉽게 말하면</b> — '+N+' '+D.il[f.ds]+'일세. '+D.str[sk]+' '+D.gy[f.wolTg]);
    p.push('<b>대표 강점</b> — '+D.str3[f.ds]+'일세.');
    p.push('<b>이렇게 하면 술술 풀리네</b> — '+D.good[f.wolTg]+' '+D.strat[sk]);
    p.push('<b>네 가지 한눈에</b><br><b>일</b> — '+D.work[f.wolTg]+'<br><b>돈</b> — '+D.money[f.wolTg]+'<br><b>사람</b> — '+D.people[f.ds]+'<br><b>몸과 마음</b> — '+ghFill(D.body,{E:f.yong,color:Yo.color,season:Yo.season,act:Yo.act}));
    p.push('<b>이것만 챙기면 더 좋아지네</b> — '+D.care[f.wolTg]);
    p.push('<b>오늘부터 해 볼 작은 습관</b> — '+D.habit[f.ds]);
    sn.forEach(function(k){p.push('<b>'+D.sin[k][0]+'</b> — '+D.sin[k][1]);});
    ms.forEach(function(k){p.push('<b>채우면 좋은 자리 · '+SJ_MISS_LAB[k]+'</b> — '+D.miss[k]);});
    p.push('<b>지금 시기</b> — 10년마다 바뀌는 큰 흐름(대운)은 <b>'+du[0]+'</b>의 시기, 올해는 <b>'+se[0]+'</b>일세. '+du[1]+' 올해는 '+se[1]+' '+D.seTip[f.seTg]+' '+D.fit[fk]);
    p.push('<b>정리하면</b> — '+N+' '+D.close[sk]);
    return p;}
  // 점수·등급·한 줄 결론·첫 문장으로 만드는 저장 카드. 생년월일·이름은 이미지에 넣지 않는다(카드는 SNS에 그대로 올라간다)
  function saveScore(el,file,tool,ident,score,grade,headline,body,pose,badge){
    bindSave(el,{file:file,tool:tool,ident:ident,score:score,grade:grade,headline:headline,body:String(body||"").replace(/<[^>]*>/g,"").split(".")[0]+".",pose:pose,badge:badge||""});}
  // 공유 글을 내보내는 공통 끝: 기기 공유창 → 클립보드 → 옛 복사 순. url 키를 함께 주면 대상 앱이 링크만 집어가고 text 를 버리므로 본문에 url 을 녹여 통째로 넘긴다
  function shareOut(b,title,full,idle){
    function done(){b.textContent="복사됨! 카톡에 붙여넣으세요";setTimeout(function(){b.textContent=idle;},2200);}
    function legacy(){ // clipboard API가 거부돼도 동작하는 최후 폴백
      var ta=document.createElement("textarea");ta.value=full;ta.style.position="fixed";ta.style.opacity="0";
      document.body.appendChild(ta);ta.select();
      try{document.execCommand("copy");done();}catch(e){b.textContent="복사 실패 — 길게 눌러 직접 복사하세요";}
      document.body.removeChild(ta);}
    if(navigator.share){navigator.share({title:title,text:full}).catch(function(){});}
    else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(full).then(done,legacy);}
    else legacy();}
  // 공유·초대 링크 = 쿼리·해시를 걷어낸 이 페이지 주소 + ?from=share(공유로 들어온 방문을 세는 표시) + 결과를 실은 쿼리 q.
  // 생년월일은 q 에 넣지 않는다(이름궁합처럼 이름만 받는 도구의 이름·띠 번호 정도). sel·ev 를 주면 다른 버튼(초대)에도 쓴다
  function bindShare(el,title,text,q,sel,ev){var b=el.querySelector(sel||".share-btn");if(!b)return;var idle=b.textContent;
    b.addEventListener("click",function(){
      track(ev||"share_click",{tool:location.pathname});
      var url=location.href.split("#")[0].split("?")[0]+"?from=share"+(q?"&"+q:"");
      shareOut(b,title,text+" "+url,idle);});}
  /* 내 일주 카드 — 양력 생일(또는 사주 결과의 일주)로 60갑자 가운데 내 일주를 찾아 '나는 ○○일주 — 별명' 한 칸을 그린다.
     별명·첫 문장은 일주 60편 원고(content_ilju60.js)에서 빌드가 만든 sj/ilju.json 에서 받는다. 저장 카드(이미지)와 공유(그 일주 페이지로 가는 링크)가 달린다.
     생일·이름은 카드 이미지에도 공유 링크에도 넣지 않는다. 일주 번호 k: k%10 이 일간, k%12 가 일지(일주 페이지 순서와 같다) */
  function ilKey(ds,db){for(var k=ds;k<60;k+=10)if(k%12===db)return k;return -1;}
  var IL_DATA=null;
  function iljuCardKey(host,k){
    if(!host||k<0||typeof fetch!=="function")return;
    function paint(J){var o=J[k];if(!o||host.querySelector(".ilc"))return;
      var box=document.createElement("div");box.className="ilc";
      // 일주 그림(o.i)이 있는 일주는 카드 맨 위에 그 그림을 싣고, 저장 이미지에도 일간 그림 대신 쓴다
      box.innerHTML=(o.i?'<img class="ilc-img" src="'+escH(o.i)+'" width="'+(+o.iw||0)+'" height="'+(+o.ih||0)+'" alt="'+escH(o.ko)+'일주 그림" decoding="async">':'')+
        '<div class="ilc-k">나의 일주</div><div class="ilc-n">'+escH(o.ko)+'일주 <small>'+escH(o.han)+'</small></div><div class="ilc-t">'+escH(o.t)+'</div><p class="ilc-d">'+escH(o.d)+'</p>'+
        '<div class="ilc-b"><button type="button" class="save-btn">이미지로 저장</button><button type="button" class="ilc-share">친구에게 알려주기</button></div>'+
        '<a class="ilc-a" href="ilju-'+o.en+'.html">'+escH(o.ko)+'일주 자세히 보기 →</a>';
      host.appendChild(box);
      bindSave(box,{draw:function(finish){var im=new Image();
        function go(x){var c={tool:"나의 일주",ident:"태어난 날의 두 글자가 그리는 나",big:o.ko+"일주",grade:o.han,headline:o.t,body:o.d};
          if(o.i)c.photo=x;else c.bosalImg=x;finish(fortuneCard(c));}
        im.onload=function(){go(im);};im.onerror=function(){go(null);};im.src=o.i||"img/char/ilgan-"+o.g+".webp";}});
      box.querySelector(".ilc-share").addEventListener("click",function(){var b=this;track("share_click",{tool:location.pathname});
        shareOut(b,o.ko+"일주","나는 "+o.ko+"일주("+o.han+") — "+o.t+". 내 일주는 뭘까? 동네보살에서 확인: "+location.origin+"/ilju-"+o.en+".html?from=share","친구에게 알려주기");});}
    if(IL_DATA)return paint(IL_DATA);
    fetch("sj/ilju.json").then(function(r){return r.ok?r.json():null;}).then(function(j){if(j){IL_DATA=j;paint(j);}}).catch(function(){});}
  function iljuCard(host,y,m,d){var p=sjPillars(y,m,d,null,0,false);iljuCardKey(host,ilKey(p.d.s,p.d.b));}

  // ---------- TOOLS ----------
  
var TOOLS=[];
window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(!t)return;var el=document.getElementById(elId);t.render(el);if(location.hash==="#go"&&(id==="todayfortune"||id==="saju")){try{var hh=JSON.parse(sessionStorage.getItem("dnbs_hb")||"null"),bi=el.querySelector("#d");sessionStorage.removeItem("dnbs_hb");if(hh&&hh.v&&Date.now()-hh.t<6e5&&bi){bi.value=id==="todayfortune"?hh.v.replace(/-/g,"."):hh.v;bi.dispatchEvent(new Event("change",{bubbles:true}));}}catch(e){}}if(location.hash==="#go"){var g=el.querySelector("#go"),ni=el.querySelector("#d");if(g&&!(ni&&ni.inputMode==="numeric"&&!ni.value))setTimeout(function(){g.click();},250);}var lv=function(){[].forEach.call(el.querySelectorAll("h3:not([aria-level])"),function(h){h.setAttribute("aria-level","2");});};lv();if(window.MutationObserver)new MutationObserver(lv).observe(el,{childList:true,subtree:true});var Q="input,select,textarea";[].forEach.call(el.querySelectorAll("label:not([for])"),function(l){if(l.querySelector(Q))return;var c=null;for(var n=l.nextElementSibling;n&&!c&&n.tagName!=="LABEL";n=n.nextElementSibling)c=n.matches(Q)?n:n.querySelector(Q);if(c&&c.id)l.htmlFor=c.id;});};