/* 공용 사주 계산 엔진. DOM·원고 조립 없이 브라우저 전역과 CommonJS에서 같은 구현을 쓴다. */
(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else for(var name in api)if(Object.prototype.hasOwnProperty.call(api,name))root[name]=api[name];
})(typeof window!=="undefined"?window:this,function(){
  // ---------- 만세력 엔진 (태양황경 기반: 절기·연/월/일/시주) ----------
  var SJ_S=["갑","을","병","정","무","기","경","신","임","계"],SJ_SH="甲乙丙丁戊己庚辛壬癸";
  var SJ_B=["자","축","인","묘","진","사","오","미","신","유","술","해"],SJ_BH="子丑寅卯辰巳午未申酉戌亥";
  var SJ_TTI=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  var SJ_ES=[0,0,1,1,2,2,3,3,4,4]; // 천간 오행(목화토금수=01234)
  var SJ_EB=[4,2,0,0,2,1,1,2,3,3,2,4]; // 지지 오행
  var SJ_BMAIN=[9,5,0,1,4,2,3,5,6,7,4,8]; // 지지 본기 천간 idx
  var SJ_EL=["목","화","토","금","수"];
  // 오행별 전통 상징 — [행운색, 방위, 행운숫자]
  var SJ_LUCK=[["청록·초록","동쪽","3·8"],["빨강·자주","남쪽","2·7"],["노랑·베이에요","중앙","5·10"],["흰색·은색","서쪽","4·9"],["검정·남색","북쪽","1·6"]];
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
  // 같은 해·황경의 순수 계산은 재사용한다. 두 탐색의 반복 횟수와 정밀도는 그대로 둔다.
  var SJ_TERM_CACHE={},SJ_IPCHUN_CACHE={};
  function sjIpchun(y){ // y년 입춘(황경 315°) KST JD
    if(y in SJ_IPCHUN_CACHE)return SJ_IPCHUN_CACHE[y];
    var lo=sjJdKST(y,2,2,0,0),hi=sjJdKST(y,2,7,0,0);
    for(var i=0;i<40;i++){var mid=(lo+hi)/2,L=sjSunLong(mid);
      (L>=315&&L<330)?hi=mid:lo=mid;}
    return SJ_IPCHUN_CACHE[y]=(lo+hi)/2;}
  // 24절기 일반형 — 황경 deg 에 태양이 닿는 순간(KST JD). sjIpchun(315°)의 일반화.
  // 315°(입춘)처럼 연초 근사일이 한 해를 넘기는 값은 한 해 빼준다.
  function sjTermJd(y,deg){
    var key=y+","+deg;if(key in SJ_TERM_CACHE)return SJ_TERM_CACHE[key];
    var approx=79+deg*365.2422/360; if(approx>365.2422)approx-=365.2422;
    var lo=sjJdKST(y,1,1,0,0)+approx-5, hi=lo+10;
    var norm=function(x){return ((x%360)+360)%360;};
    for(var i=0;i<60;i++){var mid=(lo+hi)/2;
      (norm(sjSunLong(mid)-deg)<180)?hi=mid:lo=mid;}
    return SJ_TERM_CACHE[key]=(lo+hi)/2;}
  // 절기 24개 — [이름, 황경]. 입춘(315°)부터 한 해가 시작한다.
  var SJ_TERM=[["입춘",315],["우수",330],["경칩",345],["춘분",0],["청명",15],["곡우",30],
    ["입하",45],["소만",60],["망종",75],["하지",90],["소서",105],["대서",120],
    ["입추",135],["처서",150],["백로",165],["추분",180],["한로",195],["상강",210],
    ["입동",225],["소설",240],["대설",255],["동지",270],["소한",285],["대한",300]];
  // 시·도 대표 도시의 시청 경도(동경, 소수 둘째 자리). 도 전체의 출생지를 대신하는 근삿값이다.
  var SJ_REGIONS=[["서울","서울",126.98],["부산","부산",129.08],["대구","대구 동인청사",128.60],["인천","인천",126.71],
    ["광주","광주",126.85],["대전","대전",127.38],["울산","울산",129.31],["세종","세종",127.29],
    ["경기","수원",127.03],["강원","춘천",127.73],["충북","청주",127.49],["충남","천안",127.11],
    ["전북","전주",127.15],["전남","목포",126.39],["경북","안동",128.73],["경남","창원",128.68],["제주","제주",126.53]];
  function sjRegion(key){
    if(key==="unknown")return {name:"해외/모름",city:"",longitude:null,min:-30};
    var r=SJ_REGIONS[0];for(var i=0;i<SJ_REGIONS.length;i++)if(SJ_REGIONS[i][0]===key){r=SJ_REGIONS[i];break;}
    return {name:r[0],city:r[1],longitude:r[2],min:Math.round((r[2]-135)*400)/100};}
  function sjPillars(y,mo,d,h,mi,tCorr){
    var jd=sjJdKST(y,mo,d,h,mi);
    var yy=(jd<sjIpchun(y))?y-1:y;
    var ys=((yy-4)%10+10)%10,yb=((yy-4)%12+12)%12;
    var L=sjSunLong(jd),mIdx=Math.floor((((L-315)%360)+360)%360/30); // 0=인월
    var ms=((ys%5)*2+2+mIdx)%10,mb=(mIdx+2)%12;
    var dayN=sjJdn(y,mo,d),di=(((dayN-2451545)+54)%60+60)%60,ds=di%10,db=di%12;
    var hp=null;
    // 숫자는 경도 보정 분(부호 포함), 기존 도구의 true/false는 종전 −30/0분을 유지한다.
    if(h!=null&&h!==""){var t=(+h)*60+(+mi||0)+(typeof tCorr==="number"?tCorr:tCorr?-30:0),t2=((t%1440)+1440)%1440;
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
  // 십이운성 — 일간이 각 지지에서 갖는 기운의 단계 (양간 순행 / 음간 역행)
  var SJ_UN=["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
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
  var SJ_YANGIN={0:3,2:6,4:6,6:9,8:0};
  function sjSamhap(b){return b%4;} // 0:신자진 1:사유축 2:인오술 3:해묘미 (지지 index%4 그룹)
  var SJ_DOHWA={2:3,0:9,1:6,3:0},SJ_YEOKMA={2:8,0:2,1:11,3:5},SJ_HWAGAE={2:10,0:4,1:1,3:7};
  var SJ_BAEKHO=["갑진","을미","병술","정축","무진","임술","계축"],SJ_GWAEGANG=["경진","경술","임진","무술"];
  function sjSeason(b){return [3,3,0,0,0,1,1,1,2,2,2,3][b];}
  function sjCelebFeat(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return {ds:p.d.s,db:p.d.b,mb:p.m.b,el:c};}
  // 분야별 대운 그래프(2026-10-09, 경쟁 서비스 벤치마킹) — 대운마다 0~100 참고 점수.
  // 기본 50 + 대운 천간이 용신 15(보조 8)·지지가 용신 10(보조 5). 분야 별: 재물=재성+20·식상+10·비겁-10 / 애정=배우자 별(남 재성·여 관성)+20·일지와 합+10·충-10 /
  // 건강=인성+10·비겁+5·일지와 충-15·편관-10 / 학업·일=인성+15·관성+15·식상+5. 지지는 본기 십성으로 절반만 센다. 종합=네 분야 평균
  function sjDuScores(du,ds,dbr,yEl,y2El,male){
    var G={비견:"비겁",겁재:"비겁",식신:"식상",상관:"식상",편재:"재성",정재:"재성",편관:"관성",정관:"관성",편인:"인성",정인:"인성"},S={all:[],money:[],love:[],health:[],work:[]};
    var cl=function(v){return Math.max(5,Math.min(95,Math.round(v)));};
    du.forEach(function(d){var gs=G[d.tg],gb=G[sjTenGod(ds,SJ_BMAIN[d.b])],es=SJ_EL[SJ_ES[d.s]],eb=SJ_EL[SJ_EB[d.b]];
      var has=function(g){return (gs===g?1:0)+(gb===g?0.5:0);},base=50+(es===yEl?15:es===y2El?8:0)+(eb===yEl?10:eb===y2El?5:0);
      var ch=Math.abs(d.b-dbr)===6,hp=sjYukhap(dbr)===d.b||(d.b%4===dbr%4&&d.b!==dbr);
      var m=cl(base+20*has("재성")+10*has("식상")-10*has("비겁")),l=cl(base+20*has(male?"재성":"관성")+(hp?10:0)-(ch?10:0)),
        h=cl(base+10*has("인성")+5*has("비겁")-(ch?15:0)-(d.tg==="편관"?10:0)),w=cl(base+15*has("인성")+15*has("관성")+5*has("식상"));
      S.money.push(m);S.love.push(l);S.health.push(h);S.work.push(w);S.all.push(Math.round((m+l+h+w)/4));});
    return S;}
  // 2026-10-09 신살 4종 추가(검색 많은 순 현침·홍염·귀문·원진). 유파마다 표가 달라 널리 쓰는 것을 따른다 — content_sinsal.js 와 같은 값(빌드가 대조)
  var SJ_HONGYEOM=[6,6,2,7,4,4,10,9,0,8];            // 일간별 홍염 지지(갑·을 오, 병 인, 정 미, 무·기 진, 경 술, 신 유, 임 자, 계 신)
  var SJ_HYEONCHIM_S=[0,7],SJ_HYEONCHIM_B=[3,6,8];   // 현침 글자: 천간 갑·신(辛), 지지 묘·오·신(申) — 사주에 2개 이상
  var SJ_GWIMUN=[[0,9],[1,6],[2,7],[3,8],[4,11],[5,10]],SJ_WONJIN=[[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];  // 일지와 다른 지지의 짝
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
     월이 바뀌는 절입 순간까지 분 단위로 센다. 3일=1년, 1일=4개월, 2시간=10일(환산 한 달=30일).
     su는 종전 반올림·1~10 제한을 유지한 대운수이며 실제 세는나이와 구분한다.
     m60 은 월주가 60갑자에서 몇 번째인지(대운 간지는 여기서 한 칸씩 앞뒤로 간다) */
  function sjDaeunStart(p,male,jd0){
    var fwd=(p.y.s%2===0)===male;
    var birth=new Date(Math.round((jd0-2440587.5)*86400000)+9*3600000),y=birth.getUTCFullYear(),termJd=null,gap=Infinity;
    for(var yy=y-1;yy<=y+1;yy++)for(var i=0;i<SJ_TERM.length;i+=2){
      var jd=sjTermJd(yy,SJ_TERM[i][1]),dt=(jd-jd0)*(fwd?1:-1);
      // 절입 순간과 정확히 같으면 양쪽 모두 0. 부동소수점 오차(1ms 미만)만 허용한다.
      if(dt>=-1e-8&&dt<gap){gap=Math.max(0,dt);termJd=jd;}}
    var minutes=Math.round(gap*1440),days=minutes/1440,years=Math.floor(minutes/4320),months=Math.floor(minutes%4320/360),spanDays=Math.floor(minutes%360/12),spanMinutes=minutes%12*120;
    var su=Math.max(1,Math.min(10,Math.round(days/3)));
    var m60=0;for(var k=0;k<60;k++)if(k%10===p.m.s&&k%12===p.m.b){m60=k;break;}
    return {fwd:fwd,days:days,su:su,m60:m60,termJd:termJd,years:years,months:months,spanDays:spanDays,spanMinutes:spanMinutes,
      start:sjDaeunDate(birth.getTime(),years*12+months,spanDays,spanMinutes)};}
  // 달력의 연·월을 먼저 더한다. 월말·윤일은 도착 월의 말일로 맞춘 뒤 일·분을 더한다(KST 달력을 UTC 슬롯에 담음).
  function sjDaeunDate(ms,months,days,minutes){var t=new Date(ms),d=t.getUTCDate();t.setUTCDate(1);t.setUTCMonth(t.getUTCMonth()+months);
    var last=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate();t.setUTCDate(Math.min(d,last));
    t.setUTCDate(t.getUTCDate()+(days||0));t.setUTCMinutes(t.getUTCMinutes()+(minutes||0));return t.getTime();}
  function sjDaeunYm(ms){var t=new Date(ms);return t.getUTCFullYear()+"년 "+(t.getUTCMonth()+1)+"월";}
  function sjDaeunIntro(da){return "첫 대운은 "+da.years+"년 "+da.months+"개월 뒤인 "+sjDaeunYm(da.start)+" 무렵부터 들어와요";}
  // 격국 — 월지 본기의 십성으로 판정
  var SJ_GYEOK={"비견":"건록격","겁재":"양인격","식신":"식신격","상관":"상관격","편재":"편재격","정재":"정재격","편관":"편관격","정관":"정관격","편인":"편인격","정인":"정인격"};
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
  // 칸이 하나 이상인 무리 가운데 드문 순서로 셋. 평범한 값(상위 60% 밖)은 빼되, 하나도 없으면 가장 드문 하나는 보여 준다
  function sjPcList(G,hasH){
    return SJ_GRP5.map(function(k,i){return {k:k,c:G[k],v:sjPct(i,G[k],hasH)};}).filter(function(x){return x.c>0;}).sort(function(a,b){return a.v-b.v||b.c-a.c;})
      .filter(function(x,i){return x.v<=60||i===0;}).slice(0,3);}
  /* 열두 달 가운데 힘이 실리는 달(점수 3 이상 가운데 높은 셋)·아낄 달(0 아래 가운데 낮은 둘) — 한 장 요약과 '달마다 흐름'이 같은 달을 말하게(2026-10-12 검수: 둘이 달랐음). 보여 줄 땐 달 순서 */
  function sjMonthPick(M){var byI=function(a,b){return a.i-b.i;};
    return {best:M.filter(function(x){return x.sc>=3&&!x.ch;}).sort(function(a,b){return b.sc-a.sc||a.i-b.i;}).slice(0,3).sort(byI),
      worst:M.filter(function(x){return x.sc<0;}).sort(function(a,b){return a.sc-b.sc||a.i-b.i;}).slice(0,2).sort(byI)};}
  // 궁합 점수 분포(35~99점 칸별 개수) — tools/sajupct/make_gh_pct.js 로 1950~2009년생 짝 20만 쌍(시각 모름)을 같은 점수 함수로 돌린 값
  var GH_PCT=[0,0,0,0,0,0,0,0,227,0,0,142,0,200,0,244,767,0,137,1155,2993,638,0,1865,1137,2806,355,2208,7071,1180,1881,9940,11236,5851,767,5895,9585,10310,3961,3874,8049,11389,7415,6244,4925,6630,7618,2893,5936,9139,2851,4699,2301,5319,6481,1486,1381,2029,2099,4092,965,1938,1146,1106,5444];
  function ghPct(sc){var t=0,c=0;for(var i=0;i<GH_PCT.length;i++){t+=GH_PCT[i];if(i+35>=sc)c+=GH_PCT[i];}return Math.max(1,Math.round(c/t*100));}
  var TF_BASE={"비견":78,"겁재":62,"식신":85,"상관":68,"편재":80,"정재":83,"편관":58,"정관":82,"편인":65,"정인":84};
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
     국가기록원은 "1949~1961년, 대개 5~9월"로만 적어 기록마다 조금 다르다.
     https://data.iana.org/time-zones/tzdb/asia — [시작 현지 시각, 종료 직전 현지 시각]. 24:00은 다음 날 00:00으로 적는다. */
  var KR_DST=[["1948-06-01T00:00","1948-09-13T00:00"],["1949-04-03T00:00","1949-09-11T00:00"],["1950-04-01T00:00","1950-09-10T00:00"],["1951-05-06T00:00","1951-09-09T00:00"],
    ["1955-05-05T00:00","1955-09-09T00:00"],["1956-05-20T00:00","1956-09-30T00:00"],["1957-05-05T00:00","1957-09-22T00:00"],["1958-05-04T00:00","1958-09-21T00:00"],
    ["1959-05-03T00:00","1959-09-20T00:00"],["1960-05-01T00:00","1960-09-18T00:00"],["1987-05-10T02:00","1987-10-11T03:00"],["1988-05-08T02:00","1988-10-09T03:00"]];
  function krClockShift(y,m,d,h,mi){
    var k=Date.UTC(y,m-1,d,h==null?12:h,mi||0),dst=false;
    // 1954년 자정에 23:30으로 되돌린 30분은 변경 후 UTC+8:30으로 해석한다. 1961년 전환도 현지 자정이다.
    var std830=k>=Date.UTC(1954,2,20,23,30)&&k<Date.UTC(1961,7,10);
    KR_DST.forEach(function(r){
      // 종료 때 반복되는 한 시간은 표준시로 해석하므로 종료 직전 시각에서 60분을 뺀다.
      if(k>=Date.parse(r[0]+"Z")&&k<Date.parse(r[1]+"Z")-3600000)dst=true;});
    return {min:(std830?-30:0)+(dst?60:0),dst:dst,std830:std830};}
  function sjKst(jd){var t=new Date(Math.round((jd-2440587.5)*86400000)+9*3600000);
    return t.getUTCFullYear()+"년 "+(t.getUTCMonth()+1)+"월 "+t.getUTCDate()+"일 "+("0"+t.getUTCHours()).slice(-2)+":"+("0"+t.getUTCMinutes()).slice(-2);}
  // 태어난 순간의 앞뒤 월 절기(황경 315+30k°) — 월주가 어느 절기부터 시작됐는지 보여 준다
  function sjMonthTerms(jd){
    var L=sjSunLong(jd),k=Math.floor((((L-315)%360)+360)%360/30),deg=(315+30*k)%360,y=new Date(Math.round((jd-2440587.5)*86400000)).getUTCFullYear();
    var prev=[y-1,y,y+1].map(function(Y){return sjTermJd(Y,deg);}).filter(function(j){return j<=jd;}).pop();
    var nd=(deg+30)%360,next=[y-1,y,y+1].map(function(Y){return sjTermJd(Y,nd);}).filter(function(j){return j>jd;})[0];
    var nm=function(g){for(var i=0;i<SJ_TERM.length;i++)if(SJ_TERM[i][1]===g)return SJ_TERM[i][0];};
    return {L:L,prev:prev,prevName:nm(deg),next:next,nextName:nm(nd)};}
  var ZF_BASE={"삼합":88,"육합":84,"복음":74,"평":72,"해":60,"형":56,"충":52};
  var ZF_TG={"식신":4,"정재":4,"정관":3,"정인":4,"편재":2,"비견":0,"상관":-3,"편인":-2,"겁재":-5,"편관":-5};
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
  // 12띠를 오늘 점수순으로 — 같은 점수면 자·축·인… 순서
  function zfRank(now){now=now||new Date();var t=sjPillars(now.getFullYear(),now.getMonth()+1,now.getDate(),null,0,false);
    return SJ_TTI.map(function(n,b){var z=zfScore(b,t);z.b=b;return z;}).sort(function(x,y){return y.score-x.score||x.b-y.b;});}
    /* 신년운세 점수 — 그 해 하늘 글자와 나(일간)의 관계 + 내 띠·일지가 그 해 땅 글자와 삼합·육합(+5)·충(-6). go 와 상위 %가 같이 쓴다 */
    function nyScore(ds,yb,db,YS,YB){
      var sc={비견:74,겁재:62,식신:88,상관:70,편재:80,정재:85,편관:60,정관:86,편인:68,정인:84}[sjTenGod(ds,YS)];
      [yb,db].forEach(function(b){if(b%4===YB%4&&b!==YB||sjYukhap(b)===YB)sc+=5;else if(Math.abs(b-YB)===6)sc-=6;});
      return Math.max(40,Math.min(97,sc));}
    // 상위 N%: 60갑자 일주 × 12띠(720가지, 같은 무게) 가운데 이 해 점수가 내 점수 이상인 비율
    function nyPct(score,YS,YB){var t=0,c=0;for(var d=0;d<60;d++)for(var y=0;y<12;y++){t++;if(nyScore(d%10,y,d%12,YS,YB)>=score)c++;}return Math.max(1,Math.round(c/t*100));}
    function tjCalc(ly, lm, ld, Y, K, gz) {
      var SS = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5], SB = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];          // 선천수
      var JS = [11, 10, 9, 8, 7, 11, 10, 9, 8, 7], JB = [9, 11, 8, 8, 11, 7, 7, 11, 10, 10, 11, 9]; // 중천수
      var ys = ((Y - 4) % 10 + 10) % 10, yb = ((Y - 4) % 12 + 12) % 12;
      var age = Y - ly + 1, taese = JS[ys] + JB[yb];
      var cal = new K(), days = cal.getLunarMonthDays(Y, lm, false);
      var ms = ((ys % 5) * 2 + 2 + lm - 1) % 10, mb = (lm + 1) % 12, wolgeon = SS[ms] + SB[mb];
      var d = Math.min(ld, days); cal.setLunarDate(Y, lm, d, false);
      var s = cal.getSolarCalendar(), g = gz(s.year, s.month, s.day), iljin = SS[g[0]] + JB[g[1]];
      var up = (age + taese) % 8 || 8, mid = (days + wolgeon) % 6 || 6, low = (d + iljin) % 3 || 3;
      return { code: "" + up + mid + low, age: age, ys: ys, yb: yb, taese: taese, days: days, ms: ms, mb: mb, wolgeon: wolgeon,
        ds: g[0], db: g[1], iljin: iljin, clamp: d !== ld, solar: s };
    }
  return {
    SJ_S:SJ_S,
    SJ_SH:SJ_SH,
    SJ_B:SJ_B,
    SJ_BH:SJ_BH,
    SJ_TTI:SJ_TTI,
    SJ_ES:SJ_ES,
    SJ_EB:SJ_EB,
    SJ_BMAIN:SJ_BMAIN,
    SJ_EL:SJ_EL,
    SJ_LUCK:SJ_LUCK,
    SJ_HOUR:SJ_HOUR,
    sjYukhap:sjYukhap,
    sjJdn:sjJdn,
    sjSunLong:sjSunLong,
    SJ_VSOP:SJ_VSOP,
    sjJdKST:sjJdKST,
    SJ_TERM_CACHE:SJ_TERM_CACHE,
    SJ_IPCHUN_CACHE:SJ_IPCHUN_CACHE,
    sjIpchun:sjIpchun,
    sjTermJd:sjTermJd,
    SJ_TERM:SJ_TERM,
    SJ_REGIONS:SJ_REGIONS,
    sjRegion:sjRegion,
    sjPillars:sjPillars,
    sjStrength:sjStrength,
    SJ_UN:SJ_UN,
    SJ_JS:SJ_JS,
    sjUnseong:sjUnseong,
    SJ_CHEONEUL:SJ_CHEONEUL,
    SJ_MUNCHANG:SJ_MUNCHANG,
    SJ_SUN:SJ_SUN,
    sjGongmang:sjGongmang,
    subBal:subBal,
    GH_GRP:GH_GRP,
    ghTg:ghTg,
    ghEl:ghEl,
    GH_YB:GH_YB,
    ghYear:ghYear,
    SJ_YANGIN:SJ_YANGIN,
    sjSamhap:sjSamhap,
    SJ_DOHWA:SJ_DOHWA,
    SJ_YEOKMA:SJ_YEOKMA,
    SJ_HWAGAE:SJ_HWAGAE,
    SJ_BAEKHO:SJ_BAEKHO,
    SJ_GWAEGANG:SJ_GWAEGANG,
    sjSeason:sjSeason,
    sjCelebFeat:sjCelebFeat,
    sjDuScores:sjDuScores,
    SJ_HONGYEOM:SJ_HONGYEOM,
    SJ_HYEONCHIM_S:SJ_HYEONCHIM_S,
    SJ_HYEONCHIM_B:SJ_HYEONCHIM_B,
    SJ_GWIMUN:SJ_GWIMUN,
    SJ_WONJIN:SJ_WONJIN,
    sjSinsal:sjSinsal,
    SJ_JJG:SJ_JJG,
    sjDaeunStart:sjDaeunStart,
    sjDaeunDate:sjDaeunDate,
    sjDaeunYm:sjDaeunYm,
    sjDaeunIntro:sjDaeunIntro,
    SJ_GYEOK:SJ_GYEOK,
    sjTenGod:sjTenGod,
    SJ_PCT:SJ_PCT,
    SJ_GRP5:SJ_GRP5,
    sjPct:sjPct,
    sjPcList:sjPcList,
    sjMonthPick:sjMonthPick,
    GH_PCT:GH_PCT,
    ghPct:ghPct,
    TF_BASE:TF_BASE,
    tfGrade:tfGrade,
    tfScore:tfScore,
    tfToday:tfToday,
    TF_PCT:TF_PCT,
    tfPct:tfPct,
    KR_DST:KR_DST,
    krClockShift:krClockShift,
    sjKst:sjKst,
    sjMonthTerms:sjMonthTerms,
    ZF_BASE:ZF_BASE,
    ZF_TG:ZF_TG,
    zfRel:zfRel,
    zfScore:zfScore,
    zfRank:zfRank,
    nyScore:nyScore,
    nyPct:nyPct,
    tjCalc:tjCalc
  };
});
