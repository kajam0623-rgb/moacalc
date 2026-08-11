TOOLS.push({id:"salary",cat:"급여·노동",icon:"💰",name:"실수령액 계산기",desc:"세전→통장 실수령",render:function(el){
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
    el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});