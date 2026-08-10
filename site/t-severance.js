TOOLS.push({id:"severance",cat:"급여·노동",icon:"🧾",name:"퇴직금 계산기",desc:"입퇴사일로 계산",render:function(el){
    el.innerHTML='<div class="r2"><div><label>입사일</label><input type="date" id="j" value="2021-03-02"></div><div><label>퇴사일</label><input type="date" id="l" value="2026-08-07"></div></div>'+
    '<label>월 평균임금(세전)</label><div class="field"><input class="money" id="w" value="3,500,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">예상 퇴직금(세전)</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">퇴직금=1일 평균임금×30×(재직일수/365). 1년 미만은 지급 대상 아님. 퇴직소득세 별도.</p>';
    function calc(){var j=new Date(el.querySelector("#j").value),l=new Date(el.querySelector("#l").value),w=num(el.querySelector("#w").value),
      d=Math.floor((l-j)/864e5);if(isNaN(d)||d<=0){el.querySelector("#s").textContent="날짜 확인";return;}
      var da=w*3/91.3,pay=da*30*(d/365),ok=d>=365;
      el.querySelector("#r").innerHTML=(ok?won(pay):"0")+'<small>원</small>';
      el.querySelector("#s").textContent="재직 "+Math.floor(d/365)+"년 "+(d%365)+"일"+(ok?"":" · 1년 미만");}
    bindMoney(el);el.querySelectorAll("#j,#l").forEach(function(e){e.addEventListener("change",calc);});el.querySelector("#w")._cb=calc;calc();}});