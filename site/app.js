(function(){
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
  function zoCard(b,label){return '<div class="sj-char"><img src="img/char/zo-'+ZO_EN[b]+'.webp" alt="'+SJ_TTI[b]+'띠" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
    '<div class="cap"><div class="t">'+(label||"나의 띠")+'</div><div class="n">'+SJ_TTI[b]+'띠</div><p>'+ZO_TRAIT[b]+'</p></div></div>';}
  var SJ_ES=[0,0,1,1,2,2,3,3,4,4]; // 천간 오행(목화토금수=01234)
  var SJ_EB=[4,2,0,0,2,1,1,2,3,3,2,4]; // 지지 오행
  var SJ_BMAIN=[9,5,0,1,4,2,3,5,6,7,4,8]; // 지지 본기 천간 idx
  var SJ_EL=["목","화","토","금","수"];
  function sjJdn(y,m,d){var a=Math.floor((14-m)/12),Y=y+4800-a,M=m+12*a-3;
    return d+Math.floor((153*M+2)/5)+365*Y+Math.floor(Y/4)-Math.floor(Y/100)+Math.floor(Y/400)-32045;}
  function sjSunLong(jd){ // 태양 시황경(도) — Meeus 근사, 오차 <0.01°
    var T=(jd-2451545)/36525,L0=280.46646+36000.76983*T+0.0003032*T*T,
        M=(357.52911+35999.05029*T-0.0001537*T*T)*Math.PI/180,
        C=(1.914602-0.004817*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
    return ((L0+C)%360+360)%360;}
  function sjJdKST(y,mo,d,h,mi){return sjJdn(y,mo,d)-0.5+((h||0)+(mi||0)/60-9)/24;} // KST→UT 포함 JD
  function sjIpchun(y){ // y년 입춘(황경 315°) KST JD
    var lo=sjJdKST(y,2,2,0,0),hi=sjJdKST(y,2,7,0,0);
    for(var i=0;i<40;i++){var mid=(lo+hi)/2,L=sjSunLong(mid);
      (L>=315&&L<330)?hi=mid:lo=mid;}
    return (lo+hi)/2;}
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
      // 23시 이후 야자시: 일주는 당일 유지(만세력 표준), 시지=자
      hp={s:((ds%5)*2+hIdx)%10,b:hIdx};}
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
   "장생":"갓 태어난 기운으로 순수하고 성장 가능성이 큽니다. 사람들의 도움을 자연스럽게 받습니다.",
   "목욕":"멋을 부리고 감정이 풍부한 자리입니다. 매력이 있지만 마음이 흔들리기도 쉽습니다.",
   "관대":"사회에 나서는 청년의 기운입니다. 자신감과 의욕이 넘치나 다소 성급할 수 있습니다.",
   "건록":"스스로 벌어 자립하는 가장 단단한 자리입니다. 실속이 있고 책임감이 강합니다.",
   "제왕":"기운이 가장 왕성한 정점입니다. 주도력이 뛰어나지만 고집으로 흐르지 않게 조절이 필요합니다.",
   "쇠":"정점을 지나 안정으로 접어든 자리입니다. 무리하지 않고 내실을 다지는 데 강합니다.",
   "병":"기운이 약해지며 예민해지는 자리입니다. 감수성과 배려심이 깊어 사람을 잘 살핍니다.",
   "사":"활동보다 사색이 깊어지는 자리입니다. 연구·기획처럼 안으로 파고드는 일에 어울립니다.",
   "묘":"거두어 저장하는 자리입니다. 모으고 지키는 힘이 있어 관리와 축적에 강합니다.",
   "절":"끊어졌다 다시 이어지는 자리입니다. 변화가 많지만 새 출발의 기운도 함께 있습니다.",
   "태":"새 생명이 잉태되는 자리입니다. 아이디어와 가능성이 씨앗처럼 자리 잡습니다.",
   "양":"태어나기 전 길러지는 자리입니다. 보호받으며 준비하는 시기로 온화한 기질을 줍니다."};
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
   "천을귀인":"사주에서 가장 좋은 길신입니다. 어려울 때 도와주는 사람이 나타나고, 큰 위기를 넘기게 하는 힘이 있습니다.",
   "문창귀인":"학문과 글재주의 별입니다. 공부·시험·글쓰기·기획 등 머리를 쓰는 일에서 두각을 나타냅니다.",
   "도화살":"매력과 인기의 별입니다. 사람을 끄는 힘이 강해 예술·연예·서비스·영업 분야에서 강점이 됩니다.",
   "역마살":"이동과 변화의 별입니다. 해외·출장·이사·유통처럼 움직이는 일에서 기회가 열립니다.",
   "화개살":"고독과 예술의 별입니다. 혼자 깊이 파고드는 힘이 있어 연구·종교·예술·전문직에 어울립니다.",
   "양인살":"강한 칼의 기운입니다. 결단력과 추진력이 뛰어나지만 과하면 다툼이 되니 조절이 필요합니다.",
   "백호대살":"강렬한 기운의 별입니다. 승부처에서 힘을 발휘하나 건강과 안전을 특히 챙겨야 합니다.",
   "괴강살":"우두머리의 기운입니다. 카리스마와 리더십이 강하며 극단으로 흐르기 쉬운 면도 있습니다."};
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
   "건록격":"스스로 벌어 스스로 서는 자수성가형입니다. 남에게 기대기보다 내 힘으로 기반을 만드는 구조라 독립·전문직·자기 사업이 잘 맞습니다.",
   "양인격":"강한 추진력과 승부 기질을 타고났습니다. 극한의 상황에서 오히려 힘을 내지만, 평상시엔 그 기운을 운동이나 전문 기술로 풀어야 합니다.",
   "식신격":"먹을 복과 표현력의 구조입니다. 만들고 창작하고 가르치는 일에서 결실이 나며 성격도 여유로운 편입니다.",
   "상관격":"재능이 밖으로 뻗는 구조입니다. 기존 틀을 깨는 아이디어가 강점이나, 조직의 규율과는 부딪히기 쉬워 자율성이 있는 환경이 좋습니다.",
   "편재격":"큰 판을 보는 사업가형 구조입니다. 돈의 흐름을 읽는 감각이 뛰어나며, 유통·영업·투자처럼 규모가 움직이는 분야에 어울립니다.",
   "정재격":"성실하게 쌓아 올리는 구조입니다. 정해진 수입을 꾸준히 관리해 자산을 만드는 데 강하며 신용이 곧 재산이 됩니다.",
   "편관격":"압박을 이겨내며 성장하는 구조입니다. 경쟁이 치열한 분야, 위기 관리가 필요한 자리에서 능력이 드러납니다.",
   "정관격":"질서와 명예를 중시하는 구조입니다. 원칙대로 일할 때 인정받으며 공직·대기업·전문 자격 분야가 잘 맞습니다.",
   "편인격":"독특한 관점과 직관의 구조입니다. 남들이 안 보는 것을 보며, 전문 연구·기술·예술 등 깊이 파는 분야에서 빛납니다.",
   "정인격":"배우고 품는 구조입니다. 학문·교육·상담처럼 지식을 쌓아 나누는 일에서 인정받고 귀인의 도움도 따릅니다."};
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

  // ---------- TOOLS ----------
  
