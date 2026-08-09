(function(){
var num=function(s){return Number(String(s).replace(/[^0-9.]/g,""))||0;};
  var won=function(n){return Math.round(n).toLocaleString("ko-KR");};
  var comma=function(n){return num(n).toLocaleString("ko-KR");};
  function bindMoney(root){root.querySelectorAll("input.money").forEach(function(el){
    el.addEventListener("input",function(){var v=num(this.value);this.value=v?v.toLocaleString("ko-KR"):"";if(this._cb)this._cb();});});}
  function on(root,sel,cb){root.querySelectorAll(sel).forEach(function(el){el.addEventListener("input",cb);el.addEventListener("change",cb);el._cb=cb;});}

  // ---------- 만세력 엔진 (태양황경 기반: 절기·연/월/일/시주) ----------
  var SJ_S=["갑","을","병","정","무","기","경","신","임","계"],SJ_SH="甲乙丙丁戊己庚辛壬癸";
  var SJ_B=["자","축","인","묘","진","사","오","미","신","유","술","해"],SJ_BH="子丑寅卯辰巳午未申酉戌亥";
  var SJ_TTI=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
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
    bindMoney(el);on(el,"#j,#l","",calc);el.querySelectorAll("#j,#l").forEach(function(e){e.addEventListener("change",calc);});el.querySelector("#w")._cb=calc;calc();}},

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

  {id:"datecalc",cat:"생활",icon:"",name:"날짜 계산기",desc:"기준일 ±N일",render:function(el){
    el.innerHTML='<label>기준일</label><input type="date" id="d">'+
    '<div class="r2"><div><label>더하거나 뺄 일수</label><input class="money" id="n" value="100"></div><div><label>방향</label><select id="s"><option value="1">후(+)</option><option value="-1">전(−)</option></select></div></div>'+
    '<div class="out"><div class="k">계산된 날짜</div><div class="v" id="v" style="font-size:26px">-</div><div class="s" id="w"></div></div>';
    el.querySelector("#d").value=new Date().toISOString().slice(0,10);
    function calc(){var d=new Date(el.querySelector("#d").value),n=num(el.querySelector("#n").value)*(+el.querySelector("#s").value);if(isNaN(d))return;
      var r=new Date(d.getTime()+n*864e5);el.querySelector("#v").textContent=r.toISOString().slice(0,10);
      el.querySelector("#w").textContent=["일","월","화","수","목","금","토"][r.getDay()]+"요일";}
    bindMoney(el);el.querySelector("#n")._cb=calc;el.querySelectorAll("#d,#s").forEach(function(e){e.addEventListener("change",calc);});calc();}},

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

  {id:"lottoodds",cat:"재미·운세",icon:"",name:"로또 당첨 확률",desc:"1등 확률·기대값",render:function(el){
    el.innerHTML='<label>구매 게임 수 (1게임 1,000원)</label><div class="field"><input class="money" id="n" value="5"><span class="suf">게임</span></div>'+
    '<div class="out"><div class="k">1등 당첨 확률</div><div class="v" id="v" style="font-size:22px">-</div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">1등 조합 8,145,060분의 1(45C6). 재미로만 보세요.</p>';
    function calc(){var n=Math.max(1,num(el.querySelector("#n").value)),total=8145060;
      el.querySelector("#v").textContent="1 / "+Math.round(total/n).toLocaleString();
      el.querySelector("#s").textContent=(n/total*100).toFixed(6)+"%";
      el.querySelector("#rows").innerHTML='<div class="li"><span>구매 비용</span><b>'+won(n*1000)+'원</b></div><div class="li"><span>벼락 맞을 확률(약)</span><b>1 / 1,000,000</b></div>';}
    bindMoney(el);el.querySelector("#n")._cb=calc;calc();}},

  {id:"zodiac",cat:"재미·운세",icon:"",name:"띠·별자리",desc:"생년월일로 확인",render:function(el){
    el.innerHTML='<label>생년월일</label><input type="date" id="d" value="1995-05-05">'+
    '<div class="rows" id="rows" style="margin-top:16px"></div>';
    var tti=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
    var cut=[[20,"물병"],[19,"물고기"],[21,"양"],[20,"황소"],[21,"쌍둥이"],[22,"게"],[23,"사자"],[23,"처녀"],[23,"천칭"],[23,"전갈"],[22,"사수"],[22,"염소"]];
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;
      var y=d.getFullYear(),ti=tti[((y-4)%12+12)%12],idx=d.getMonth(),st=d.getDate()<cut[idx][0]?cut[(idx+11)%12][1]:cut[idx][1];
      el.querySelector("#rows").innerHTML='<div class="li"><span>띠</span><b>'+ti+'띠</b></div><div class="li"><span>별자리</span><b>'+st+'자리</b></div><div class="li"><span>세는 나이</span><b>'+(new Date().getFullYear()-y+1)+'세</b></div>';}
    el.querySelector("#d").addEventListener("change",calc);calc();}},

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

  {id:"weekday",cat:"생활",icon:"",name:"요일 계산기",desc:"그날 무슨 요일",render:function(el){
    el.innerHTML='<label>날짜</label><input type="date" id="d">'+
    '<div class="out"><div class="k">요일</div><div class="v" id="v" style="font-size:30px">-</div><div class="s" id="s"></div></div>';
    el.querySelector("#d").value=new Date().toISOString().slice(0,10);
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;
      el.querySelector("#v").textContent=["일","월","화","수","목","금","토"][d.getDay()]+"요일";
      el.querySelector("#s").textContent=d.getFullYear()+"년 "+(d.getMonth()+1)+"월 "+d.getDate()+"일";}
    el.querySelector("#d").addEventListener("change",calc);calc();}},

  {id:"water",cat:"생활",icon:"",name:"물 섭취량 계산기",desc:"하루 권장량",render:function(el){
    el.innerHTML='<label>체중(kg)</label><div class="field"><input class="money" id="w" value="60"><span class="suf">kg</span></div>'+
    '<div class="out"><div class="k">하루 권장 수분</div><div class="v" id="v">0<small>ml</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">체중 1kg당 약 33ml 기준. 운동·날씨에 따라 더 필요할 수 있습니다.</p>';
    function calc(){var w=num(el.querySelector("#w").value),ml=w*33;el.querySelector("#v").innerHTML=Math.round(ml).toLocaleString()+'<small>ml</small>';el.querySelector("#s").textContent="약 "+(ml/1000).toFixed(1)+"L · 물컵 "+Math.round(ml/200)+"잔";}
    bindMoney(el);el.querySelector("#w")._cb=calc;calc();}},

  {id:"average",cat:"변환·기타",icon:"",name:"평균 계산기",desc:"합·평균·최대최소",render:function(el){
    el.innerHTML='<label>숫자 (쉼표 또는 줄바꿈)</label><textarea id="t" style="min-height:100px">90, 85, 78, 92, 88</textarea>'+
    '<div class="rows" id="rows" style="margin-top:14px"></div>';
    function calc(){var arr=el.querySelector("#t").value.split(/[\s,]+/).map(Number).filter(function(x){return !isNaN(x);});
      if(!arr.length){el.querySelector("#rows").innerHTML='';return;}var sum=arr.reduce(function(a,b){return a+b;},0);
      el.querySelector("#rows").innerHTML=[["개수",arr.length],["합계",sum],["평균",(sum/arr.length).toFixed(2)],["최대",Math.max.apply(null,arr)],["최소",Math.min.apply(null,arr)]]
        .map(function(x){return '<div class="li"><span>'+x[0]+'</span><b>'+Number(x[1]).toLocaleString()+'</b></div>';}).join("");}
    el.querySelector("#t").addEventListener("input",calc);calc();}},

  {id:"gpa",cat:"생활",icon:"",name:"학점 계산기",desc:"평점(GPA)",render:function(el){
    el.innerHTML='<label>과목 (학점,평점 — 한 줄에 하나)</label><textarea id="t" style="min-height:110px">3,4.5\n3,4.0\n2,3.5\n3,4.5</textarea>'+
    '<div class="out"><div class="k">평점 평균(GPA)</div><div class="v" id="v">0</div><div class="s" id="s"></div></div>'+
    '<p class="note">예: 3학점 과목에서 4.5 → "3,4.5". 4.5 만점 기준.</p>';
    function calc(){var tc=0,tp=0;el.querySelector("#t").value.split(/\n/).forEach(function(r){var m=r.split(","),c=Number(m[0]),g=Number(m[1]);if(!isNaN(c)&&!isNaN(g)){tc+=c;tp+=c*g;}});
      el.querySelector("#v").textContent=tc?(tp/tc).toFixed(2):"0";el.querySelector("#s").textContent="총 "+tc+"학점";}
    el.querySelector("#t").addEventListener("input",calc);calc();}},

  {id:"radix",cat:"변환·기타",icon:"",name:"진법 변환",desc:"2·8·10·16진",render:function(el){
    el.innerHTML='<div class="r2"><div><label>값</label><input id="v" value="255" style="text-align:left"></div><div><label>입력 진법</label><select id="b"><option value="10">10진</option><option value="2">2진</option><option value="8">8진</option><option value="16">16진</option></select></div></div>'+
    '<div class="rows" id="rows" style="margin-top:16px"></div>';
    function calc(){var raw=el.querySelector("#v").value.trim(),b=+el.querySelector("#b").value,n=parseInt(raw,b);
      if(isNaN(n)){el.querySelector("#rows").innerHTML='<p class="note">유효한 값을 입력하세요.</p>';return;}
      el.querySelector("#rows").innerHTML=[["2진",n.toString(2)],["8진",n.toString(8)],["10진",n.toString(10)],["16진",n.toString(16).toUpperCase()]]
        .map(function(x){return '<div class="li"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>';}).join("");}
    el.querySelector("#v").addEventListener("input",calc);el.querySelector("#b").addEventListener("change",calc);calc();}},

  {id:"dice",cat:"재미·운세",icon:"",name:"동전·주사위",desc:"던지기",render:function(el){
    el.innerHTML='<div class="out"><div class="k" id="k">결과</div><div class="v" id="v" style="font-size:34px">-</div></div>'+
    '<div class="r2" style="margin-top:14px"><button id="c" style="padding:13px;border:none;font:inherit;font-weight:800">동전 던지기</button><button id="d" style="padding:13px;border:none;font:inherit;font-weight:800">주사위 굴리기</button></div>';
    el.querySelector("#c").addEventListener("click",function(){el.querySelector("#k").textContent="동전";el.querySelector("#v").textContent=Math.random()<.5?"앞면":"뒷면";});
    el.querySelector("#d").addEventListener("click",function(){el.querySelector("#k").textContent="주사위";el.querySelector("#v").textContent=String(Math.floor(Math.random()*6)+1);});}},

  {id:"fx",cat:"금융",icon:"",name:"환율 계산기",desc:"수동 환율 변환",render:function(el){
    el.innerHTML='<label>외화 금액</label><div class="field"><input class="money" id="a" value="100"></div>'+
    '<label>환율 (1단위 = ? 원)</label><div class="field"><input class="money" id="r" value="1,380"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">원화 환산</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">실시간 환율은 은행·포털에서 확인해 입력하세요.</p>';
    function calc(){var a=num(el.querySelector("#a").value),r=num(el.querySelector("#r").value);
      el.querySelector("#v").innerHTML=won(a*r)+'<small>원</small>';el.querySelector("#s").textContent="1원 = "+(r?(1/r).toFixed(4):0)+" 외화";}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}},

  {id:"simpleinterest",cat:"금융",icon:"",name:"단리 이자 계산기",desc:"원금·이율·기간",render:function(el){
    el.innerHTML='<label>원금</label><div class="field"><input class="money" id="p" value="10,000,000"><span class="suf">원</span></div>'+
    '<div class="r2"><div><label>연이율(%)</label><input class="money" id="r" value="4"></div><div><label>기간(년)</label><input class="money" id="y" value="3"></div></div>'+
    '<div class="out"><div class="k">이자 + 원금</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">단리 = 원금 × 이율 × 기간.</p>';
    function calc(){var p=num(el.querySelector("#p").value),r=num(el.querySelector("#r").value)/100,y=num(el.querySelector("#y").value),i=p*r*y;
      el.querySelector("#v").innerHTML=won(p+i)+'<small>원</small>';el.querySelector("#s").textContent="이자 "+won(i)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>원금</span><b>'+won(p)+'원</b></div><div class="li"><span>이자</span><b>'+won(i)+'원</b></div>';}
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

  {id:"datasize",cat:"변환·기타",icon:"",name:"데이터 용량 변환",desc:"KB·MB·GB·TB",render:function(el){
    el.innerHTML='<label>값</label><div class="field"><input class="money" id="v" value="1024"></div>'+
    '<label>단위</label><select id="u"><option value="1">KB</option><option value="1024">MB</option><option value="1048576">GB</option><option value="1073741824">TB</option></select>'+
    '<div class="rows" id="rows" style="margin-top:16px"></div><p class="note">1024 기준(2진).</p>';
    function calc(){var kb=num(el.querySelector("#v").value)*(+el.querySelector("#u").value);
      el.querySelector("#rows").innerHTML=[["KB",kb],["MB",kb/1024],["GB",kb/1048576],["TB",kb/1073741824]]
        .map(function(x){return '<div class="li"><span>'+x[0]+'</span><b>'+(Math.round(x[1]*1000)/1000).toLocaleString()+'</b></div>';}).join("");}
    bindMoney(el);el.querySelector("#v")._cb=calc;el.querySelector("#u").addEventListener("change",calc);calc();}},

  {id:"roman",cat:"변환·기타",icon:"",name:"로마 숫자 변환",desc:"아라비아→로마",render:function(el){
    el.innerHTML='<label>숫자 (1~3999)</label><div class="field"><input class="money" id="n" value="2026"></div>'+
    '<div class="out"><div class="k">로마 숫자</div><div class="v" id="v" style="font-size:30px">-</div></div>';
    function calc(){var n=num(el.querySelector("#n").value);if(n<1||n>3999){el.querySelector("#v").textContent="1~3999";return;}
      var map=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]],s="";
      map.forEach(function(m){while(n>=m[0]){s+=m[1];n-=m[0];}});el.querySelector("#v").textContent=s;}
    bindMoney(el);el.querySelector("#n")._cb=calc;calc();}},

  {id:"agekind",cat:"생활",icon:"",name:"나이 종류 변환",desc:"만·세는·연 나이",render:function(el){
    el.innerHTML='<label>생년월일</label><input type="date" id="d" value="1995-05-05">'+
    '<div class="rows" id="rows" style="margin-top:16px"></div><p class="note">2023년 6월부터 법적 나이는 만 나이입니다.</p>';
    function calc(){var d=new Date(el.querySelector("#d").value);if(isNaN(d))return;var now=new Date(),Y=now.getFullYear(),y=d.getFullYear();
      var man=Y-y-((now.getMonth()<d.getMonth()||(now.getMonth()===d.getMonth()&&now.getDate()<d.getDate()))?1:0);
      el.querySelector("#rows").innerHTML='<div class="li"><span>만 나이</span><b>'+man+'세</b></div><div class="li"><span>세는 나이</span><b>'+(Y-y+1)+'세</b></div><div class="li"><span>연 나이</span><b>'+(Y-y)+'세</b></div>';}
    el.querySelector("#d").addEventListener("change",calc);calc();}},

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

  {id:"randnum",cat:"재미·운세",icon:"",name:"랜덤 숫자",desc:"범위 지정 추첨",render:function(el){
    el.innerHTML='<div class="r2"><div><label>최소</label><input class="money" id="a" value="1"></div><div><label>최대</label><input class="money" id="b" value="100"></div></div>'+
    '<label>뽑을 개수</label><div class="field"><input class="money" id="n" value="1"></div>'+
    '<button id="btn" style="margin-top:12px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">뽑기</button>'+
    '<div class="out" style="margin-top:14px"><div class="k">결과</div><div class="v" id="v" style="font-size:26px">-</div></div>';
    function go(){var a=num(el.querySelector("#a").value),b=num(el.querySelector("#b").value),n=Math.max(1,num(el.querySelector("#n").value)),r=[];
      for(var i=0;i<n;i++)r.push(Math.floor(Math.random()*(b-a+1))+a);el.querySelector("#v").textContent=r.join(", ");}
    bindMoney(el);el.querySelector("#btn").addEventListener("click",go);go();}},

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
      '<div class="sj-cell"><div class="sj-han el-'+SJ_EL[SJ_EB[b]]+'">'+SJ_BH[b]+'</div><div class="sj-ko">'+SJ_B[b]+' · '+SJ_EL[SJ_EB[b]]+'</div><div class="sj-tg">'+tg2+'</div></div>';}
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
      var duHtml="";for(var i2=1;i2<=8;i2++){var kk=((m60+(fwd?i2:-i2))%60+60)%60;
        duHtml+='<div class="sj-du"><div class="a">'+(su+10*(i2-1))+'세</div><div class="g">'+SJ_SH[kk%10]+SJ_BH[kk%12]+'</div></div>';}
      // 십성 카운트
      var tgc={};chars.forEach(function(c,ci){if(!(ci===2)){var g1=sjTenGod(ds,c.s);tgc[g1]=(tgc[g1]||0)+1;}var g2=sjTenGod(ds,SJ_BMAIN[c.b]);tgc[g2]=(tgc[g2]||0)+1;});
      var tgTop=Object.entries(tgc).sort(function(a,b){return b[1]-a[1];}).slice(0,3).map(function(x){return x[0]+" "+x[1];}).join(" · ");
      var cols=[["시주",p.h?cell(p.h.s,p.h.b,ds):'<div class="sj-cell"><div class="sj-han" style="opacity:.25">?</div><div class="sj-ko">시각 모름</div></div>'],
                ["일주(나)",cell(p.d.s,p.d.b,ds)],["월주",cell(p.m.s,p.m.b,ds)],["연주",cell(p.y.s,p.y.b,ds)]];
      el.querySelector("#out").innerHTML=
        '<div class="sj-grid">'+cols.map(function(c){return '<div class="sj-col"><div class="h">'+c[0]+'</div>'+c[1]+'</div>';}).join("")+'</div>'+
        '<div class="sj-bars">'+SJ_EL.map(function(e,i){return '<div class="sj-bar"><span class="n el-'+e+'">'+e+'</span><span class="t"><i class="bg-'+e+'" style="width:'+(tot?cnt[i]/tot*100:0)+'%"></i></span><span class="c">'+cnt[i]+'</span></div>';}).join("")+'</div>'+
        '<div class="sj-sec"><h3>일간 — '+SJ_S[ds]+'('+SJ_SH[ds]+') '+SJ_EL[SJ_ES[ds]]+'</h3><p>'+ILGAN[ds]+'</p></div>'+
        '<div class="sj-sec"><h3>오행 균형</h3><p>'+mx+'('+ELDESC[mx]+')의 기운이 가장 강하고, '+mn+'('+ELDESC[mn]+')이 상대적으로 약합니다. 강한 기운은 재능이자 과할 때의 그림자이니, 부족한 '+mn+'의 영역을 의식적으로 채우면 균형이 좋아집니다.</p></div>'+
        '<div class="sj-sec"><h3>십성 분포</h3><p>'+tgTop+' — 일간('+SJ_S[ds]+') 기준 상위 십성입니다. 비견·겁재는 자립심, 식신·상관은 표현·재능, 재성은 현실 감각, 관성은 책임·조직, 인성은 학문·수용력을 뜻합니다.</p></div>'+
        '<div class="sj-sec"><h3>대운 (10년 주기 · '+(fwd?"순행":"역행")+')</h3><div class="sj-daeun">'+duHtml+'</div></div>'+
        '<p class="note">'+p.tti+'띠 · 절기(태양황경) 기반 만세력 · 진태양시 보정 '+(corr?"적용":"미적용")+'. 전통 명리학의 해석 틀에 따른 참고용 풀이입니다.</p>';}
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
    el.innerHTML='<p class="note" style="margin-top:0">마음속으로 질문 하나를 떠올리고, 카드를 차례로 눌러 뒤집으세요.</p>'+
    '<div class="tr-board" id="b"></div><div class="tr-read" id="r"></div>'+
    '<button id="re" style="margin-top:16px;width:100%;padding:13px;border:none;font:inherit;font-weight:800">다시 뽑기</button>';
    var picks;
    function deal(){
      var idx=[];while(idx.length<3){var n=Math.floor(Math.random()*22);if(idx.indexOf(n)<0)idx.push(n);}
      picks=idx.map(function(n){return {c:M[n],rev:Math.random()<0.4};});
      el.querySelector("#r").innerHTML="";
      el.querySelector("#b").innerHTML=POS.map(function(p,i){
        return '<div class="tr-slot"><div class="tr-pos">'+p+'</div><div class="tr-card" data-i="'+i+'"><div class="tr-b">✦</div>'+
        '<div class="tr-f"><span class="no">'+picks[i].c[0]+'</span><span class="sym" style="display:inline-block'+(picks[i].rev?';transform:rotate(180deg)':'')+'">'+picks[i].c[2]+'</span><span class="nm">'+picks[i].c[1]+'</span>'+(picks[i].rev?'<span class="rv">역방향</span>':'')+'</div></div></div>';}).join("");
      el.querySelectorAll(".tr-card").forEach(function(card){card.addEventListener("click",function(){
        if(card.classList.contains("flip"))return;card.classList.add("flip");
        var i=+card.dataset.i,pk=picks[i];
        el.querySelector("#r").innerHTML+='<div class="one"><b>'+POS[i]+' — '+pk.c[1]+(pk.rev?" (역방향)":"")+'</b><p>'+(pk.rev?pk.c[4]:pk.c[3])+'</p></div>';});});}
    el.querySelector("#re").addEventListener("click",deal);deal();}}
  ];
window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(t)t.render(document.getElementById(elId));};
})();