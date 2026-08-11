TOOLS.push({id:"fire",cat:"금융",icon:"",name:"FIRE 은퇴 계산기",desc:"경제적 자유까지",render:function(el){
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
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(x){x._cb=calc;});calc();}});