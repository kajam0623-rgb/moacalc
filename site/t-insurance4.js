TOOLS.push({id:"insurance4",cat:"급여·노동",icon:"",name:"4대보험 계산기",desc:"근로자 부담 내역",render:function(el){
    el.innerHTML='<label>월 급여 (과세)</label><div class="field"><input class="money" id="s" value="3,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">근로자 부담 합계</div><div class="v" id="v">0<small>원</small></div><div class="s">매달 급여에서 공제되는 금액</div></div>'+
    '<div class="rows" id="rows"></div><p class="note">2026 근로자 요율. 사업주도 대부분 동일 부담(고용·산재는 사업주가 더 냅니다).</p>';
    function calc(){var s=num(el.querySelector("#s").value),np=Math.min(s,6170000)*.0475,hi=s*.03595,ltc=hi*.1314,ei=s*.009;
      el.querySelector("#v").innerHTML=won(np+hi+ltc+ei)+'<small>원</small>';
      el.querySelector("#rows").innerHTML=[["국민연금 4.75%",np],["건강보험 3.595%",hi],["장기요양",ltc],["고용보험 0.9%",ei]].map(function(x){return '<div class="li neg"><span>'+x[0]+'</span><b>-'+won(x[1])+'원</b></div>';}).join("");}
    bindMoney(el);el.querySelector("#s")._cb=calc;calc();}});