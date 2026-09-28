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
  var ST_TRAIT=["망설임 없이 먼저 뛰어드는 개척자. 속도가 곧 무기입니다.","한번 정하면 끝까지 지키는 뚝심. 감각과 실속을 함께 챙깁니다.","호기심과 언어 감각이 살아 있는 전달자. 사람과 정보가 늘 모입니다.","마음의 온도를 먼저 읽는 보호자. 내 사람에게는 한없이 깊습니다.","존재만으로 무대를 만드는 사람. 인정받을 때 가장 빛납니다.","작은 어긋남을 먼저 보는 정밀한 눈. 완성도가 곧 자존심입니다.","균형과 관계의 조율자. 아름다움과 공정함을 동시에 봅니다.","한 번 파고들면 끝을 보는 집중력. 겉과 속의 깊이가 다릅니다.","시야가 넓고 낙천적인 탐험가. 갇히는 순간 답답해집니다.","시간을 자기 편으로 만드는 전략가. 늦어도 결국 올라섭니다.","남과 다른 각도로 보는 혁신가. 규칙보다 이유를 묻습니다.","경계 없이 스며드는 공감력. 예술과 직관이 강점입니다."];
  var ST_ELE_RULERS={"불":["태양","화성","목성"],"흙":["금성","수성","토성"],"공기":["수성","금성","토성"],"물":["달","화성","목성"]};
  var WD_KO=["일","월","화","수","목","금","토"];
  var WD_RULER=["태양","달","화성","수성","목성","금성","토성"]; // 요일 지배성(칠요)
  function stOf(y,m,d){return Math.floor(sjSunLong(sjJdKST(y,m,d,12,0))/30);} // 태양황경으로 별자리 판정
  function stCard(i,label){return '<div class="sj-char"><img width="520" height="520" src="img/char/st-'+ST_EN[i]+'.webp" alt="'+ST_KO[i]+'" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
    '<div class="cap"><div class="t">'+(label||"나의 별자리")+'</div><div class="n">'+ST_SYM[i]+' '+ST_KO[i]+'</div><p>'+ST_TRAIT[i]+'</p></div></div>';}
  // 태양의 각도 관계(어스펙트) — 거리 0~6, [기본점수, 이름, 총운, 애정, 재물·일, 조언, [애정·재물·일·건강 보정]]
  var ST_ASP=[
   [88,"합(0°)","태양이 내 별자리 위를 지나는 시기입니다. 존재감이 커지고, 내가 먼저 움직일수록 일이 풀립니다.","먼저 다가가는 쪽이 유리합니다. 표현을 아끼면 기회가 지나갑니다.","새로 시작하는 일에 힘이 실립니다. 다만 혼자 다 하려다 지칠 수 있습니다.","올해의 방향을 다시 세우기 좋은 때입니다. 하고 싶은 것을 문장으로 적어두세요.",[6,2,4,-2]],
   [72,"세미섹스타일(30°)","크게 흔들리지 않는 잔잔한 흐름입니다. 무리하지 않으면 손해도 없습니다.","익숙한 사이에서 편안함을 느낍니다. 새 인연은 서두르지 마세요.","작은 정리와 마무리에 좋은 날입니다.","오늘은 확장보다 정돈입니다. 미뤄둔 일 하나만 끝내세요.",[0,2,4,2]],
   [84,"섹스타일(60°)","기회가 손 닿는 곳에 놓입니다. 다만 스스로 손을 뻗어야 잡히는 종류입니다.","소개·모임·연락에서 좋은 흐름이 옵니다.","제안·협업·부수입에 유리합니다. 연락을 미루지 마세요.","오늘 온 연락은 흘려보내지 마세요. 답장 하나가 흐름을 바꿉니다.",[8,6,6,0]],
   [58,"스퀘어(90°)","마찰이 있는 대신 성장이 있는 날입니다. 부딪히는 지점이 곧 내 약한 고리입니다.","말투 하나로 오해가 생기기 쉽습니다. 한 박자 늦게 답하세요.","일정이 밀리거나 예산이 어긋날 수 있습니다. 여유분을 두세요.","오늘의 짜증은 방향이 아니라 속도의 문제입니다. 잠시 멈추면 보입니다.",[-8,-6,-4,-6]],
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
   "장생":"갓 태어난 기운일세. 순수하고 자랄 여지가 크며, 사람들 도움을 자연스럽게 받는 자리야.",
   "목욕":"멋을 부리고 감정이 풍부한 자리일세. 매력은 있으나 마음이 잘 흔들리기도 하네.",
   "관대":"세상에 갓 나선 청년의 기운이야. 자신감과 의욕이 넘치되 다소 성급하네.",
   "건록":"스스로 벌어 스스로 서는, 열둘 중 가장 단단한 축에 드는 자리일세. 실속 있고 책임감이 서네.",
   "제왕":"기운이 가장 왕성한 정점이야. 주도력이 뛰어난 만큼 고집으로 흐르지 않게 조절해야 하네.",
   "쇠":"정점을 지나 안정으로 접어든 자리일세. 무리하지 않고 안을 다지는 데 강해.",
   "병":"기운이 여려지며 예민해지는 자리야. 대신 감수성과 배려가 깊어 사람을 잘 살피네.",
   "사":"활동보다 생각이 깊어지는 자리일세. 연구·기획처럼 안으로 파고드는 일에 어울려.",
   "묘":"거두어 갈무리하는 자리야. 모으고 지키는 힘이 있어 관리와 축적에 강하네.",
   "절":"끊어졌다 다시 이어지는 자리일세. 변화가 잦지만 새 출발의 기운도 같이 들어 있어.",
   "태":"새 생명이 잉태되는 자리야. 아이디어와 가능성이 씨앗처럼 자리를 잡네.",
   "양":"태어나기 전 길러지는 자리일세. 보호받으며 준비하는 시기라 기질이 온화해지네."};
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
   "장생":"몸이 가볍게 열리는 날이라 새로 시작하는 일에 힘이 붙네.",
   "목욕":"감정이 풍부해져 매력은 사는데, 기분 따라 정하면 흔들리기 쉬운 날일세.",
   "관대":"의욕이 차오르는 날이야. 자신감은 좋으나 서두르면 마무리가 거칠어지네.",
   "건록":"발밑이 단단한 날일세. 손에 쥔 것부터 끝내면 하루가 알차게 쌓여.",
   "제왕":"기운이 정점이라 밀어붙이는 힘은 좋은데 과속만 조심하게.",
   "쇠":"속도를 줄이고 안을 다지기 좋은 날이야. 벌이기보다 정리가 어울리네.",
   "병":"감수성이 깊어지는 날일세. 몸의 신호에 예민해지니 컨디션부터 챙기게.",
   "사":"생각이 안으로 파고드는 날이라 혼자 붙잡는 일에서 성과가 나네.",
   "묘":"거두고 갈무리하는 날일세. 새 판 벌이기보다 모아둔 걸 지키게.",
   "절":"흐름이 한 번 끊겼다 다시 이어지는 날이야. 변화가 와도 새 출발 신호로 읽게.",
   "태":"생각이 씨앗처럼 맺히는 날일세. 바로 실행보다 적어두기 좋아.",
   "양":"보호받으며 준비하는 날이야. 서두르지 말고 힘을 기르는 데 쓰게."};
  var SJ_JS=[11,6,2,9,2,9,5,0,8,3]; // 천간별 장생 지지
  function sjUnseong(s,b){var js=SJ_JS[s];return SJ_UN[(s%2===0)?((b-js+12)%12):((js-b+12)%12)];}
  // 신살 — 룩업 테이블 (일간·삼합 기준)
  var SJ_CHEONEUL={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],8:[5,3],9:[5,3],7:[6,2]};
  var SJ_MUNCHANG=[5,6,8,9,8,9,11,0,2,3];
  var SJ_YANGIN={0:3,2:6,4:6,6:9,8:0};
  function sjSamhap(b){return b%4;} // 0:신자진 1:사유축 2:인오술 3:해묘미 (지지 index%4 그룹)
  var SJ_DOHWA={2:3,0:9,1:6,3:0},SJ_YEOKMA={2:8,0:2,1:11,3:5},SJ_HWAGAE={2:10,0:4,1:1,3:7};
  var SJ_BAEKHO=["갑진","을미","병술","정축","무진","임술","계축"],SJ_GWAEGANG=["경진","경술","임진","무술"];
  var SJ_SINSAL_DESC={
   "천을귀인":"사주에서 가장 좋은 길신일세. 어려울 때 사람이 나타나 큰 고비를 넘기게 해주는 힘이 있어.",
   "문창귀인":"학문과 글재주의 별이야. 공부든 시험이든 글이든 기획이든, 머리 쓰는 자리에서 두각이 나네.",
   "도화살":"매력과 인기의 별일세. 사람을 끄는 힘이 강해 예술·연예·서비스·영업 쪽에서 강점이 되네.",
   "역마살":"이동과 변화의 별이야. 해외든 출장이든 이사든 유통이든, 움직이는 일에서 기회가 열리네.",
   "화개살":"고독과 예술의 별일세. 혼자 깊이 파고드는 힘이 있어 연구·종교·예술·전문직에 어울려.",
   "양인살":"강한 칼의 기운이야. 결단력과 추진력이 뛰어나되 과하면 다툼이 되니 벼려서 써야 하네.",
   "백호대살":"강렬한 기운의 별일세. 승부처에서 힘을 내지만 건강과 안전만은 각별히 챙겨야 하네.",
   "괴강살":"우두머리의 기운이야. 카리스마와 리더십이 강하며, 그만큼 극단으로 흐르기도 쉽네."};
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
    return found;
  }
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
  var TF_LINE={"비견":"내 걸음으로 가는 날. 밀고 가되 돈은 각자.","겁재":"새는 날. 지갑도 마음도 잠가둘 것.","식신":"표현이 풀리는 날. 담아둔 말은 꺼낼 것.","상관":"번뜩이는 날. 단, 입은 한 박자 늦게.","편재":"큰돈이 움직이는 날. 계산기부터 두드릴 것.","정재":"성실이 돈 되는 날. 한탕 말고 확실한 것.","편관":"압박의 날. 정면으로 가되 몸은 아낄 것.","정관":"인정받는 날. 오늘은 원칙이 지름길.","편인":"생각이 깊어지는 날. 확답은 내일로.","정인":"귀인의 날. 혼자 앓지 말 것."};
  function tfGrade(s){return s>=85?"대길":s>=75?"길":s>=60?"평온":"주의";}
  function tfToday(y,m,d,now){
    now=now||new Date();
    var me=sjPillars(y,m,d,null,0,false),today=sjPillars(now.getFullYear(),now.getMonth()+1,now.getDate(),null,0,false);
    var rel=sjTenGod(me.d.s,today.d.s),score=TF_BASE[rel],myB=me.d.b,tB=today.d.b,art="";
    if(myB%4===tB%4&&myB!==tB){score+=8;art="삼합";}
    else if(Math.abs(myB-tB)===6){score-=10;art="충";}
    else if(sjYukhap(myB)===tB){score+=6;art="육합";}
    var st=sjStrength(me),todayEl=SJ_ES[today.d.s],yongHit=todayEl===st.yong,yongClash=(todayEl+2)%5===st.yong;
    if(yongHit)score+=5;else if(yongClash)score-=3;
    score=Math.max(35,Math.min(98,score));
    return {me:me,today:today,rel:rel,score:score,grade:tfGrade(score),art:art,st:st,todayEl:todayEl,yongHit:yongHit,yongClash:yongClash};}
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
      '<br><br><span style="color:var(--muted);font-size:12.5px">절기 시각은 태양 황경을 VSOP87 행성 이론으로 직접 계산한 값이며, 영국·미국 천문력 자료로 만든 공식 절기표와 1분 안에서 맞습니다. 절기 바로 1~2분 안에 태어났다면 만세력마다 월주가 갈릴 수 있습니다.</span></p></div>';}
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
  /* 별자리 오늘 점수 — 오늘 태양 별자리와 내 별자리의 각도(ST_ASP) + 요일 지배성이 내 수호성(+7)·같은 원소 지배성(+3)·그 밖(−3).
     별자리 운세와 홈 "오늘의 별자리 순위"가 같이 쓴다. rk: 2 수호성의 요일, 1 결이 맞는 요일, 0 결이 다른 요일 */
  var HS_LINE=["태양이 내 위를 지나는 날","잔잔하게 흐르는 날","손 뻗으면 기회가 닿는 날","마찰 끝에 자라는 날","순풍이 부는 날","조정과 타협의 날","관계가 주제인 날"];
  function hsScore(mine,now){now=now||new Date();
    var sun=stOf(now.getFullYear(),now.getMonth()+1,now.getDate()),k=(sun-mine+12)%12,dist=Math.min(k,12-k),A=ST_ASP[dist];
    var wdr=WD_RULER[now.getDay()],rk=wdr===ST_RULER[mine]?2:ST_ELE_RULERS[ST_ELE[mine%4]].indexOf(wdr)>=0?1:0;
    return {sun:sun,dist:dist,A:A,wdr:wdr,rk:rk,score:Math.max(35,Math.min(98,A[0]+(rk===2?7:rk===1?3:-3)))};}
  function hsRank(now){return ST_KO.map(function(n,i){var h=hsScore(i,now);h.i=i;return h;}).sort(function(x,y){return y.score-x.score||x.i-y.i;});}
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
  function track(ev,p){try{if(typeof gtag==="function")gtag("event",ev,p||{});}catch(e){}try{navigator.sendBeacon("/api/hit",JSON.stringify({e:ev}));}catch(e){}}
  // P2-4 최소 에러 모니터링 — 외부 서비스 없이 GA4 이벤트로만 수집
  if(typeof window!=="undefined"){
    window.addEventListener("error",function(e){
      track("js_error",{m:String(e.message||"").slice(0,100),f:String(e.filename||"").split("/").pop()});});
    window.addEventListener("unhandledrejection",function(e){
      track("js_error",{m:("promise: "+(e.reason&&e.reason.message||e.reason||"")).slice(0,100)});});}
  if(typeof window!=="undefined")window.addEventListener("error",function(e){track("js_error",{m:String(e.message||"").slice(0,100)});});
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
  function diaryNote(){return '<p class="diary-note">'+bosalImg("diary","dn-bosal","")+'이 결과는 <a href="diary.html">운세 일기</a>에 적어 뒀네. 며칠 뒤 맞았는지 눌러 보게.</p>';}
  /* 아기보살 — 동네보살의 얼굴. 자세별 그림(img/bosal/<자세>.webp)을 자리마다 골라 쓴다.
     점수로 고를 때: 85 이상 만세(cheer), 60 이상 미소(smile), 그 아래 걱정하며 토닥(worry) */
  function bosalImg(pose,cls,alt){return '<img class="bosal'+(cls?" "+cls:"")+'" src="img/bosal/'+pose+'.webp" alt="'+(alt||"아기보살")+'" loading="lazy" decoding="async" onerror="this.remove()">';}
  function bosalPose(score){return score>=85?"cheer":score>=60?"smile":"worry";}
  function bosalSay(pose,html){return '<div class="bosal-say">'+bosalImg(pose,"bs-av")+'<div class="bs-b">'+html+'</div></div>';}
  var BOSAL_LINE=[[85,"좋은 날일세! 오늘은 자네가 먼저 움직여도 되네."],[75,"괜찮은 흐름이야. 하던 일에 힘을 실어 보게."],[60,"무난한 날일세. 서두르지만 않으면 되네."],[0,"조심할 자리가 보이네. 아래 '피할 것'부터 먼저 보고 가게."]];
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
    if(o.bujeok){
      // 공유 버튼 '앞'에 넣는다. parentNode 기준으로 넣으면 #out 밖으로 빠져나간다
      var sb=out.querySelector(".share-btn");
      if(sb)sb.insertAdjacentHTML("beforebegin",bujeokHtml(o.score,o.grade));
      else out.insertAdjacentHTML("beforeend",bujeokHtml(o.score,o.grade));}
    // 긴 풀이는 분류 + 핵심 한 문장으로 접는다. 첫 칸 하나만 펼쳐 둔다
    plainWords(out);foldAll(out,{open:1});
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
    ["십이운성","기운의 단계"],["신강","힘이 센 편"],["신약","힘이 약한 편"],
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
  function plainWords(root){
    if(!root||typeof document==="undefined")return;
    var seen={},w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),tn,nodes=[];
    while((tn=w.nextNode()))nodes.push(tn);
    nodes.forEach(function(t){
      var s=t.nodeValue;
      if(!s||!/[가-힣]/.test(s))return;
      if(t.parentElement&&t.parentElement.closest(PLAIN_SKIP))return;
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
          // 조사는 소리 나는 마지막 낱말 기준 — 괄호를 붙인 첫 등장은 괄호 안 용어로 고른다
          var base=first?term:plain;
          return pre+word+(jo?(PLAIN_JOSA[jo]?josa(base,PLAIN_JOSA[jo]):jo):"")+(jo2||"");});
      });
      if(s!==t.nodeValue)t.nodeValue=s;
    });
  }
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
      var d=document.createElement(has?"details":"div");
      d.className="fold"+(has?"":" fold-flat");
      if(has&&n++<(opts.open||0))d.open=true;
      var s=document.createElement(has?"summary":"div");
      s.className=has?"":"fold-sum";
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
    // 다이얼을 input 자리에 놓고, input은 아래로 옮겨 '직접 입력'으로 남긴다
    inp.classList.add("dial-typed");
    host.insertBefore(wrap,inp);
    host.insertBefore(gan,inp);
    var typedLabel=document.createElement("div");
    typedLabel.className="dial-typed-label";
    typedLabel.textContent="직접 입력";
    host.insertBefore(typedLabel,inp);
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
    host.insertBefore(era,wrap);
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
      var v=(inp.value||"").split("-");
      if(v.length<3)return;
      var y=+v[0],m=+v[1],d=+v[2];
      if(!y||!m||!d||y<1930||y>nowY)return;
      Y=y;M=m;D=d;rebuildDays();
      // 즉시 이동 — 부드럽게 굴리면 지나가는 중간 연도가 scroll 판정으로 확정돼 입력을 덮어쓴다(1987 입력 → 1988로 계산)
      scrollTo(cols.y,Y,false);scrollTo(cols.m,M,false);scrollTo(cols.d,D,false);
      mark(cols.y);mark(cols.m);mark(cols.d);commit();}
    inp.addEventListener("change",syncFromInput);
    inp.addEventListener("input",syncFromInput);
    // rAF는 백그라운드 탭에서 실행되지 않아 휠이 0(1930년)에 머문 채 값과 어긋난다.
    // 타이머로도 한 번 더 맞춰 초기 위치를 보장한다.
    function settle(){scrollTo(cols.y,Y,false);scrollTo(cols.m,M,false);scrollTo(cols.d,D,false);commit();}
    requestAnimationFrame(settle);setTimeout(settle,0);
    setTimeout(settle,180);
    lunarPick(host,inp,era,nowY);
    peopleChips(host,inp,host.querySelector(".lunar-pick")||era);
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
      if(t.closest(".ppl-add")){t.outerHTML='<input class="ppl-n" maxlength="8" placeholder="이름 (예: 엄마)" aria-label="저장할 이름"><span class="ppl-ok" role="button" tabindex="0">저장</span>';box.querySelector(".ppl-n").focus();return;}
      if(t.closest(".ppl-ok")){var n=(box.querySelector(".ppl-n").value||"").trim().slice(0,8);if(!n||!inp.value){draw();return;}
        a=a.filter(function(x){return x.n!==n;});a.unshift({n:n,b:inp.value});put(a);}}
    box.addEventListener("click",act);
    box.addEventListener("keydown",function(e){if(e.key==="Enter"){if(e.target.classList.contains("ppl-n")){e.preventDefault();box.querySelector(".ppl-ok").click();}else if(e.target.getAttribute("role")==="button"){e.preventDefault();e.target.click();}}});
    inp.addEventListener("change",function(){if(!box.querySelector(".ppl-n"))draw();});
    draw();}
  /* 음력 생일 — 40대 이상은 음력 생일을 기억한다. 음력 연·월·일(윤달)을 고르면 양력으로 바꿔
     위 입력칸에 넣고, 다이얼은 input 이벤트로 따라온다. 계산은 늘 양력 한 가지로 한다.
     변환(KASI 기준 vendor-lunar.js)은 펼칠 때만 받는다. */
  function lunarPick(host,inp,before,nowY){
    var lp=document.createElement("details");lp.className="lunar-pick";
    var mo="",dd="";for(var i=1;i<=12;i++)mo+='<option value="'+i+'">'+i+'월</option>';for(i=1;i<=30;i++)dd+='<option value="'+i+'">'+i+'일</option>';
    lp.innerHTML='<summary>음력 생일이세요?</summary><div class="lp-row">'+
      '<input type="number" class="lp-y" min="1930" max="'+nowY+'" value="'+((inp.value||"1990").split("-")[0])+'" aria-label="음력 연도">'+
      '<select class="lp-m" aria-label="음력 월">'+mo+'</select><select class="lp-d" aria-label="음력 일">'+dd+'</select>'+
      '<label class="lp-leap"><input type="checkbox" class="lp-l"> 윤달</label>'+
      '<span class="lp-go" role="button" tabindex="0">양력으로 넣기</span></div><p class="lp-note"></p>';
    host.insertBefore(lp,before);
    function load(){if(window.KoreanLunarCalendar||document.getElementById("vendor-lunar"))return;
      var s=document.createElement("script");s.id="vendor-lunar";s.src="vendor-lunar.js";document.head.appendChild(s);}
    lp.addEventListener("toggle",function(){if(lp.open)load();});
    var note=lp.querySelector(".lp-note"),go=lp.querySelector(".lp-go");
    function apply(){
      var K=window.KoreanLunarCalendar;if(!K){load();note.textContent="변환 준비 중이네. 한 번만 더 눌러 주게.";return;}
      var y=+lp.querySelector(".lp-y").value,m=+lp.querySelector(".lp-m").value,d=+lp.querySelector(".lp-d").value,leap=lp.querySelector(".lp-l").checked;
      var cal=new K();
      if(!y||!cal.setLunarDate(y,m,d,leap)){note.textContent="그 해에는 음력 "+m+"월"+(leap?"(윤달)":"")+" "+d+"일이 없네. 윤달이 아닌지 다시 보게.";return;}
      var s=cal.getSolarCalendar(),v=s.year+"-"+String(s.month).padStart(2,"0")+"-"+String(s.day).padStart(2,"0");
      inp.value=v;inp.dispatchEvent(new Event("input",{bubbles:true}));inp.dispatchEvent(new Event("change",{bubbles:true}));
      note.textContent="음력 "+y+"년 "+m+"월"+(leap?"(윤달)":"")+" "+d+"일은 양력 "+s.year+"년 "+s.month+"월 "+s.day+"일일세. 이 날짜로 보네.";}
    go.addEventListener("click",apply);
    go.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();apply();}});}

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
      x.strokeStyle="rgba(212,175,110,.25)";x.lineWidth=1;
      x.beginPath();x.moveTo(140,top+side+104);x.lineTo(W-140,top+side+104);x.stroke();
      // 핵심 문장 — 결과 맨 위 한 줄. 원문의 줄 나눔(<br>)을 그대로 살린다
      x.fillStyle="#fff";x.font="800 46px "+F;
      var hs=String(o.headline||"").split("\n"),hl=[];
      for(var h=0;h<hs.length;h++)hl=hl.concat(wrapText(x,hs[h],W-200));
      hl=hl.slice(0,3);
      var hy=top+side+176;
      for(var j=0;j<hl.length;j++)x.fillText(hl[j],W/2,hy+j*60);
      // 본문 200자 내외 — 줄 수를 넘기면 마지막 줄을 말줄임한다
      if(o.body){
        x.fillStyle="#c3ccd9";x.font="400 30px "+F;
        var bl=wrapText(x,o.body,W-220),by=hy+hl.length*60+34,cap=9;
        if(bl.length>cap){bl=bl.slice(0,cap);bl[cap-1]=bl[cap-1].replace(/.$/,"…");}
        for(var k=0;k<bl.length;k++)x.fillText(bl[k],W/2,by+k*45);}
    }else{
      if(o.score!=null){
        x.fillStyle="#fff";x.font="900 210px "+F;x.fillText(String(o.score),W/2,470+oy);
        x.fillStyle="#d4af6e";x.font="700 60px "+F;x.fillText(o.grade||"",W/2,556+oy);}
      x.fillStyle="#fff";x.font="800 54px "+F;
      var hl2=wrapText(x,o.headline||"",W-200),hy2=(o.score!=null?700:520)+oy;
      for(var j2=0;j2<hl2.length&&j2<3;j2++){x.fillText(hl2[j2],W/2,hy2+j2*74);}
      if(o.body){
        x.fillStyle="#c3ccd9";x.font="400 38px "+F;
        var bl2=wrapText(x,o.body,W-220),by2=hy2+hl2.length*74+56,cap2=o.bosalImg?4:6;
        for(var k2=0;k2<bl2.length&&k2<cap2;k2++){x.fillText(bl2[k2],W/2,by2+k2*60);}}
      // 아기보살 — 점수에 맞는 자세. 본문을 네 줄로 줄여 겹치지 않게 한다
      if(o.bosalImg){var bh=300,bw=Math.round(o.bosalImg.width*bh/o.bosalImg.height);x.drawImage(o.bosalImg,(W-bw)/2,H-218-bh,bw,bh);}}
    // 저장 이미지는 출처를 달고 돌아다닌다. 도메인이 안 보이면 퍼져도 유입이 없다
    // 주소 기준선이 테두리(H-48)와 4px 떨어져 'g' 꼬리가 선을 넘었다. 블록째 올려 테두리와 띄운다
    x.fillStyle="#d4af6e";x.font="700 46px "+F;x.fillText("동네보살",W/2,H-158);
    x.fillStyle="#8b95a6";x.font="400 30px "+F;x.fillText("무료 사주 · 오늘의 운세",W/2,H-118);
    x.fillStyle="#d4af6e";x.font="600 34px "+F;x.fillText(BRAND_URL,W/2,H-76);
    return c;}
  function bindSave(el,opts){
    var b=el.querySelector(".save-btn");if(!b)return;
    b.addEventListener("click",function(){
      track("image_save",{tool:location.pathname});
      var name=(opts&&opts.file||"dongnebosal")+".png";
      function reset(){b.textContent="이미지로 저장";}
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
  function bindShare(el,title,text){var b=el.querySelector(".share-btn");if(!b)return;
    b.addEventListener("click",function(){
      track("share_click",{tool:location.pathname});
      var d={title:title,text:text,url:location.href.split("#")[0].split("?")[0]},full=d.text+" "+d.url;
      function done(){b.textContent="복사됨! 카톡에 붙여넣으세요";setTimeout(function(){b.textContent="결과 공유하기";},2200);}
      function legacy(){ // clipboard API가 거부돼도 동작하는 최후 폴백
        var ta=document.createElement("textarea");ta.value=full;ta.style.position="fixed";ta.style.opacity="0";
        document.body.appendChild(ta);ta.select();
        try{document.execCommand("copy");done();}catch(e){b.textContent="복사 실패 — 길게 눌러 직접 복사하세요";}
        document.body.removeChild(ta);}
      // url 키를 함께 주면 대상 앱이 링크만 집어가고 text 를 버린다. 본문에 url 을 녹여 통째로 넘긴다
      if(navigator.share){navigator.share({title:d.title,text:full}).catch(function(){});}
      else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(full).then(done,legacy);}
      else legacy();});}

  // ---------- TOOLS ----------
  
var TOOLS=[];
window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(!t)return;var el=document.getElementById(elId);t.render(el);if(location.hash==="#go"){var g=el.querySelector("#go");if(g)setTimeout(function(){g.click();},250);}var Q="input,select,textarea";[].forEach.call(el.querySelectorAll("label:not([for])"),function(l){if(l.querySelector(Q))return;var c=null;for(var n=l.nextElementSibling;n&&!c&&n.tagName!=="LABEL";n=n.nextElementSibling)c=n.matches(Q)?n:n.querySelector(Q);if(c&&c.id)l.htmlFor=c.id;});};