var TOOLS=[
  {id:"salary",cat:"급여·노동",icon:"💰",name:"실수령액 계산기",desc:"세전→통장 실수령",render:function(el){
    el.innerHTML='<div class="r2"><div><label>구분</label><select id="m"><option value="year">연봉</option><option value="month">월급</option></select></div>'+
    '<div><label>부양가족(본인포함)</label><select id="f"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div></div>'+
    '<label>세전 금액</label><div class="field"><input class="money" id="a" inputmode="numeric" value="40,000,000"><span class="suf">원</span></div>'+
    '<label>월 비과세(식대 등)</label><div class="field"><input class="money" id="t" inputmode="numeric" value="200,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">월 실수령액</div><div class="v" id="net">0<small>원</small></div><div class="s" id="sub"></div></div>'+
    '<div class="rows" id="rows"></div>'+
    '<p class="note">2026 요율: 국민연금 4.75%·건강 3.595%·장기요양 건보료의 13.14%·고용 0.9%. 소득세는 연 결정세액 기준 예상치로 실제 원천징수와 다를 수 있습니다.</p>';
    function calc(){var mode=el.querySelector("#m").value,raw=num(el.querySelector("#a").value),mg=mode==="year"?raw/12:raw,
      tf=Math.min(num(el.querySelector("#t").value),mg),fam=+el.querySelector("#f").value,tx=Math.max(mg-tf,0);
      var np=Math.min(tx,6170000)*.0475,hi=tx*.03595,ltc=hi*.1314,ei=tx*.009,it=incomeTaxMonthly(tx,fam,np,hi,ltc,ei),lt=it*.1;
      var tot=np+hi+ltc+ei+it+lt,net=mg-tot;
      el.querySelector("#net").innerHTML=won(net)+'<small>원</small>';
      el.querySelector("#sub").textContent="세전 "+won(mg)+"원 · 공제율 "+(mg?(tot/mg*100).toFixed(1):0)+"%";
      var r=[["국민연금",np],["건강보험",hi],["장기요양",ltc],["고용보험",ei],["소득세",it],["지방소득세",lt],["연 실수령",net*12]];
      el.querySelector("#rows").innerHTML=r.map(function(x,i){return '<div class="li'+(i<6?' neg':'')+'"><span>'+x[0]+'</span><b>'+(i<6?'-':'')+won(x[1])+'원</b></div>';}).join("");}
    bindMoney(el);el.querySelectorAll("#m,#f").forEach(function(e){e.addEventListener("change",calc);});
    el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"severance",cat:"급여·노동",icon:"🧾",name:"퇴직금 계산기",desc:"입퇴사일로 계산",render:function(el){
    el.innerHTML='<div class="r2"><div><label>입사일</label><input type="date" id="j" value="2021-03-02"></div><div><label>퇴사일</label><input type="date" id="l" value="2026-08-07"></div></div>'+
    '<label>월 평균임금(세전)</label><div class="field"><input class="money" id="w" value="3,500,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">예상 퇴직금(세전)</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">퇴직금=1일 평균임금×30×(재직일수/365). 1년 미만은 지급 대상 아님. 퇴직소득세 별도.</p>';
    function calc(){var j=new Date(el.querySelector("#j").value),l=new Date(el.querySelector("#l").value),w=num(el.querySelector("#w").value),
      d=Math.floor((l-j)/864e5);if(isNaN(d)||d<=0){el.querySelector("#s").textContent="날짜 확인";return;}
      var da=w*3/91.3,pay=da*30*(d/365),ok=d>=365;
      el.querySelector("#r").innerHTML=(ok?won(pay):"0")+'<small>원</small>';
      el.querySelector("#s").textContent="재직 "+Math.floor(d/365)+"년 "+(d%365)+"일"+(ok?"":" · 1년 미만");}
    bindMoney(el);el.querySelectorAll("#j,#l").forEach(function(e){e.addEventListener("change",calc);});el.querySelector("#w")._cb=calc;calc();}},

  {id:"annual",cat:"급여·노동",icon:"🌴",name:"연차수당 계산기",desc:"미사용 연차 수당",render:function(el){
    el.innerHTML='<label>월 통상임금(세전)</label><div class="field"><input class="money" id="w" value="3,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>월 소정근로시간</label><input class="money" id="h" value="209"></div><div><label>미사용 연차(일)</label><input class="money" id="d" value="5"></div></div>'+
    '<div class="out"><div class="k">연차수당</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">연차수당=시간당 통상임금×8시간×미사용일수. 시간당=월 통상임금÷월 소정근로시간(보통 209).</p>';
    function calc(){var w=num(el.querySelector("#w").value),h=num(el.querySelector("#h").value)||209,d=num(el.querySelector("#d").value);
      var hourly=w/h,pay=hourly*8*d;el.querySelector("#r").innerHTML=won(pay)+'<small>원</small>';
      el.querySelector("#s").textContent="시간당 "+won(hourly)+"원 × 8h × "+d+"일";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"hourly",cat:"급여·노동",icon:"⏱️",name:"시급→월급 변환",desc:"시급·근로시간→월급",render:function(el){
    el.innerHTML='<label>시급</label><div class="field"><input class="money" id="w" value="10,320"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>주 근로시간</label><input class="money" id="h" value="40"></div><div><label>주휴 포함</label><select id="p"><option value="1">예</option><option value="0">아니오</option></select></div></div>'+
    '<div class="out"><div class="k">예상 월급(세전)</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">2026 최저시급 10,320원. 주휴수당=주 15시간 이상 시 유급. 월=주×4.345.</p>';
    function calc(){var w=num(el.querySelector("#w").value),h=num(el.querySelector("#h").value),p=el.querySelector("#p").value==="1";
      var weekly=w*h+(p&&h>=15?w*(h/40*8):0),m=weekly*4.345;el.querySelector("#r").innerHTML=won(m)+'<small>원</small>';
      el.querySelector("#s").textContent="주급 "+won(weekly)+"원 · 연 "+won(m*12)+"원";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#p").addEventListener("change",calc);calc();}},

  {id:"freelance",cat:"급여·노동",icon:"🧑‍💻",name:"프리랜서 3.3%",desc:"원천징수·실수령",render:function(el){
    el.innerHTML='<label>계약금액(세전)</label><div class="field"><input class="money" id="a" value="3,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">실수령액</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div>'+
    '<p class="note">3.3% = 소득세 3% + 지방소득세 0.3%. 5월 종합소득세 신고 시 대부분 환급 발생.</p>';
    function calc(){var a=num(el.querySelector("#a").value),it=a*.03,lt=a*.003,net=a-it-lt;
      el.querySelector("#r").innerHTML=won(net)+'<small>원</small>';el.querySelector("#s").textContent="공제 "+won(it+lt)+"원 (3.3%)";
      el.querySelector("#rows").innerHTML='<div class="li neg"><span>소득세 3%</span><b>-'+won(it)+'원</b></div><div class="li neg"><span>지방소득세 0.3%</span><b>-'+won(lt)+'원</b></div>';}
    bindMoney(el);el.querySelector("#a")._cb=calc;calc();}},

  {id:"loan",cat:"금융",icon:"🏦",name:"대출 이자 계산기",desc:"원리금균등 월상환",render:function(el){
    el.innerHTML='<label>대출 원금</label><div class="field"><input class="money" id="p" value="100,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이자율(%)</label><input class="money" id="r" value="4.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="360"></div></div>'+
    '<div class="out"><div class="k">월 상환액</div><div class="v" id="m">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div>';
    function calc(){var P=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100/12,n=num(el.querySelector("#n").value);
      var m=r>0?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n,total=m*n,interest=total-P;
      el.querySelector("#m").innerHTML=won(m)+'<small>원</small>';el.querySelector("#s").textContent=n+"개월 원리금균등";
      el.querySelector("#rows").innerHTML='<div class="li"><span>총 상환액</span><b>'+won(total)+'원</b></div><div class="li neg"><span>총 이자</span><b>'+won(interest)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"savings",cat:"금융",icon:"🐖",name:"적금 만기 계산기",desc:"월납 적금 만기금",render:function(el){
    el.innerHTML='<label>월 납입액</label><div class="field"><input class="money" id="p" value="500,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이자율(%)</label><input class="money" id="r" value="3.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="12"></div></div>'+
    '<div class="out"><div class="k">만기 수령액(세후)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">단리·이자소득세 15.4% 반영. 원금+세후이자.</p>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100,n=num(el.querySelector("#n").value);
      var principal=p*n,pretax=p*r/12*(n*(n+1)/2),tax=pretax*.154,net=principal+pretax-tax;
      el.querySelector("#v").innerHTML=won(net)+'<small>원</small>';el.querySelector("#s").textContent="원금 "+won(principal)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>세전 이자</span><b>'+won(pretax)+'원</b></div><div class="li neg"><span>이자세 15.4%</span><b>-'+won(tax)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"vat",cat:"부동산·세금",icon:"🧮",name:"부가세 계산기",desc:"공급가↔합계 10%",render:function(el){
    el.innerHTML='<label>금액</label><div class="field"><input class="money" id="a" value="1,000,000"><span class="suf">원</span></div>'+
    '<label>기준</label><select id="m"><option value="supply">이 금액이 공급가액 (부가세 더하기)</option><option value="total">이 금액이 합계 (부가세 빼기)</option></select>'+
    '<div class="rows" id="rows" style="margin-top:16px"></div>';
    function calc(){var a=num(el.querySelector("#a").value),m=el.querySelector("#m").value,supply,vat,total;
      if(m==="supply"){supply=a;vat=a*.1;}else{supply=a/1.1;vat=a-supply;}total=supply+vat;
      el.querySelector("#rows").innerHTML='<div class="li"><span>공급가액</span><b>'+won(supply)+'원</b></div><div class="li"><span>부가세(10%)</span><b>'+won(vat)+'원</b></div><div class="li"><span>합계</span><b>'+won(total)+'원</b></div>';}
    bindMoney(el);el.querySelector("#a")._cb=calc;el.querySelector("#m").addEventListener("change",calc);calc();}},

  {id:"acqtax",cat:"부동산·세금",icon:"🏠",name:"부동산 취득세",desc:"주택 취득세율",render:function(el){
    el.innerHTML='<label>주택 취득가액</label><div class="field"><input class="money" id="p" value="500,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">취득세(본세)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">1주택 유상취득 기준. 6억↓ 1%, 6~9억 1~3% 구간, 9억↑ 3%. 지방교육세·농특세 별도(소액). 다주택·조정지역은 중과.</p>';
    function calc(){var P=num(el.querySelector("#p").value),rate;
      if(P<=6e8)rate=1;else if(P<=9e8)rate=P/1e8*2/3-3;else rate=3;
      var tax=P*rate/100;el.querySelector("#v").innerHTML=won(tax)+'<small>원</small>';
      el.querySelector("#s").textContent="적용 세율 "+rate.toFixed(2)+"%";}
    bindMoney(el);el.querySelector("#p")._cb=calc;calc();}},

  {id:"pyeong",cat:"부동산·세금",icon:"📐",name:"평↔㎡ 변환",desc:"평수 제곱미터",render:function(el){
    el.innerHTML='<div class="r2"><div><label>평</label><input class="money" id="p" value="34"></div><div><label>㎡</label><input class="money" id="m" value="112.4"></div></div>'+
    '<p class="note">1평 = 3.305785㎡. 한쪽을 입력하면 다른 쪽이 자동 변환됩니다.</p>';
    var K=3.305785,lock=false;
    function fromP(){if(lock)return;lock=true;el.querySelector("#m").value=(num(el.querySelector("#p").value)*K).toFixed(2);lock=false;}
    function fromM(){if(lock)return;lock=true;el.querySelector("#p").value=(num(el.querySelector("#m").value)/K).toFixed(2);lock=false;}
    el.querySelector("#p").addEventListener("input",fromP);el.querySelector("#m").addEventListener("input",fromM);}},

  {id:"jeonse",cat:"부동산·세금",icon:"🔑",name:"전월세 전환율",desc:"보증금↔월세",render:function(el){
    el.innerHTML='<label>전세 보증금</label><div class="field"><input class="money" id="d" value="300,000,000"><span class="suf">원</span></div>'+
    '<label>전환율(연 %)</label><div class="field"><input class="money" id="r" value="5.5"><span class="suf">%</span></div>'+
    '<div class="out"><div class="k">환산 월세</div><div class="v" id="v">0<small>원</small></div><div class="s">보증금 전액 월세 전환 시</div></div>'+
    '<p class="note">월세=보증금×전환율÷12. 법정 전환율 상한은 기준금리+2% 등 규정 참고.</p>';
    function calc(){var d=num(el.querySelector("#d").value),r=num(el.querySelector("#r").value)/100;el.querySelector("#v").innerHTML=won(d*r/12)+'<small>원</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"age",cat:"생활",icon:"🎂",name:"만 나이 계산기",desc:"생년월일→만 나이",render:function(el){
    el.innerHTML='<label>생년월일</label><input type="date" id="b" value="1990-01-01">'+
    '<div class="out"><div class="k">만 나이</div><div class="v" id="v">0<small>세</small></div><div class="s" id="s"></div></div>';
    function calc(){var b=new Date(el.querySelector("#b").value),n=new Date();if(isNaN(b))return;
      var a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;
      var days=Math.floor((n-b)/864e5);el.querySelector("#v").innerHTML=a+'<small>세</small>';el.querySelector("#s").textContent="태어난 지 "+days.toLocaleString()+"일";}
    el.querySelector("#b").addEventListener("change",calc);calc();}},

  {id:"dday",cat:"생활",icon:"📅",name:"D-day 계산기",desc:"날짜 사이 일수",render:function(el){
    el.innerHTML='<div class="r2"><div><label>시작일</label><input type="date" id="a"></div><div><label>목표일</label><input type="date" id="b"></div></div>'+
    '<div class="out"><div class="k">남은/지난 일수</div><div class="v" id="v">D-0</div><div class="s" id="s"></div></div>';
    var t=new Date();el.querySelector("#a").value=t.toISOString().slice(0,10);var f=new Date(t.getTime()+100*864e5);el.querySelector("#b").value=f.toISOString().slice(0,10);
    function calc(){var a=new Date(el.querySelector("#a").value),b=new Date(el.querySelector("#b").value);if(isNaN(a)||isNaN(b))return;
      var d=Math.round((b-a)/864e5);el.querySelector("#v").textContent=d>0?"D-"+d:d<0?"D+"+(-d):"D-DAY";
      el.querySelector("#s").textContent=Math.abs(d).toLocaleString()+"일 "+(d>=0?"남음":"지남");}
    el.querySelectorAll("input").forEach(function(e){e.addEventListener("change",calc);});calc();}},

  {id:"charcount",cat:"생활",icon:"🔤",name:"글자수 세기",desc:"공백 포함/제외",render:function(el){
    el.innerHTML='<label>텍스트를 붙여넣으세요</label><textarea id="t" placeholder="자소서·블로그 글 등을 입력하세요"></textarea>'+
    '<div class="chips" id="c"></div>';
    function calc(){var v=el.querySelector("#t").value,noSp=v.replace(/\s/g,""),bytes=0;
      for(var i=0;i<v.length;i++){bytes+=v.charCodeAt(i)>127?2:1;}
      var words=v.trim()?v.trim().split(/\s+/).length:0;
      el.querySelector("#c").innerHTML=[["공백포함",v.length+"자"],["공백제외",noSp.length+"자"],["단어",words],["바이트",bytes+"B"],["줄",v?v.split(/\n/).length:0]]
        .map(function(x){return '<span class="chip">'+x[0]+' '+x[1]+'</span>';}).join("");}
    el.querySelector("#t").addEventListener("input",calc);calc();}},

  {id:"bmi",cat:"생활",icon:"⚖️",name:"BMI 계산기",desc:"체질량·표준체중",render:function(el){
    el.innerHTML='<div class="r2"><div><label>키(cm)</label><input class="money" id="h" value="170"></div><div><label>몸무게(kg)</label><input class="money" id="w" value="65"></div></div>'+
    '<div class="out"><div class="k">BMI</div><div class="v" id="v">0</div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div>';
    function calc(){var h=num(el.querySelector("#h").value)/100,w=num(el.querySelector("#w").value);if(!h)return;
      var bmi=w/(h*h),g=bmi<18.5?"저체중":bmi<23?"정상":bmi<25?"과체중":"비만",std=22*h*h;
      el.querySelector("#v").textContent=bmi.toFixed(1);el.querySelector("#s").textContent=g;
      el.querySelector("#rows").innerHTML='<div class="li"><span>표준체중(BMI22)</span><b>'+std.toFixed(1)+'kg</b></div><div class="li"><span>차이</span><b>'+(w-std>0?"+":"")+(w-std).toFixed(1)+'kg</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"discount",cat:"생활",icon:"🏷️",name:"할인가 계산기",desc:"정가·할인율→가격",render:function(el){
    el.innerHTML='<div class="r2"><div><label>정가</label><div class="field"><input class="money" id="p" value="50,000"></div></div><div><label>할인율(%)</label><input class="money" id="r" value="30"></div></div>'+
    '<div class="out"><div class="k">할인가</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value);var f=p*(1-r/100);
      el.querySelector("#v").innerHTML=won(f)+'<small>원</small>';el.querySelector("#s").textContent=won(p*r/100)+"원 할인";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"lotto",cat:"재미·운세",icon:"🍀",name:"로또 번호 생성기",desc:"행운의 6자리",render:function(el){
    el.innerHTML='<div class="out"><div class="k">이번 주 행운 번호</div><div class="chips" id="c" style="justify-content:center"></div></div>'+
    '<button id="b" style="margin-top:14px;width:100%;padding:14px;border:none;border-radius:12px;background:var(--accent);color:#fff;font:inherit;font-weight:800;font-size:16px;cursor:pointer">다시 뽑기</button>';
    function gen(){var s=new Set();while(s.size<6)s.add(Math.floor(Math.random()*45)+1);
      el.querySelector("#c").innerHTML=[...s].sort(function(a,b){return a-b;}).map(function(n){return '<span class="chip" style="min-width:42px;text-align:center">'+n+'</span>';}).join("");}
    el.querySelector("#b").addEventListener("click",gen);gen();}},

  {id:"draw",cat:"재미·운세",icon:"🎲",name:"랜덤 뽑기",desc:"추첨·순서 정하기",render:function(el){
    el.innerHTML='<label>후보(줄바꿈 또는 쉼표로 구분)</label><textarea id="t" style="min-height:100px">철수\n영희\n민수\n지영</textarea>'+
    '<div class="r2" style="margin-top:12px"><div><label>몇 명 뽑기</label><input class="money" id="n" value="1"></div><div style="display:flex;align-items:flex-end"><button id="b" style="width:100%;padding:13px;border:none;border-radius:11px;background:var(--accent);color:#fff;font:inherit;font-weight:800;cursor:pointer">뽑기</button></div></div>'+
    '<div class="out" id="o" style="display:none"><div class="k">당첨</div><div class="v" id="v" style="font-size:26px"></div></div>';
    function draw(){var arr=el.querySelector("#t").value.split(/[\n,]/).map(function(s){return s.trim();}).filter(Boolean);
      var n=Math.min(num(el.querySelector("#n").value)||1,arr.length);for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
      el.querySelector("#o").style.display="block";el.querySelector("#v").textContent=arr.slice(0,n).join(", ");}
    el.querySelector("#b").addEventListener("click",draw);}},

  {id:"deposit",cat:"금융",icon:"💵",name:"예금 만기 계산기",desc:"복리 예치 만기금",render:function(el){
    el.innerHTML='<label>예치금</label><div class="field"><input class="money" id="p" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이율(%)</label><input class="money" id="r" value="3.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="12"></div></div>'+
    '<div class="out"><div class="k">만기 수령액(세후)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">월복리·이자소득세 15.4% 반영.</p>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100,n=num(el.querySelector("#n").value);
      var mature=p*Math.pow(1+r/12,n),pretax=mature-p,tax=pretax*.154,net=p+pretax-tax;
      el.querySelector("#v").innerHTML=won(net)+'<small>원</small>';el.querySelector("#s").textContent="원금 "+won(p)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>세전 이자</span><b>'+won(pretax)+'원</b></div><div class="li neg"><span>이자세 15.4%</span><b>-'+won(tax)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"brokerfee",cat:"부동산·세금",icon:"🤝",name:"중개수수료 계산기",desc:"매매·전월세 상한",render:function(el){
    el.innerHTML='<label>거래금액</label><div class="field"><input class="money" id="p" value="500,000,000"><span class="suf">원</span></div>'+
    '<label>거래 유형</label><select id="t"><option value="sale">매매·교환</option><option value="rent">전세·월세</option></select>'+
    '<div class="out" style="margin-top:14px"><div class="k">중개보수 상한</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">주택 기준 법정 상한요율. 실제는 상한 내 협의이며 부가세 별도일 수 있습니다.</p>';
    function rate(P,t){var b=t==="sale"?[[5e7,.006],[2e8,.005],[9e8,.004],[12e8,.005],[15e8,.006]]:[[5e7,.005],[1e8,.004],[6e8,.003],[12e8,.004],[15e8,.005]];
      for(var i=0;i<b.length;i++)if(P<=b[i][0])return b[i][1];return t==="sale"?.007:.006;}
    function calc(){var P=num(el.querySelector("#p").value),t=el.querySelector("#t").value,rt=rate(P,t),fee=P*rt;
      el.querySelector("#v").innerHTML=won(fee)+'<small>원</small>';el.querySelector("#s").textContent="상한요율 "+(rt*100).toFixed(1)+"%";}
    bindMoney(el);el.querySelector("#p")._cb=calc;el.querySelector("#t").addEventListener("change",calc);calc();}},

  {id:"weeklyholiday",cat:"급여·노동",icon:"",name:"주휴수당 계산기",desc:"주 15시간+ 유급",render:function(el){
    el.innerHTML='<label>시급</label><div class="field"><input class="money" id="w" value="10,320"><span class="suf">원</span></div>'+
    '<label>주 근로시간</label><div class="field"><input class="money" id="h" value="20"><span class="suf">시간</span></div>'+
    '<div class="out"><div class="k">주휴수당 (주)</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">주 15시간 이상 개근 시 유급 주휴. 주휴수당=(주 근로시간÷40, 최대 1)×8×시급.</p>';
    function calc(){var w=num(el.querySelector("#w").value),h=num(el.querySelector("#h").value),pay=h>=15?Math.min(h/40,1)*8*w:0;
      el.querySelector("#v").innerHTML=won(pay)+'<small>원</small>';el.querySelector("#s").textContent=h>=15?"월 환산 약 "+won(pay*4.345)+"원":"주 15시간 미만 · 미지급";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"insurance4",cat:"급여·노동",icon:"",name:"4대보험 계산기",desc:"근로자 부담 내역",render:function(el){
    el.innerHTML='<label>월 급여 (과세)</label><div class="field"><input class="money" id="s" value="3,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">근로자 부담 합계</div><div class="v" id="v">0<small>원</small></div><div class="s">매달 급여에서 공제되는 금액</div></div>'+
    '<div class="rows" id="rows"></div><p class="note">2026 근로자 요율. 사업주도 대부분 동일 부담(고용·산재는 사업주가 더 냅니다).</p>';
    function calc(){var s=num(el.querySelector("#s").value),np=Math.min(s,6170000)*.0475,hi=s*.03595,ltc=hi*.1314,ei=s*.009;
      el.querySelector("#v").innerHTML=won(np+hi+ltc+ei)+'<small>원</small>';
      el.querySelector("#rows").innerHTML=[["국민연금 4.75%",np],["건강보험 3.595%",hi],["장기요양",ltc],["고용보험 0.9%",ei]].map(function(x){return '<div class="li neg"><span>'+x[0]+'</span><b>-'+won(x[1])+'원</b></div>';}).join("");}
    bindMoney(el);el.querySelector("#s")._cb=calc;calc();}},

  {id:"loanequal",cat:"금융",icon:"",name:"원금균등 상환",desc:"매달 원금 동일",render:function(el){
    el.innerHTML='<label>대출 원금</label><div class="field"><input class="money" id="p" value="100,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이자율(%)</label><input class="money" id="r" value="4.5"></div><div><label>기간(개월)</label><input class="money" id="n" value="120"></div></div>'+
    '<div class="out"><div class="k">첫 달 상환액</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">매달 원금(원금÷개월) 고정 + 잔액 이자. 상환액은 매달 감소합니다.</p>';
    function calc(){var P=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100/12,n=num(el.querySelector("#n").value)||1;
      var pr=P/n,first=pr+P*r,last=pr+pr*r,interest=P*r*(n+1)/2;
      el.querySelector("#v").innerHTML=won(first)+'<small>원</small>';el.querySelector("#s").textContent="마지막 달 "+won(last)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>총 상환액</span><b>'+won(P+interest)+'원</b></div><div class="li neg"><span>총 이자</span><b>'+won(interest)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"dsr",cat:"금융",icon:"",name:"DSR 계산기",desc:"소득 대비 상환",render:function(el){
    el.innerHTML='<label>연 소득</label><div class="field"><input class="money" id="y" value="50,000,000"><span class="suf">원</span></div>'+
    '<label>월 총 원리금 상환액</label><div class="field"><input class="money" id="m" value="1,500,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">DSR</div><div class="v" id="v">0<small>%</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">DSR=연 원리금상환액÷연소득. 은행권은 대개 40% 이내로 규제합니다.</p>';
    function calc(){var y=num(el.querySelector("#y").value),m=num(el.querySelector("#m").value),dsr=y?m*12/y*100:0;
      el.querySelector("#v").innerHTML=dsr.toFixed(1)+'<small>%</small>';el.querySelector("#s").textContent=dsr<=40?"규제 40% 이내":"40% 초과 · 대출 제한 가능";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"prepay",cat:"금융",icon:"",name:"중도상환수수료",desc:"잔액×율×잔여",render:function(el){
    el.innerHTML='<label>중도상환 금액</label><div class="field"><input class="money" id="a" value="50,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>수수료율(%)</label><input class="money" id="r" value="1.2"></div><div><label>잔여기간(개월)</label><input class="money" id="rm" value="24"></div></div>'+
    '<label>대출 총기간(개월)</label><div class="field"><input class="money" id="tm" value="36"></div>'+
    '<div class="out"><div class="k">중도상환수수료</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">수수료=상환금액×수수료율×(잔여기간÷대출총기간). 보통 3년 경과 시 면제됩니다.</p>';
    function calc(){var a=num(el.querySelector("#a").value),r=num(el.querySelector("#r").value)/100,rm=num(el.querySelector("#rm").value),tm=num(el.querySelector("#tm").value)||1;
      var fee=a*r*(rm/tm);el.querySelector("#v").innerHTML=won(fee)+'<small>원</small>';el.querySelector("#s").textContent="유효 수수료율 "+(r*rm/tm*100).toFixed(2)+"%";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"compound",cat:"금융",icon:"",name:"복리 계산기",desc:"원금·이율→미래가치",render:function(el){
    el.innerHTML='<label>원금</label><div class="field"><input class="money" id="p" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이율(%)</label><input class="money" id="r" value="5"></div><div><label>기간(년)</label><input class="money" id="y" value="10"></div></div>'+
    '<div class="out"><div class="k">만기 금액</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">연 복리 기준. 미래가치=원금×(1+이율)^년수.</p>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100,y=num(el.querySelector("#y").value);
      var fv=p*Math.pow(1+r,y);el.querySelector("#v").innerHTML=won(fv)+'<small>원</small>';el.querySelector("#s").textContent=y+"년 후 · 원금의 "+(p?(fv/p).toFixed(2):0)+"배";
      el.querySelector("#rows").innerHTML='<div class="li"><span>원금</span><b>'+won(p)+'원</b></div><div class="li"><span>수익</span><b>+'+won(fv-p)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"ltv",cat:"부동산·세금",icon:"",name:"대출한도(LTV)",desc:"담보가×비율",render:function(el){
    el.innerHTML='<label>담보(주택) 가격</label><div class="field"><input class="money" id="p" value="500,000,000"><span class="suf">원</span></div>'+
    '<label>LTV 비율(%)</label><div class="field"><input class="money" id="r" value="70"><span class="suf">%</span></div>'+
    '<div class="out"><div class="k">최대 대출 한도</div><div class="v" id="v">0<small>원</small></div><div class="s">규제·소득(DSR)에 따라 실제 한도는 낮아질 수 있습니다</div></div>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100;el.querySelector("#v").innerHTML=won(p*r)+'<small>원</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"percent",cat:"변환·기타",icon:"",name:"퍼센트 계산기",desc:"비율 3종",render:function(el){
    el.innerHTML='<label>계산 종류</label><select id="m"><option value="0">A는 B의 몇 %인가</option><option value="1">B의 A%는 얼마</option><option value="2">A에서 B로 몇 % 증감</option></select>'+
    '<div class="r2" style="margin-top:14px"><div><label>A</label><input class="money" id="a" value="30"></div><div><label>B</label><input class="money" id="b" value="200"></div></div>'+
    '<div class="out"><div class="k">결과</div><div class="v" id="v">0</div></div>';
    function calc(){var m=el.querySelector("#m").value,a=num(el.querySelector("#a").value),b=num(el.querySelector("#b").value),r;
      if(m==="0")r=(b?a/b*100:0).toFixed(2)+"%";else if(m==="1")r=won(b*a/100);else r=(a?((b-a)/a*100).toFixed(2):0)+"%";
      el.querySelector("#v").textContent=r;}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#m").addEventListener("change",calc);calc();}},

  {id:"unit",cat:"변환·기타",icon:"",name:"단위 변환",desc:"길이·무게·온도",render:function(el){
    el.innerHTML='<label>종류</label><select id="c"><option value="len">길이</option><option value="wt">무게</option><option value="temp">온도</option></select>'+
    '<label>값</label><div class="field"><input class="money" id="v" value="100"></div>'+
    '<div class="rows" id="rows" style="margin-top:16px"></div>';
    function calc(){var c=el.querySelector("#c").value,x=num(el.querySelector("#v").value),out;
      if(c==="len")out=[["m",x],["km",x/1000],["cm",x*100],["inch",x*39.3701],["ft",x*3.28084],["mile",x/1609.34]];
      else if(c==="wt")out=[["kg",x],["g",x*1000],["근(600g)",x/0.6],["파운드",x*2.20462],["온스",x*35.274]];
      else out=[["°C",x],["°F",x*9/5+32],["K",x+273.15]];
      el.querySelector("#rows").innerHTML=out.map(function(o){return '<div class="li"><span>'+o[0]+'</span><b>'+(Math.round(o[1]*1000)/1000).toLocaleString("ko-KR")+'</b></div>';}).join("");}
    bindMoney(el);el.querySelector("#v")._cb=calc;el.querySelector("#c").addEventListener("change",calc);calc();}},

  {id:"password",cat:"변환·기타",icon:"",name:"비밀번호 생성기",desc:"안전한 랜덤",render:function(el){
    el.innerHTML='<label>길이</label><div class="field"><input class="money" id="n" value="16"></div>'+
    '<div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:12px">'+
    '<label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:14px;margin:0"><input type="checkbox" id="d" checked>숫자</label>'+
    '<label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:14px;margin:0"><input type="checkbox" id="s" checked>기호</label>'+
    '<label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:14px;margin:0"><input type="checkbox" id="up" checked>대문자</label></div>'+
    '<div class="out"><div class="k">생성된 비밀번호</div><div class="v" id="v" style="font-size:19px;word-break:break-all;text-align:left"></div></div>'+
    '<button id="b" style="margin-top:14px;width:100%;padding:13px;border:none;background:var(--accent);color:#fff;font:inherit;font-weight:800;cursor:pointer">다시 생성</button>';
    function gen(){var n=Math.max(4,Math.min(64,num(el.querySelector("#n").value))),set="abcdefghijkmnpqrstuvwxyz";
      if(el.querySelector("#up").checked)set+="ABCDEFGHJKLMNPQRSTUVWXYZ";if(el.querySelector("#d").checked)set+="23456789";if(el.querySelector("#s").checked)set+="!@#$%^&*?";
      var p="";for(var i=0;i<n;i++)p+=set[Math.floor(Math.random()*set.length)];el.querySelector("#v").textContent=p;}
    el.querySelector("#b").addEventListener("click",gen);el.querySelectorAll("input").forEach(function(e){e.addEventListener("input",gen);e.addEventListener("change",gen);});gen();}},

  {id:"worktime",cat:"생활",icon:"",name:"근무시간 계산기",desc:"출퇴근→근무시간",render:function(el){
    el.innerHTML='<div class="r2"><div><label>출근</label><input type="time" id="i" value="09:00"></div><div><label>퇴근</label><input type="time" id="o" value="18:00"></div></div>'+
    '<label>휴게시간(분)</label><div class="field"><input class="money" id="b" value="60"><span class="suf">분</span></div>'+
    '<div class="out"><div class="k">실 근무시간</div><div class="v" id="v">0<small>시간</small></div><div class="s" id="s"></div></div>';
    function calc(){var i=el.querySelector("#i").value.split(":"),o=el.querySelector("#o").value.split(":"),b=num(el.querySelector("#b").value);
      var mins=(+o[0]*60+ +o[1])-(+i[0]*60+ +i[1]);if(mins<0)mins+=1440;mins-=b;if(mins<0)mins=0;
      el.querySelector("#v").innerHTML=(mins/60).toFixed(2)+'<small>시간</small>';el.querySelector("#s").textContent=Math.floor(mins/60)+"시간 "+(mins%60)+"분";}
    bindMoney(el);el.querySelector("#b")._cb=calc;el.querySelectorAll("#i,#o").forEach(function(e){e.addEventListener("change",calc);});calc();}},

  {id:"duedate",cat:"생활",icon:"",name:"출산 예정일",desc:"마지막 생리+280일",render:function(el){
    el.innerHTML='<label>마지막 생리 시작일</label><input type="date" id="d">'+
    '<div class="out"><div class="k">출산 예정일</div><div class="v" id="v" style="font-size:26px">-</div><div class="s" id="s"></div></div>'+
    '<p class="note">네겔레 법칙(마지막 생리 시작일+280일) 기준 추정. 개인차가 있어 병원 확인이 필요합니다.</p>';
    el.querySelector("#d").value=new Date(Date.now()-56*864e5).toISOString().slice(0,10);
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;var due=new Date(d.getTime()+280*864e5),week=Math.floor((Date.now()-d)/864e5/7);
      el.querySelector("#v").textContent=due.toISOString().slice(0,10);el.querySelector("#s").textContent=week>=0&&week<=45?"현재 임신 "+week+"주차":"";}
    el.querySelector("#d").addEventListener("change",calc);calc();}},

  {id:"smoke",cat:"생활",icon:"",name:"흡연 비용 계산기",desc:"하루 흡연→연·10년",render:function(el){
    el.innerHTML='<div class="r2"><div><label>하루 개비 수</label><input class="money" id="c" value="10"></div><div><label>한 갑 가격</label><input class="money" id="p" value="4,500"></div></div>'+
    '<div class="out"><div class="k">10년 흡연 비용</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">한 갑 20개비 기준.</p>';
    function calc(){var c=num(el.querySelector("#c").value),p=num(el.querySelector("#p").value),day=c/20*p;
      el.querySelector("#v").innerHTML=won(day*3650)+'<small>원</small>';el.querySelector("#s").textContent="하루 "+won(day)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>월</span><b>'+won(day*30)+'원</b></div><div class="li"><span>1년</span><b>'+won(day*365)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"ladder",cat:"재미·운세",icon:"",name:"사다리타기",desc:"공평하게 정하기",render:function(el){
    el.innerHTML='<label>참가자 (줄바꿈)</label><textarea id="p" style="min-height:78px">철수\n영희\n민수\n지영</textarea>'+
    '<label>결과 (줄바꿈·같은 개수)</label><textarea id="r" style="min-height:78px">청소\n설거지\n빨래\n꽝</textarea>'+
    '<button id="b" style="margin-top:12px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">사다리 타기</button>'+
    '<div id="out" style="margin-top:16px"></div>';
    function go(){
      var P=el.querySelector("#p").value.split(/\n/).map(function(s){return s.trim();}).filter(Boolean);
      var R=el.querySelector("#r").value.split(/\n/).map(function(s){return s.trim();}).filter(Boolean);
      var n=P.length;if(n<2||R.length<n){el.querySelector("#out").innerHTML='<p class="note">참가자·결과를 2개 이상, 같은 수로 입력하세요.</p>';return;}
      var rows=Math.max(6,n*2),W=Math.min(70,320/n),H=26,rungs=[];
      for(var y=1;y<rows;y++){var used={};for(var x=0;x<n-1;x++){if(Math.random()<0.4&&!used[x-1]){rungs.push([x,y]);used[x]=1;}}}
      var end=[];for(var i=0;i<n;i++){var c=i;for(var y2=1;y2<rows;y2++){
        if(rungs.some(function(g){return g[1]===y2&&g[0]===c-1;}))c--;
        else if(rungs.some(function(g){return g[1]===y2&&g[0]===c;}))c++;}end.push(c);}
      var sw=(n-1)*W+40,sh=(rows-1)*H+20,s='<svg viewBox="0 0 '+sw+' '+sh+'" style="width:100%;max-width:'+sw+'px" stroke="currentColor" fill="none">';
      for(var x2=0;x2<n;x2++)s+='<line x1="'+(20+x2*W)+'" y1="10" x2="'+(20+x2*W)+'" y2="'+(sh-10)+'" stroke-opacity=".35"/>';
      rungs.forEach(function(g){var yy=10+g[1]*H;s+='<line x1="'+(20+g[0]*W)+'" y1="'+yy+'" x2="'+(20+(g[0]+1)*W)+'" y2="'+yy+'" stroke="#e6b25a" stroke-width="2.5"/>';});
      s+='</svg>';
      el.querySelector("#out").innerHTML=s+'<div class="rows">'+P.map(function(name,i){return '<div class="li"><span>'+name+'</span><b>'+R[end[i]]+'</b></div>';}).join("")+'</div>';}
    el.querySelector("#b").addEventListener("click",go);go();}},

  {id:"anniversary",cat:"생활",icon:"",name:"기념일 계산기",desc:"사귄 날부터 D일",render:function(el){
    el.innerHTML='<label>시작일 (사귄 날 등)</label><input type="date" id="d">'+
    '<div class="out"><div class="k">오늘로</div><div class="v" id="v">0<small>일째</small></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">시작일을 1일째로 계산합니다.</p>';
    el.querySelector("#d").value=new Date(Date.now()-100*864e5).toISOString().slice(0,10);
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;
      var days=Math.floor((Date.now()-d)/864e5)+1;el.querySelector("#v").innerHTML=days.toLocaleString()+'<small>일째</small>';
      el.querySelector("#rows").innerHTML=[100,200,300,365,500,1000,2000].map(function(m){var t=new Date(d.getTime()+(m-1)*864e5);
        return '<div class="li"><span>'+(m===365?"1주년":m+"일")+'</span><b>'+t.toISOString().slice(0,10)+'</b></div>';}).join("");}
    el.querySelector("#d").addEventListener("change",calc);calc();}},

  {id:"fire",cat:"금융",icon:"",name:"FIRE 은퇴 계산기",desc:"경제적 자유까지",render:function(el){
    el.innerHTML='<label>연 지출</label><div class="field"><input class="money" id="e" value="30,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>현재 자산</label><div class="field"><input class="money" id="a" value="50,000,000"></div></div><div><label>연 저축액</label><div class="field"><input class="money" id="sv" value="20,000,000"></div></div></div>'+
    '<label>연 수익률(%)</label><div class="field"><input class="money" id="r" value="6"><span class="suf">%</span></div>'+
    '<div class="out"><div class="k">경제적 자유까지</div><div class="v" id="v">-</div><div class="s" id="ss"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">목표=연지출×25 (4% 인출률). 매년 저축+수익 재투자 가정.</p>';
    function calc(){var ex=num(el.querySelector("#e").value),a=num(el.querySelector("#a").value),sv=num(el.querySelector("#sv").value),r=num(el.querySelector("#r").value)/100;
      var goal=ex*25,y=0,bal=a;while(bal<goal&&y<80){bal=bal*(1+r)+sv;y++;}
      el.querySelector("#v").innerHTML=bal>=goal?(y+'<small>년 뒤</small>'):'80년+';
      el.querySelector("#ss").textContent=bal>=goal?("약 "+(new Date().getFullYear()+y)+"년 달성"):"저축·수익률을 높여보세요";
      el.querySelector("#rows").innerHTML='<div class="li"><span>목표 자산(연지출×25)</span><b>'+won(goal)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(x){x._cb=calc;});calc();}},

  {id:"installment",cat:"금융",icon:"",name:"카드 할부 수수료",desc:"할부 이자 계산",render:function(el){
    el.innerHTML='<label>할부 금액</label><div class="field"><input class="money" id="p" value="1,200,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>할부 개월</label><input class="money" id="n" value="6"></div><div><label>수수료율(연 %)</label><input class="money" id="r" value="15"></div></div>'+
    '<div class="out"><div class="k">총 수수료</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">잔액 기준 월 수수료 합산(근사). 실제는 카드사 방식에 따라 다릅니다.</p>';
    function calc(){var p=num(el.querySelector("#p").value),n=num(el.querySelector("#n").value)||1,r=num(el.querySelector("#r").value)/100/12;
      var monthly=p/n,fee=0;for(var i=0;i<n;i++)fee+=(p-monthly*i)*r;
      el.querySelector("#v").innerHTML=won(fee)+'<small>원</small>';el.querySelector("#s").textContent="월 납부 약 "+won(p/n+fee/n)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>총 결제액</span><b>'+won(p+fee)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"savegoal",cat:"금융",icon:"",name:"목표 저축 계산기",desc:"목표까지 월 저축",render:function(el){
    el.innerHTML='<label>목표 금액</label><div class="field"><input class="money" id="g" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>기간(개월)</label><input class="money" id="n" value="24"></div><div><label>연이율(%)</label><input class="money" id="r" value="3"></div></div>'+
    '<div class="out"><div class="k">매달 저축액</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">적금 복리 가정. 이율 0이면 목표÷개월입니다.</p>';
    function calc(){var g=num(el.querySelector("#g").value),n=num(el.querySelector("#n").value)||1,r=num(el.querySelector("#r").value)/100/12;
      var pmt=r>0?g*r/(Math.pow(1+r,n)-1):g/n;el.querySelector("#v").innerHTML=won(pmt)+'<small>원</small>';el.querySelector("#s").textContent=n+"개월 · 총 납입 "+won(pmt*n)+"원";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"realreturn",cat:"금융",icon:"",name:"실질 수익률",desc:"물가 반영 수익",render:function(el){
    el.innerHTML='<div class="r2"><div><label>명목 수익률(%)</label><input class="money" id="a" value="5"></div><div><label>물가상승률(%)</label><input class="money" id="b" value="3"></div></div>'+
    '<div class="out"><div class="k">실질 수익률</div><div class="v" id="v">0<small>%</small></div><div class="s">물가를 뺀 진짜 수익</div></div>'+
    '<p class="note">실질 = (1+명목)/(1+물가) − 1.</p>';
    function calc(){var a=num(el.querySelector("#a").value)/100,b=num(el.querySelector("#b").value)/100;el.querySelector("#v").innerHTML=(((1+a)/(1+b)-1)*100).toFixed(2)+'<small>%</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"incometax",cat:"급여·노동",icon:"",name:"종합소득세 계산기",desc:"과세표준→세액",render:function(el){
    el.innerHTML='<label>과세표준</label><div class="field"><input class="money" id="b" value="30,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">산출세액 + 지방소득세</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">2026 종합소득세율(6~45%) 기준. 세액공제 전 산출세액입니다.</p>';
    function calc(){var b=num(el.querySelector("#b").value),t=progressive(b),lt=t*.1;
      el.querySelector("#v").innerHTML=won(t+lt)+'<small>원</small>';el.querySelector("#s").textContent="실효세율 "+(b?((t+lt)/b*100).toFixed(1):0)+"%";
      el.querySelector("#rows").innerHTML='<div class="li"><span>산출세액</span><b>'+won(t)+'원</b></div><div class="li"><span>지방소득세 10%</span><b>'+won(lt)+'원</b></div>';}
    bindMoney(el);el.querySelector("#b")._cb=calc;calc();}},

  {id:"rentyield",cat:"부동산·세금",icon:"",name:"임대수익률 계산기",desc:"연 수익률",render:function(el){
    el.innerHTML='<label>매매가</label><div class="field"><input class="money" id="p" value="300,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>보증금</label><div class="field"><input class="money" id="d" value="30,000,000"></div></div><div><label>월세</label><div class="field"><input class="money" id="m" value="1,000,000"></div></div></div>'+
    '<div class="out"><div class="k">연 임대수익률</div><div class="v" id="v">0<small>%</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">수익률 = 연 월세 ÷ (매매가 − 보증금) × 100. 세금·관리비 제외.</p>';
    function calc(){var p=num(el.querySelector("#p").value),d=num(el.querySelector("#d").value),m=num(el.querySelector("#m").value),invest=p-d;
      el.querySelector("#v").innerHTML=(invest>0?(m*12/invest*100).toFixed(2):0)+'<small>%</small>';el.querySelector("#s").textContent="실투자금 "+won(invest)+"원";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"water",cat:"생활",icon:"",name:"물 섭취량 계산기",desc:"하루 권장량",render:function(el){
    el.innerHTML='<label>체중(kg)</label><div class="field"><input class="money" id="w" value="60"><span class="suf">kg</span></div>'+
    '<div class="out"><div class="k">하루 권장 수분</div><div class="v" id="v">0<small>ml</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">체중 1kg당 약 33ml 기준. 운동·날씨에 따라 더 필요할 수 있습니다.</p>';
    function calc(){var w=num(el.querySelector("#w").value),ml=w*33;el.querySelector("#v").innerHTML=Math.round(ml).toLocaleString()+'<small>ml</small>';el.querySelector("#s").textContent="약 "+(ml/1000).toFixed(1)+"L · 물컵 "+Math.round(ml/200)+"잔";}
    bindMoney(el);el.querySelector("#w")._cb=calc;calc();}},

  {id:"gpa",cat:"생활",icon:"",name:"학점 계산기",desc:"평점(GPA)",render:function(el){
    el.innerHTML='<label>과목 (학점,평점 — 한 줄에 하나)</label><textarea id="t" style="min-height:110px">3,4.5\n3,4.0\n2,3.5\n3,4.5</textarea>'+
    '<div class="out"><div class="k">평점 평균(GPA)</div><div class="v" id="v">0</div><div class="s" id="s"></div></div>'+
    '<p class="note">예: 3학점 과목에서 4.5 → "3,4.5". 4.5 만점 기준.</p>';
    function calc(){var tc=0,tp=0;el.querySelector("#t").value.split(/\n/).forEach(function(r){var m=r.split(","),c=Number(m[0]),g=Number(m[1]);if(!isNaN(c)&&!isNaN(g)){tc+=c;tp+=c*g;}});
      el.querySelector("#v").textContent=tc?(tp/tc).toFixed(2):"0";el.querySelector("#s").textContent="총 "+tc+"학점";}
    el.querySelector("#t").addEventListener("input",calc);calc();}},

  {id:"fx",cat:"금융",icon:"",name:"환율 계산기",desc:"수동 환율 변환",render:function(el){
    el.innerHTML='<label>외화 금액</label><div class="field"><input class="money" id="a" value="100"></div>'+
    '<label>환율 (1단위 = ? 원)</label><div class="field"><input class="money" id="r" value="1,380"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">원화 환산</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">실시간 환율은 은행·포털에서 확인해 입력하세요.</p>';
    function calc(){var a=num(el.querySelector("#a").value),r=num(el.querySelector("#r").value);
      el.querySelector("#v").innerHTML=won(a*r)+'<small>원</small>';el.querySelector("#s").textContent="1원 = "+(r?(1/r).toFixed(4):0)+" 외화";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"caffeine",cat:"생활",icon:"",name:"카페인 계산기",desc:"하루 섭취량",render:function(el){
    el.innerHTML='<label>음료</label><select id="d"><option value="150">아메리카노(150mg)</option><option value="75">에스프레소 1샷(75mg)</option><option value="74">캔커피(74mg)</option><option value="100">에너지드링크(100mg)</option><option value="34">콜라(34mg)</option><option value="30">녹차(30mg)</option></select>'+
    '<label>잔 수</label><div class="field"><input class="money" id="n" value="3"><span class="suf">잔</span></div>'+
    '<div class="out"><div class="k">하루 카페인</div><div class="v" id="v">0<small>mg</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">성인 권장 한도 하루 400mg, 임산부 200mg.</p>';
    function calc(){var d=+el.querySelector("#d").value,n=num(el.querySelector("#n").value),mg=d*n;
      el.querySelector("#v").innerHTML=mg+'<small>mg</small>';el.querySelector("#s").textContent=mg>400?"권장 한도(400mg) 초과":"권장 한도 이내";}
    bindMoney(el);el.querySelector("#n")._cb=calc;el.querySelector("#d").addEventListener("change",calc);calc();}},

  {id:"sleep",cat:"생활",icon:"",name:"수면 시간 계산기",desc:"기상 시각 역산",render:function(el){
    el.innerHTML='<label>기상 시각</label><input type="time" id="t" value="07:00">'+
    '<div class="rows" id="rows" style="margin-top:16px"></div><p class="note">수면주기 90분 + 입면 14분 기준 추천 취침시각.</p>';
    function calc(){var p=el.querySelector("#t").value.split(":"),wake=(+p[0]*60+ +p[1]);
      el.querySelector("#rows").innerHTML=[6,5,4].map(function(c){var m=((wake-(c*90+14))%1440+1440)%1440,h=Math.floor(m/60),mm=m%60;
        return '<div class="li"><span>'+c+'주기('+(c*1.5)+'시간)</span><b>'+String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0")+'</b></div>';}).join("");}
    el.querySelector("#t").addEventListener("change",calc);calc();}},

  {id:"calorie",cat:"생활",icon:"",name:"운동 칼로리 소모",desc:"운동·시간·체중",render:function(el){
    el.innerHTML='<label>운동</label><select id="m"><option value="3.5">걷기</option><option value="8">달리기</option><option value="6">자전거</option><option value="7">수영</option><option value="6">등산</option><option value="5">웨이트</option></select>'+
    '<div class="r2"><div><label>체중(kg)</label><input class="money" id="w" value="65"></div><div><label>시간(분)</label><input class="money" id="t" value="30"></div></div>'+
    '<div class="out"><div class="k">소모 칼로리</div><div class="v" id="v">0<small>kcal</small></div><div class="s">MET × 체중 × 시간(근사)</div></div>';
    function calc(){var met=+el.querySelector("#m").value,w=num(el.querySelector("#w").value),t=num(el.querySelector("#t").value)/60;
      el.querySelector("#v").innerHTML=Math.round(met*w*t*1.05)+'<small>kcal</small>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#m").addEventListener("change",calc);calc();}},

  {id:"bmr",cat:"생활",icon:"",name:"기초대사량(BMR)",desc:"하루 소모 칼로리",render:function(el){
    el.innerHTML='<div class="r2"><div><label>성별</label><select id="g"><option value="m">남</option><option value="f">여</option></select></div><div><label>나이</label><input class="money" id="a" value="30"></div></div>'+
    '<div class="r2"><div><label>키(cm)</label><input class="money" id="h" value="170"></div><div><label>몸무게(kg)</label><input class="money" id="w" value="65"></div></div>'+
    '<div class="out"><div class="k">기초대사량</div><div class="v" id="v">0<small>kcal</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">Mifflin-St Jeor 공식. 활동대사량은 BMR×1.4~1.7.</p>';
    function calc(){var g=el.querySelector("#g").value,a=num(el.querySelector("#a").value),h=num(el.querySelector("#h").value),w=num(el.querySelector("#w").value);
      var bmr=10*w+6.25*h-5*a+(g==="m"?5:-161);el.querySelector("#v").innerHTML=Math.round(bmr)+'<small>kcal</small>';el.querySelector("#s").textContent="활동 보통 시 약 "+Math.round(bmr*1.55)+"kcal/일";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});el.querySelector("#g").addEventListener("change",calc);calc();}},

  {id:"saju",cat:"재미·운세",icon:"",name:"사주팔자 만세력",desc:"오행·십성·대운",render:function(el){
    var ILGAN=["큰 나무처럼 곧고 리더십이 있으며, 한번 정한 방향은 쉽게 꺾지 않습니다. 명분과 원칙을 중시해 주변의 신뢰를 얻지만, 융통성이 부족하다는 말을 들을 수 있습니다.",
    "덩굴과 화초처럼 유연하고 섬세하며, 환경 적응력이 뛰어납니다. 부드러워 보여도 생존력이 강하고, 실속을 챙기는 현실 감각이 좋습니다.",
    "태양처럼 밝고 정열적이며 숨김이 없습니다. 사람을 모으는 힘이 있고 표현력이 뛰어나지만, 감정 기복이 드러나기 쉽습니다.",
    "촛불·달빛처럼 따뜻하고 헌신적이며 관찰력이 섬세합니다. 겉은 온화하지만 속에는 강한 집념이 있습니다.",
    "큰 산처럼 묵직하고 신용을 중시합니다. 쉽게 흔들리지 않는 중심이 있어 사람들이 기대지만, 변화에는 느린 편입니다.",
    "밭의 흙처럼 포용력이 있고 성실합니다. 남을 돌보고 기르는 힘이 좋으며, 실무와 관리에 강합니다.",
    "무쇠·바위처럼 결단력 있고 의리를 중시합니다. 맺고 끊음이 분명해 승부처에 강하지만, 직설적인 말로 오해를 살 수 있습니다.",
    "보석·바늘처럼 예리하고 완벽주의적입니다. 미적 감각과 분석력이 뛰어나며, 세련된 것을 추구합니다.",
    "바다·큰 강처럼 스케일이 크고 지혜롭습니다. 자유를 사랑하고 포용력이 있지만, 한곳에 매이는 것을 싫어합니다.",
    "이슬비·시냇물처럼 총명하고 감수성이 풍부합니다. 스며드는 힘으로 사람의 마음을 읽어내며, 아이디어가 많습니다."];
    var ELDESC={목:"성장·시작·인정",화:"열정·표현·확산",토:"신용·중재·안정",금:"결단·원칙·마무리",수:"지혜·유연·저장"};
    var EL_EN={목:"wood",화:"fire",토:"earth",금:"metal",수:"water"};
    var EL_TITLE={목:["푸른 나무",  "곧게 자라는 사람"],화:["붉은 태양","환하게 비추는 사람"],토:["너른 대지","품어 기르는 사람"],금:["벼린 쇠","맺고 끊는 사람"],수:["깊은 물","고요히 스며드는 사람"]};
    var today=new Date();
    el.innerHTML='<div class="r2"><div><label>생년월일 (양력)</label><input type="date" id="d" value="1990-03-15"></div>'+
    '<div><label>태어난 시각</label><select id="t"><option value="">모름 (시주 제외)</option>'+
    Array.from({length:24},function(_,i){return '<option value="'+i+'"'+(i===12?' selected':'')+'>'+String(i).padStart(2,"0")+"시</option>";}).join("")+'</select></div></div>'+
    '<div class="r2"><div><label>성별 (대운 방향)</label><select id="g"><option value="m">남</option><option value="f">여</option></select></div>'+
    '<div><label>진태양시 보정</label><select id="c"><option value="1">적용 (−30분, 한국 표준)</option><option value="0">안 함</option></select></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">명식 뽑기</button>'+
    '<div id="out"></div>';
    function P(p){return SJ_SH[p.s]+SJ_BH[p.b];}
    function cell(s,b,ds){var tg1=s===null?"":sjTenGod(ds,s),tg2=sjTenGod(ds,SJ_BMAIN[b]);
      return '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_ES[s]]+'">'+SJ_SH[s]+'</div><div class="sj-ko">'+SJ_S[s]+' · '+SJ_EL[SJ_ES[s]]+'</div><div class="sj-tg">'+tg1+'</div></div>'+
      '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_EB[b]]+'">'+SJ_BH[b]+'</div><div class="sj-ko">'+SJ_B[b]+' · '+SJ_EL[SJ_EB[b]]+'</div><div class="sj-tg">'+tg2+'</div>'+
      '<div class="sj-tg" style="color:var(--muted)">'+sjUnseong(ds,b)+'</div></div>';}
    function go(){
      var dv=el.querySelector("#d").value.split("-"),y=+dv[0],mo=+dv[1],d=+dv[2];
      var tv=el.querySelector("#t").value,h=tv===""?null:+tv,corr=el.querySelector("#c").value==="1",male=el.querySelector("#g").value==="m";
      if(!y){return;}
      var p=sjPillars(y,mo,d,h,0,corr),ds=p.d.s;
      // 오행 카운트
      var cnt=[0,0,0,0,0],chars=[p.y,p.m,p.d];if(p.h)chars.push(p.h);
      chars.forEach(function(c){cnt[SJ_ES[c.s]]++;cnt[SJ_EB[c.b]]++;});
      var tot=cnt.reduce(function(a,b){return a+b;},0);
      var mx=SJ_EL[cnt.indexOf(Math.max.apply(null,cnt))],mn=SJ_EL[cnt.indexOf(Math.min.apply(null,cnt))];
      // 대운
      var fwd=(p.y.s%2===0)===male,jd0=sjJdKST(y,mo,d,h==null?12:h,0);
      function mIdxOf(jd){return Math.floor((((sjSunLong(jd)-315)%360)+360)%360/30);}
      var base=mIdxOf(jd0),days=30;
      for(var t=0.25;t<=32;t+=0.25){if(mIdxOf(jd0+(fwd?t:-t))!==base){days=t;break;}}
      var su=Math.max(1,Math.min(10,Math.round(days/3)));
      var m60=0;for(var k=0;k<60;k++)if(k%10===p.m.s&&k%12===p.m.b){m60=k;break;}
      var duHtml="",duList=[];for(var i2=1;i2<=8;i2++){var kk=((m60+(fwd?i2:-i2))%60+60)%60;
        var dTg=sjTenGod(ds,kk%10),dAge=su+10*(i2-1);
        duList.push({age:dAge,g:SJ_SH[kk%10]+SJ_BH[kk%12],tg:dTg});
        duHtml+='<div class="sj-du"><div class="a">'+dAge+'세</div><div class="g">'+SJ_SH[kk%10]+SJ_BH[kk%12]+'</div><div class="a" style="color:var(--fun-ink);margin-top:3px">'+dTg+'</div></div>';}
      // 십성 카운트
      var tgc={};chars.forEach(function(c,ci){if(!(ci===2)){var g1=sjTenGod(ds,c.s);tgc[g1]=(tgc[g1]||0)+1;}var g2=sjTenGod(ds,SJ_BMAIN[c.b]);tgc[g2]=(tgc[g2]||0)+1;});
      var tgTop=Object.entries(tgc).sort(function(a,b){return b[1]-a[1];}).slice(0,3).map(function(x){return x[0]+" "+x[1];}).join(" · ");
      var cols=[["시주",p.h?cell(p.h.s,p.h.b,ds):'<div class="sj-cell"><div class="sj-han" style="opacity:.25">?</div><div class="sj-ko">시각 모름</div></div>'],
                ["일주(나)",cell(p.d.s,p.d.b,ds)],["월주",cell(p.m.s,p.m.b,ds)],["연주",cell(p.y.s,p.y.b,ds)]];
      // 신강·신약 / 용신 / 격국 / 신살 / 십이운성
      var st=sjStrength(p),yEl=SJ_EL[st.yong],y2El=SJ_EL[st.yong2],Y=SJ_YONG[yEl];
      var wolTg=sjTenGod(ds,SJ_BMAIN[p.m.b]),gyeok=SJ_GYEOK[wolTg],sinsal=sjSinsal(p),ilUn=sjUnseong(ds,p.d.b);
      // 십성 그룹 집계 (재성·관성·식상·인성·비겁)
      function grp(n){return {"비견":"비겁","겁재":"비겁","식신":"식상","상관":"식상","편재":"재성","정재":"재성","편관":"관성","정관":"관성","편인":"인성","정인":"인성"}[n];}
      var G={비겁:0,식상:0,재성:0,관성:0,인성:0};
      chars.forEach(function(c,ci){if(ci!==2)G[grp(sjTenGod(ds,c.s))]++;G[grp(sjTenGod(ds,SJ_BMAIN[c.b]))]++;});
      var WEAK={목:"간·담과 눈, 근육",화:"심장·소장과 혈액순환",토:"위장·비장 등 소화기",금:"폐·대장과 호흡기·피부",수:"신장·방광과 뼈·귀"};
      var money=G.재성===0?"사주에 재성이 드러나지 않았습니다. 큰돈을 좇기보다 <b>꾸준한 수입 구조</b>를 만드는 쪽이 잘 맞습니다. 월급·계약처럼 정해진 흐름에서 안정적으로 모으는 편이 유리합니다."
        :G.재성>=3?"재성이 <b>많습니다</b>. 돈을 다루는 감각이 좋고 기회도 자주 오지만, 일간이 감당할 힘이 없으면 오히려 돈에 쫓기는 구조가 됩니다. 벌이보다 <b>관리와 분산</b>이 관건입니다."
        :"재성이 <b>적절합니다</b>. 현실 감각이 살아 있어 수입과 지출의 균형을 스스로 잡을 수 있습니다. 무리한 확장만 피하면 재물운은 무난하게 흐릅니다.";
      var job=G.관성===0?"관성이 없어 조직의 틀에 매이는 것을 답답해합니다. <b>전문성·프리랜서·자기 사업</b>처럼 스스로 규칙을 정하는 환경에서 능력이 더 나옵니다."
        :G.관성>=3?"관성이 <b>강합니다</b>. 책임과 자리를 맡는 힘이 있지만 압박도 그만큼 큽니다. 권한이 분명한 조직에서 실력을 인정받는 구조가 잘 맞습니다."
        :G.식상>=3?"식상이 발달해 <b>표현하고 만들어내는 일</b>에 강점이 있습니다. 정해진 매뉴얼보다 기획·창작·교육처럼 결과를 스스로 만드는 일에서 빛납니다."
        :"관성이 적절해 <b>조직과 자율 어느 쪽도 감당</b>할 수 있습니다. 역할이 명확하고 성과가 보이는 자리에서 만족도가 높습니다.";
      var love=male?(G.재성===0?"남성 사주에서 재성은 배우자를 뜻합니다. 재성이 드러나지 않아 인연이 늦거나 조용히 오는 편입니다. 조건보다 <b>함께 있을 때 편한 사람</b>을 기준으로 삼는 편이 좋습니다."
        :G.재성>=3?"재성이 많아 <b>이성 인연이 잦은</b> 구조입니다. 선택지가 많은 만큼 기준이 흔들리기 쉬우니, 오래 볼 사람인지 한 번 더 확인하세요."
        :"재성이 적절해 <b>연애와 결혼운이 안정적</b>입니다. 서로의 생활 리듬이 맞는 상대와 오래갑니다.")
        :(G.관성===0?"여성 사주에서 관성은 배우자를 뜻합니다. 관성이 드러나지 않아 인연이 늦거나 본인이 주도하는 관계가 되기 쉽습니다. 기다리기보다 <b>먼저 다가가는 편</b>이 낫습니다."
        :G.관성>=3?"관성이 많아 <b>이성의 관심이 잦지만</b> 그만큼 부담도 큽니다. 나를 존중하는지, 책임감이 있는지를 기준으로 두세요."
        :"관성이 적절해 <b>연애와 결혼운이 안정적</b>입니다. 서로 책임을 나눌 수 있는 상대와 잘 맞습니다.");
      var health=cnt[SJ_ES[0]]!==undefined?("오행 중 <b>"+mn+"</b>이 가장 약합니다. 명리에서 "+mn+"은 "+WEAK[mn]+"과 연결됩니다. 무리가 쌓이면 이 부위부터 신호가 오기 쉬우니 평소 관리해 두면 좋습니다. 반대로 "+mx+"이 과한 편이라 관련된 기운을 쓰는 활동으로 풀어주는 것이 도움이 됩니다."):"";
      var duNow=duList.filter(function(d){return d.age<=(new Date().getFullYear()-y+1);}).pop()||duList[0];
      var DUTXT={"비견":"자립과 동료의 시기. 내 힘으로 밀고 나가기 좋지만 동업은 경계를 분명히.","겁재":"경쟁과 지출의 시기. 사람은 얻되 돈은 새기 쉬우니 관리가 핵심.","식신":"표현과 결실의 시기. 만들고 낳는 일에 볕이 들며 건강운도 좋음.","상관":"변화와 도전의 시기. 틀을 깨는 힘이 강하나 윗사람과 마찰 주의.","편재":"큰돈이 오가는 시기. 기회가 많지만 변동성도 큼.","정재":"안정과 축적의 시기. 성실함이 그대로 자산이 됨.","편관":"시험과 승부의 시기. 부담이 크지만 통과하면 급이 오름.","정관":"명예와 자리의 시기. 승진·합격 등 공적 인정운이 밝음.","편인":"공부와 전환의 시기. 속으로 자라며 결정은 숙성 후에.","정인":"귀인과 문서의 시기. 어른·기관의 도움과 배움이 따름."};
      el.querySelector("#out").innerHTML=
        '<div class="sj-grid">'+cols.map(function(c){return '<div class="sj-col"><div class="h">'+c[0]+'</div>'+c[1]+'</div>';}).join("")+'</div>'+
        '<div class="sj-bars">'+SJ_EL.map(function(e,i){return '<div class="sj-bar"><span class="n el-'+e+'">'+e+'</span><span class="t"><i class="bg-'+e+'" style="width:'+(tot?cnt[i]/tot*100:0)+'%"></i></span><span class="c">'+cnt[i]+'</span></div>';}).join("")+'</div>'+
        '<div class="out" style="margin-top:18px"><div class="k">일간의 힘</div><div class="v" style="font-size:26px">'+(st.strong?"신강":"신약")+'<small> · 용신 '+yEl+'</small></div>'+
        '<div class="s">돕는 기운 '+Math.round(st.ratio*100)+'% · 보조용신 '+y2El+'</div></div>'+
        '<div class="sj-char"><img src="img/char/el-'+EL_EN[SJ_EL[SJ_ES[ds]]]+'-'+(male?"m":"f")+'.webp" alt="'+SJ_EL[SJ_ES[ds]]+' 오행 캐릭터" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
        '<div class="cap"><div class="t">'+SJ_EL[SJ_ES[ds]]+'('+SJ_SH[ds]+') 일간 · '+(male?"남":"여")+'</div><div class="n">'+EL_TITLE[SJ_EL[SJ_ES[ds]]][0]+'</div>'+
        '<p>'+EL_TITLE[SJ_EL[SJ_ES[ds]]][1]+' · '+ELDESC[SJ_EL[SJ_ES[ds]]]+'의 기운을 타고났습니다.</p></div></div>'+
        '<div class="sj-sec"><h3>일간 — '+SJ_S[ds]+'('+SJ_SH[ds]+') '+SJ_EL[SJ_ES[ds]]+'</h3><p>'+ILGAN[ds]+'</p></div>'+
        '<div class="sj-sec"><h3>격국 — '+gyeok+'</h3><p>'+SJ_GYEOK_DESC[gyeok]+'<br><span style="color:var(--muted);font-size:12.5px">월지 '+SJ_B[p.m.b]+'('+SJ_BH[p.m.b]+')의 본기가 '+wolTg+'이라 '+gyeok+'으로 봅니다. 격국은 사주 전체의 뼈대이자 타고난 그릇의 모양입니다.</span></p></div>'+
        (sinsal.length?'<div class="sj-sec"><h3>신살 — '+sinsal.length+'개</h3><p>'+sinsal.map(function(s){return '<b>'+s+'</b> — '+SJ_SINSAL_DESC[s];}).join("<br><br>")+'</p></div>'
          :'<div class="sj-sec"><h3>신살</h3><p>두드러진 신살이 없는 담백한 구조입니다. 특별한 기복 없이 자기 페이스를 지키는 편이며, 오행과 십성의 흐름이 그대로 드러납니다.</p></div>')+
        '<div class="sj-sec"><h3>십이운성 — 일지 '+ilUn+'</h3><p>일간 '+SJ_S[ds]+'가 일지 '+SJ_B[p.d.b]+'에서 <b>'+ilUn+'</b> 자리에 있습니다. '+SJ_UN_DESC[ilUn]+'<br><span style="color:var(--muted);font-size:12.5px">십이운성은 일간의 기운이 각 자리에서 어느 단계에 있는지를 사람의 일생에 빗대어 본 것입니다. 명식표의 지지 아래에 각각 표시했습니다.</span></p></div>'+
        '<div class="sj-sec"><h3>신강·신약과 용신</h3><p>일간을 돕는 기운이 '+Math.round(st.ratio*100)+'%로 <b>'+(st.strong?"신강":"신약")+'</b>한 사주입니다. '+
        (st.strong?"힘이 넘치므로 그 기운을 <b>밖으로 써서 덜어내는</b> 것이 좋습니다.":"힘이 부족하므로 <b>나를 도와 채워주는</b> 기운이 필요합니다.")+
        ' 그래서 용신은 <b>'+yEl+'</b>, 보조로 '+y2El+'을 씁니다. 이 기운을 가까이 둘수록 일이 순조롭게 풀립니다.</p></div>'+
        '<div class="sj-sec"><h3>용신 '+yEl+' 활용법</h3><p>· 색: <b>'+Y.color+'</b>  · 방향: <b>'+Y.dir+'</b>  · 계절: '+Y.season+'<br>· 잘 맞는 일: '+Y.job+'<br>· 도움이 되는 활동: '+Y.act+'</p></div>'+
        '<div class="sj-sec"><h3>재물운</h3><p>'+money+'</p></div>'+
        '<div class="sj-sec"><h3>직업운</h3><p>'+job+'</p></div>'+
        '<div class="sj-sec"><h3>애정운</h3><p>'+love+'</p></div>'+
        '<div class="sj-sec"><h3>건강운</h3><p>'+health+'</p></div>'+
        '<div class="sj-sec"><h3>오행 균형</h3><p>'+mx+'('+ELDESC[mx]+')의 기운이 가장 강하고, '+mn+'('+ELDESC[mn]+')이 상대적으로 약합니다. 강한 기운은 재능이자 과할 때의 그림자이니, 부족한 '+mn+'의 영역을 의식적으로 채우면 균형이 좋아집니다.</p></div>'+
        '<div class="sj-sec"><h3>십성 분포</h3><p>비겁 '+G.비겁+' · 식상 '+G.식상+' · 재성 '+G.재성+' · 관성 '+G.관성+' · 인성 '+G.인성+'<br>비겁은 자립심, 식상은 표현·재능, 재성은 현실 감각, 관성은 책임·조직, 인성은 학문·수용력을 뜻합니다.</p></div>'+
        '<div class="sj-sec"><h3>대운 (10년 주기 · '+(fwd?"순행":"역행")+')</h3><div class="sj-daeun">'+duHtml+'</div>'+
        '<p style="margin-top:12px">현재 대운은 <b>'+duNow.age+'세 '+duNow.g+' ('+duNow.tg+')</b> — '+DUTXT[duNow.tg]+'</p></div>'+
        '<div class="sj-sec"><h3>대운 흐름 요약</h3><p>'+duList.slice(0,5).map(function(d){return '<b>'+d.age+'세~</b> '+d.tg+' — '+DUTXT[d.tg].split(".")[0]+'.';}).join("<br>")+'</p></div>'+
        '<p class="note">'+p.tti+'띠 · 절기(태양황경) 기반 만세력 · 진태양시 보정 '+(corr?"적용":"미적용")+'. 신강·신약은 월령·득지 가중으로, 용신은 억부(抑扶) 기준으로 산출했습니다. 전통 명리학의 해석 틀에 따른 참고용 풀이입니다.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}},

  {id:"tarot",cat:"재미·운세",icon:"",name:"타로 카드",desc:"과거·현재·미래 3장",render:function(el){
    var M=[["0","바보","🃏","새로운 출발과 순수한 가능성. 계산 없이 내딛는 첫걸음이 행운을 부릅니다.","무모함과 준비 부족. 낭만에 취해 현실의 절벽을 못 볼 수 있습니다."],
    ["I","마법사","🎩","의지와 재능이 갖춰진 때. 원하는 것을 현실로 만들 도구가 이미 손안에 있습니다.","재주를 속임수에 쓰거나, 시작만 하고 마무리를 못 하는 산만함."],
    ["II","여사제","🌙","직관과 내면의 지혜. 서두르지 말고 마음의 소리를 들을 때입니다.","감을 무시한 선택, 혹은 비밀이 드러나며 생기는 혼란."],
    ["III","여황제","🌾","풍요와 결실, 돌봄의 에너지. 애정과 창조가 무르익습니다.","과보호나 나태함. 편안함에 안주해 성장이 멈출 수 있습니다."],
    ["IV","황제","👑","질서와 책임, 안정된 기반. 원칙을 세우면 성과가 따라옵니다.","고집과 통제욕. 권위가 소통을 막고 있지 않은지 돌아보세요."],
    ["V","교황","📜","조언자와 전통의 도움. 검증된 길을 따르는 것이 유리합니다.","형식에 갇힘. 낡은 규칙이 오히려 발목을 잡을 수 있습니다."],
    ["VI","연인","💞","사랑과 선택의 갈림길. 마음이 향하는 쪽에 답이 있습니다.","가치관의 충돌, 망설임 끝의 후회. 선택을 미루면 더 꼬입니다."],
    ["VII","전차","🏇","추진력과 승리. 방향만 맞다면 밀어붙일 때입니다.","폭주 또는 방향 상실. 속도보다 핸들을 먼저 잡으세요."],
    ["VIII","힘","🦁","부드러운 용기와 인내. 힘이 아니라 다정함이 사자를 길들입니다.","자신감 상실이나 감정 폭발. 자기 안의 두려움부터 달래야 합니다."],
    ["IX","은둔자","🏮","성찰과 내면 탐구의 시간. 잠시 물러나 등불을 밝힐 때입니다.","고립과 단절. 혼자만의 동굴에 너무 오래 머물렀는지도 모릅니다."],
    ["X","운명의 수레바퀴","🎡","흐름이 바뀌는 전환점. 우연처럼 보이는 기회가 찾아옵니다.","예상 밖의 변수. 흐름에 저항하기보다 유연하게 타는 것이 낫습니다."],
    ["XI","정의","⚖️","공정한 결과와 균형. 뿌린 대로 거두는 시기입니다.","불공정하거나 치우친 판단. 자기 몫의 책임을 회피하고 있진 않나요."],
    ["XII","매달린 사람","🙃","관점의 전환과 기다림. 멈춘 것이 아니라 숙성되는 중입니다.","희생만 하는 정체. 의미 없는 버티기라면 내려올 용기도 필요합니다."],
    ["XIII","죽음","🦋","끝과 새 시작. 낡은 것을 보내야 새것이 들어옵니다.","변화에 대한 저항. 붙잡을수록 이별은 길어집니다."],
    ["XIV","절제","🕊️","조화와 중용. 서로 다른 것을 섞어 더 나은 것을 만드는 연금술.","과유불급. 어느 한쪽으로 쏠린 생활의 균형을 점검하세요."],
    ["XV","악마","⛓️","강한 유혹과 집착. 끊어야 할 것이 무엇인지 이미 알고 있습니다.","속박에서 벗어날 기회. 사슬은 생각보다 느슨합니다."],
    ["XVI","탑","🌩️","갑작스러운 붕괴와 충격. 무너진 자리가 진짜 기초를 보여줍니다.","위기의 예감 또는 아슬아슬한 회피. 근본 문제를 미루지 마세요."],
    ["XVII","별","⭐","희망과 치유. 어둠 뒤에 뜨는 별처럼 조용한 회복이 시작됩니다.","희망을 잃은 상태. 별은 사라진 게 아니라 구름에 가려졌을 뿐입니다."],
    ["XVIII","달","🌕","불안과 모호함. 확실해질 때까지 큰 결정은 미루는 것이 좋습니다.","안개가 걷히며 진실이 드러납니다. 오해가 풀리는 시기."],
    ["XIX","태양","☀️","성공과 기쁨, 명료함. 있는 그대로 빛나도 되는 시기입니다.","일시적 구름. 성과가 늦어질 뿐 방향은 틀리지 않았습니다."],
    ["XX","심판","🎺","부활과 소명. 과거를 정리하고 한 단계 올라설 부름이 옵니다.","과거에 매인 자책. 용서(특히 자신에 대한)가 열쇠입니다."],
    ["XXI","세계","🌍","완성과 성취. 하나의 사이클이 아름답게 닫힙니다.","마무리 직전의 지연. 마지막 조각 하나만 채우면 됩니다."]];
    var POS=["과거","현재","미래"];
    var ART={0:"tarot-00-fool",1:"tarot-01-magician",2:"tarot-02-priestess",3:"tarot-03-empress",4:"tarot-04-emperor",5:"tarot-05-hierophant",6:"tarot-06-lovers",7:"tarot-07-chariot",8:"tarot-08-strength",9:"tarot-09-hermit",10:"tarot-10-wheel",11:"tarot-11-justice",12:"tarot-12-hanged",13:"tarot-13-death",14:"tarot-14-temperance",15:"tarot-15-devil",16:"tarot-16-tower",17:"tarot-17-star",18:"tarot-18-moon",19:"tarot-19-sun",20:"tarot-20-judgement",21:"tarot-21-world"};
    el.innerHTML='<p class="note" style="margin-top:0">마음속으로 질문 하나를 떠올리고, 카드를 차례로 눌러 뒤집으세요.</p>'+
    '<div class="tr-board" id="b"></div><div class="tr-read" id="r"></div>'+
    '<button id="re" style="margin-top:16px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">다시 뽑기</button>';
    var picks;
    function deal(){
      var idx=[];while(idx.length<3){var n=Math.floor(Math.random()*22);if(idx.indexOf(n)<0)idx.push(n);}
      picks=idx.map(function(n){return {c:M[n],i:n,rev:Math.random()<0.4};});
      el.querySelector("#r").innerHTML="";
      el.querySelector("#b").innerHTML=POS.map(function(p,i){
        var pk=picks[i],art=ART[pk.i];
        var face=art
          ? '<div class="tr-f art"><img src="img/char/'+art+'.webp" alt="'+pk.c[1]+' 타로 카드" class="'+(pk.rev?"rev":"")+'" loading="lazy" onerror="this.parentNode.classList.remove(\'art\');this.remove()"><span class="cap"><span class="nm">'+pk.c[1]+'</span>'+(pk.rev?'<span class="rv">역방향</span>':'')+'</span></div>'
          : '<div class="tr-f"><span class="no">'+pk.c[0]+'</span><span class="sym" style="display:inline-block'+(pk.rev?';transform:rotate(180deg)':'')+'">'+pk.c[2]+'</span><span class="nm">'+pk.c[1]+'</span>'+(pk.rev?'<span class="rv">역방향</span>':'')+'</div>';
        return '<div class="tr-slot"><div class="tr-pos">'+p+'</div><div class="tr-card" data-i="'+i+'"><div class="tr-b">✦</div>'+face+'</div></div>';}).join("");
      el.querySelectorAll(".tr-card").forEach(function(card){card.addEventListener("click",function(){
        if(card.classList.contains("flip"))return;card.classList.add("flip");
        var i=+card.dataset.i,pk=picks[i];
        el.querySelector("#r").innerHTML+='<div class="one"><b>'+POS[i]+' — '+pk.c[1]+(pk.rev?" (역방향)":"")+'</b><p>'+(pk.rev?pk.c[4]:pk.c[3])+'</p></div>';});});}
    el.querySelector("#re").addEventListener("click",deal);deal();}},

  {id:"todayfortune",cat:"재미·운세",icon:"",name:"오늘의 운세",desc:"일진×일간 명리 풀이",render:function(el){
    var TXT={ // 오늘 일진 천간이 내 일간에 대해 갖는 십성 → 오늘의 흐름
    "비견":[78,"나와 같은 기운이 들어오는 날. 내 페이스대로 밀고 가면 힘이 배가됩니다.","협업·동료운이 좋으나 돈 관리는 각자 명확히.","경쟁자가 곧 아군이 되는 날. 자존심 싸움만 피하세요."],
    "겁재":[62,"기운은 넘치는데 새어 나가기 쉬운 날. 지갑과 감정 모두 단속이 필요합니다.","충동구매·보증·즉흥 약속은 미루는 게 상책.","베풀되 한도를 정하세요. 오늘의 선심은 내일의 부담이 됩니다."],
    "식신":[85,"먹을 복과 표현력이 살아나는 날. 아이디어를 입 밖으로 꺼내면 일이 풀립니다.","실적·창작·요리·발표 모두 유리. 재물은 자연스럽게 따라옵니다.","즐기는 마음이 최고의 전략인 하루."],
    "상관":[68,"재기가 번뜩이지만 말이 앞서기 쉬운 날. 아이디어는 최고, 표현은 한 템포 늦게.","윗사람·규칙과의 마찰 주의. 창의적인 일엔 오히려 대길.","오늘 떠오른 발상은 메모해두면 나중에 돈이 됩니다."],
    "편재":[80,"큰돈이 움직이는 날. 기회는 빠르게 오고 빠르게 지나갑니다.","투자·거래·협상에 유리하나 욕심의 크기만큼 리스크도 커집니다.","계산기를 먼저 두드리고 움직이면 승산이 있습니다."],
    "정재":[83,"성실함이 그대로 돈이 되는 날. 꾸준히 하던 일에서 결실이 보입니다.","저축·계약·꼼꼼한 정산에 좋은 날. 한탕보다 확실한 것.","오늘 뿌린 신용은 이자가 붙어 돌아옵니다."],
    "편관":[58,"압박과 도전이 함께 오는 날. 부담스럽지만 이겨내면 급이 올라갑니다.","무리한 일정·과로·언쟁 주의. 운동으로 기운을 빼면 좋습니다.","피하지 말고 정면으로. 단, 서류와 말은 두 번 확인."],
    "정관":[82,"질서와 인정의 날. 원칙대로 처리하면 윗사람의 신임을 얻습니다.","승진·시험·계약·공식 업무에 유리합니다.","오늘은 정도(正道)가 지름길입니다."],
    "편인":[65,"생각이 깊어지는 날. 직감은 예리하나 실행이 늦어질 수 있습니다.","공부·연구·기획엔 좋고, 계약·확답은 하루 미루세요.","혼자만의 시간이 답을 가져다줍니다."],
    "정인":[84,"귀인과 배움의 날. 어른·스승·문서에서 도움이 옵니다.","합격·승인·소식운이 좋습니다. 배우는 만큼 쌓입니다.","도움을 받으면 감사를 표현하세요. 운이 두 배가 됩니다."]};
    el.innerHTML='<label>생년월일 (양력)</label><input type="date" id="d" value="1990-03-15">'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">오늘 운세 보기</button>'+
    '<div id="out"></div>';
    function go(){
      var dv=el.querySelector("#d").value.split("-");if(dv.length<3)return;
      var me=sjPillars(+dv[0],+dv[1],+dv[2],null,0,false);
      var now=new Date(),ty=now.getFullYear(),tm=now.getMonth()+1,td=now.getDate();
      var today=sjPillars(ty,tm,td,null,0,false);
      var rel=sjTenGod(me.d.s,today.d.s),T=TXT[rel],score=T[0];
      var myB=me.d.b,tB=today.d.b,bonus="",diff=Math.abs(myB-tB);
      if(myB%4===tB%4&&myB!==tB){score+=8;bonus="내 일지와 오늘 지지가 삼합 — 사람이 나를 돕는 흐름이 더해집니다.";}
      else if(diff===6){score-=10;bonus="내 일지와 오늘 지지가 충(沖) — 계획이 흔들릴 수 있으니 변수 하나는 예약해두세요.";}
      else if((myB+tB===13)||(myB===0&&tB===1)||(myB===1&&tB===0)){score+=6;bonus="내 일지와 오늘 지지가 육합 — 관계운이 부드럽게 풀립니다.";}
      score=Math.max(35,Math.min(98,score));
      var grade=score>=85?"대길":score>=75?"길":score>=60?"평온":"주의";
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+ty+'.'+String(tm).padStart(2,"0")+'.'+String(td).padStart(2,"0")+' · 오늘 일진 '+SJ_SH[today.d.s]+SJ_BH[today.d.b]+'('+SJ_S[today.d.s]+SJ_B[today.d.b]+')</div>'+
      '<div class="v">'+score+'<small>점 · '+grade+'</small></div><div class="s">내 일간 '+SJ_S[me.d.s]+' 기준 오늘은 <b>'+rel+'</b>의 날</div></div>'+
      zoCard(me.y.b)+
      '<div class="sj-sec"><h3>총운</h3><p>'+T[1]+'</p></div>'+
      '<div class="sj-sec"><h3>재물·일</h3><p>'+T[2]+'</p></div>'+
      '<div class="sj-sec"><h3>조언</h3><p>'+T[3]+(bonus?" "+bonus:"")+'</p></div>'+
      '<p class="note">오늘의 일진(일 간지)과 내 일간의 십성 관계로 푸는 정통 명리 방식입니다. 매일 자정에 일진이 바뀝니다. 참고용.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}},

  {id:"gunghap",cat:"재미·운세",icon:"",name:"궁합 보기",desc:"사주 오행·합충 궁합",render:function(el){
    el.innerHTML='<div class="r2"><div><label>내 생년월일</label><input type="date" id="a" value="1990-03-15"></div>'+
    '<div><label>상대 생년월일</label><input type="date" id="b" value="1992-07-20"></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">궁합 보기</button>'+
    '<div id="out"></div>';
    function pts(a,b){ // [점수증감, 설명] 목록
      var out=[],sc=60;
      // 1. 일간 천간합 (갑기·을경·병신·정임·무계)
      if(Math.abs(a.d.s-b.d.s)===5){sc+=18;out.push(["일간 천간합","두 사람의 일간("+SJ_S[a.d.s]+"·"+SJ_S[b.d.s]+")이 천간합 — 명리에서 가장 강한 끌림으로 봅니다. 서로에게 자연스럽게 스며드는 관계."]);}
      else{
        var r1=sjTenGod(a.d.s,b.d.s);
        if(r1==="정재"||r1==="정관"){sc+=10;out.push(["일간 상생","상대가 나의 "+r1+" — 서로 아껴주고 책임지는 안정형 조합입니다."]);}
        else if(r1==="정인"||r1==="식신"){sc+=8;out.push(["일간 상생","상대가 나의 "+r1+" — 한쪽이 기르고 한쪽이 자라는 순환이 좋은 관계."]);}
        else if(r1==="편관"||r1==="상관"){sc-=6;out.push(["일간 긴장","상대가 나의 "+r1+" — 자극이 강한 만큼 다툼도 잦을 수 있는 스파크형. 존중의 거리가 필요합니다."]);}
        else{out.push(["일간 관계","상대가 나의 "+r1+" — 무난하게 어울리는 조합입니다."]);}
      }
      // 2. 띠(연지) 합충
      var ab=a.y.b,bb=b.y.b,d=Math.abs(ab-bb);
      if(ab%4===bb%4&&ab!==bb){sc+=12;out.push(["띠 삼합","두 띠("+SJ_TTI[ab]+"·"+SJ_TTI[bb]+")가 삼합 — 목표를 향해 같이 달리는 최고의 팀 궁합."]);}
      else if(ab+bb===13||(ab===0&&bb===1)||(ab===1&&bb===0)){sc+=10;out.push(["띠 육합","두 띠가 육합 — 서로를 편안하게 만드는 찰떡 조합."]);}
      else if(d===6){sc-=12;out.push(["띠 충","두 띠가 충(沖) — 처음엔 강하게 끌리지만 부딪히기도 쉬운 관계. 생활 패턴 조율이 관건."]);}
      else{out.push(["띠 관계","띠 사이 특별한 합·충 없음 — 무난한 흐름입니다."]);}
      // 3. 오행 보완 (서로 부족한 오행 채워주는지)
      function cnt6(p){var c=[0,0,0,0,0];[p.y,p.m,p.d].forEach(function(x){c[SJ_ES[x.s]]++;c[SJ_EB[x.b]]++;});return c;}
      var ca=cnt6(a),cb=cnt6(b),fill=0;
      for(var i=0;i<5;i++){if(ca[i]===0&&cb[i]>=2)fill++;if(cb[i]===0&&ca[i]>=2)fill++;}
      if(fill>=2){sc+=10;out.push(["오행 보완","서로 없는 오행을 상대가 넉넉히 갖고 있어 — 함께 있을 때 완성되는 보완형."]);}
      else if(fill===1){sc+=5;out.push(["오행 보완","부족한 오행 하나를 상대가 채워줍니다."]);}
      else{out.push(["오행 구성","오행 구성이 비슷 — 닮아서 편하지만 약점도 같이 겹칠 수 있어요."]);}
      // 4. 일지 합충 (배우자궁)
      var da=a.d.b,db=b.d.b,dd=Math.abs(da-db);
      if(da%4===db%4&&da!==db){sc+=8;out.push(["배우자궁 삼합","일지(배우자 자리)끼리 삼합 — 일상 속 호흡이 잘 맞습니다."]);}
      else if(da+db===13||(da===0&&db===1)||(da===1&&db===0)){sc+=8;out.push(["배우자궁 육합","일지끼리 육합 — 살 맞대고 사는 궁합이 특히 좋습니다."]);}
      else if(dd===6){sc-=8;out.push(["배우자궁 충","일지끼리 충 — 애정과 별개로 생활 습관 충돌이 잦을 수 있습니다."]);}
      return [Math.max(35,Math.min(99,sc)),out];
    }
    function go(){
      var av=el.querySelector("#a").value.split("-"),bv=el.querySelector("#b").value.split("-");
      if(av.length<3||bv.length<3)return;
      var A=sjPillars(+av[0],+av[1],+av[2],null,0,false),B=sjPillars(+bv[0],+bv[1],+bv[2],null,0,false);
      var r=pts(A,B),sc=r[0],rows=r[1];
      var grade=sc>=85?"천생연분":sc>=72?"좋은 인연":sc>=58?"노력형 인연":"신중한 인연";
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+SJ_TTI[A.y.b]+'띠 '+SJ_S[A.d.s]+'일간 ♥ '+SJ_TTI[B.y.b]+'띠 '+SJ_S[B.d.s]+'일간</div>'+
      '<div class="v">'+sc+'<small>점 · '+grade+'</small></div></div>'+
      '<div class="gh-pair">'+zoCard(A.y.b,"나")+zoCard(B.y.b,"상대")+'</div>'+
      rows.map(function(x){return '<div class="sj-sec"><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div>';}).join("")+
      '<p class="note">일간 천간합, 띠·일지의 삼합·육합·충, 오행 보완을 종합한 정통 명리 궁합입니다. 시각까지 넣은 정밀 궁합은 사주팔자 만세력에서 각자 명식을 확인해보세요. 참고용.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}},

  {id:"newyear",cat:"재미·운세",icon:"",name:"2026 신년운세",desc:"병오년 나의 한 해",render:function(el){
    var YR=2026,YS=2,YB=6; // 병오년
    var TXT={ // 병(丙)이 내 일간에 대해 갖는 십성 → 올해의 큰 흐름
    "비견":["동료와 경쟁의 해","같은 불이 하나 더 켜지는 해. 내 힘이 커지는 만큼 경쟁자도 선명해집니다. 동업·협업은 역할을 문서로 나누면 길하고, 뭉뚱그리면 다툼이 됩니다.","독립·창업의 기운이 강한 해. 단, 자금은 내 몫을 명확히."],
    "겁재":["지출 관리의 해","기운은 왕성하나 재물이 새기 쉬운 해. 보증·동업 자금·큰 선심은 상반기엔 특히 신중하게. 대신 사람은 많이 얻습니다.","버는 해가 아니라 지키는 해로 설계하면 연말이 편안합니다."],
    "식신":["결실과 표현의 해","재능이 수입으로 연결되는 해. 만들고, 쓰고, 발표하는 모든 일에 볕이 듭니다. 건강운도 양호합니다.","미뤄둔 창작·콘텐츠·부업을 시작하기 최적의 해입니다."],
    "상관":["도전과 변화의 해","틀을 깨는 기운이 강한 해. 이직·전업·새 시도에 유리하나 윗사람·규정과의 마찰은 조심. 말이 재산도 되고 화근도 됩니다.","불만을 기획서로 바꾸면 올해 최고의 무기가 됩니다."],
    "편재":["큰 기회와 유동성의 해","돈이 크게 들고나는 해. 투자·확장·영업엔 기회가 많지만 욕심의 크기만큼 변동성도 큽니다. 현금 흐름표를 곁에 두세요.","기회는 상반기, 정리는 하반기로 리듬을 타면 좋습니다."],
    "정재":["안정과 축적의 해","성실이 그대로 쌓이는 해. 연봉·계약·저축 등 확실한 재물에 볕이 듭니다. 한탕보다 복리를 택하세요.","재테크의 기본기를 다지기 가장 좋은 해입니다."],
    "편관":["시험과 승부의 해","부담스러운 과제가 오지만 통과하면 급이 오르는 해. 건강·과로 관리가 최우선 과제입니다.","피할 수 없는 승부라면 상반기에 정면으로 치르는 편이 낫습니다."],
    "정관":["명예와 자리의 해","승진·합격·공식 인정운이 밝은 해. 원칙대로 움직일수록 평판이 자산이 됩니다.","이력서·자격·직함 등 공적인 것을 정비하기 좋은 해입니다."],
    "편인":["공부와 전환의 해","겉보다 속이 자라는 해. 자격증·공부·기획에 유리하고, 결정은 숙성 후에 내리는 게 좋습니다.","혼자 파고드는 시간이 하반기의 반전을 만듭니다."],
    "정인":["귀인과 문서의 해","어른·스승·기관의 도움이 오는 해. 계약·합격·승인 등 문서운이 밝습니다.","배움에 쓰는 돈이 올해 가장 수익률 높은 투자입니다."]};
    el.innerHTML='<label>생년월일 (양력)</label><input type="date" id="d" value="1990-03-15">'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">2026 병오년 운세 보기</button>'+
    '<div id="out"></div>';
    function go(){
      var dv=el.querySelector("#d").value.split("-");if(dv.length<3)return;
      var me=sjPillars(+dv[0],+dv[1],+dv[2],null,0,false);
      var rel=sjTenGod(me.d.s,YS),T=TXT[rel];
      var yb=me.y.b,db=me.d.b,notes=[];
      function relB(b,label){
        if(b%4===YB%4&&b!==YB)notes.push(label+"가 태세(오화)와 삼합 — 귀인과 협력의 흐름이 힘을 보탭니다.");
        else if(b+YB===13)notes.push(label+"가 태세와 육합 — 관계운이 유난히 부드러운 해입니다.");
        else if(Math.abs(b-YB)===6)notes.push(label+"가 태세와 충 — 이동·변동수가 있으니 이사·이직 등 변화를 계획 안으로 끌어오세요.");}
      relB(yb,"내 띠(연지)");relB(db,"내 일지");
      var score={비견:74,겁재:62,식신:88,상관:70,편재:80,정재:85,편관:60,정관:86,편인:68,정인:84}[rel];
      notes.forEach(function(n){if(n.indexOf("충")>=0)score-=6;else score+=5;});
      score=Math.max(40,Math.min(97,score));
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">2026 병오년(丙午年) · '+SJ_TTI[yb]+'띠 · '+SJ_S[me.d.s]+'일간</div>'+
      '<div class="v">'+score+'<small>점</small></div><div class="s">올해는 나에게 <b>'+rel+'</b>의 해 — '+T[0]+'</div></div>'+
      zoCard(me.y.b)+
      '<div class="sj-sec"><h3>한 해의 큰 흐름</h3><p>'+T[1]+'</p></div>'+
      '<div class="sj-sec"><h3>올해의 전략</h3><p>'+T[2]+'</p></div>'+
      (notes.length?'<div class="sj-sec"><h3>합·충 포인트</h3><p>'+notes.join(" ")+'</p></div>':"")+
      '<p class="note">병오년의 연간(丙)과 내 일간의 십성, 태세 지지(午)와 내 띠·일지의 합충으로 푸는 정통 명리 신년운세입니다. 참고용.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}},

  {id:"namematch",cat:"재미·운세",icon:"",name:"이름 궁합",desc:"획수 계산 전통놀이",render:function(el){
    var CHO=[1,2,2,3,3,4,4,6,2,4,4,6,4,6,3,2,3,4,3];   // ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ 근사 획수
    var CHOs="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
    var JUNG=[2,3,3,4,2,3,3,4,2,4,5,4,3,2,4,5,4,3,1,2,1]; // ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ
    var JONG=[0,1,2,3,2,3,4,3,3,5,7,9,9,7,9,10,7,2,4,2,4,1,2,3,3,4,3,4];
    function strokes(ch){var c=ch.charCodeAt(0);
      if(c<0xAC00||c>0xD7A3)return 3;
      var s=c-0xAC00,cho=Math.floor(s/588),jung=Math.floor((s%588)/28),jong=s%28;
      return CHO[cho]+JUNG[jung]+JONG[jong];}
    el.innerHTML='<div class="r2"><div><label>이름 1</label><input id="a" value="김철수" style="text-align:left;font-family:inherit"></div>'+
    '<div><label>이름 2</label><input id="b" value="이영희" style="text-align:left;font-family:inherit"></div></div>'+
    '<button id="go" style="margin-top:14px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">궁합 계산</button>'+
    '<div id="out"></div>';
    function go(){
      var A=el.querySelector("#a").value.replace(/\s/g,""),B=el.querySelector("#b").value.replace(/\s/g,"");
      if(!A||!B)return;
      var mix=[],L=Math.max(A.length,B.length);
      for(var i=0;i<L;i++){if(A[i])mix.push(strokes(A[i]));if(B[i])mix.push(strokes(B[i]));}
      var steps=[mix.map(function(x){return x%10;})],cur=steps[0];
      while(cur.length>2){var nx=[];for(var j=0;j<cur.length-1;j++)nx.push((cur[j]+cur[j+1])%10);steps.push(nx);cur=nx;}
      var score=cur.length===2?cur[0]*10+cur[1]:cur[0];if(score===0)score=100;
      var msg=score>=90?"운명이라 불러도 될 점수! 오늘 바로 연락하세요.":score>=75?"아주 잘 어울리는 짝. 함께 있으면 웃음이 끊이지 않습니다.":score>=55?"노력하면 무르익는 궁합. 반은 하늘이, 반은 두 사람이 만듭니다.":score>=35?"밀당이 필요한 사이. 다름이 매력이 될 수도 있어요.":"불꽃 튀는 상극?! 그래서 더 끌리는 법이죠.";
      var pyramid=steps.map(function(row,ri){return '<div style="text-align:center;font-family:var(--mono);font-size:'+(ri===steps.length-1?'22px;font-weight:800;color:var(--fun)':'14px;color:var(--muted)')+';letter-spacing:8px;margin:4px 0">'+row.join("")+'</div>';}).join("");
      el.querySelector("#out").innerHTML=
      '<div class="out" style="margin-top:16px"><div class="k">'+A+' ♥ '+B+'</div><div class="v">'+score+'<small>점</small></div></div>'+
      '<div class="sj-sec"><h3>획수 피라미드</h3>'+pyramid+'</div>'+
      '<div class="sj-sec"><h3>풀이</h3><p>'+msg+'</p></div>'+
      '<p class="note">이름 글자의 획수를 번갈아 놓고 이웃끼리 더하는 전통 이름궁합 놀이입니다. 재미로만 보세요. 진지한 궁합은 사주 궁합 보기를 이용하세요.</p>';}
    el.querySelector("#go").addEventListener("click",go);go();}}
  ];
window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(t)t.render(document.getElementById(elId));};
})();