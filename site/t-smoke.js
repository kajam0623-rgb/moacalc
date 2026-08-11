TOOLS.push({id:"smoke",cat:"생활",icon:"",name:"흡연 비용 계산기",desc:"하루 흡연→연·10년",render:function(el){
    el.innerHTML='<div class="r2"><div><label>하루 개비 수</label><input class="money" id="c" value="10"></div><div><label>한 갑 가격</label><input class="money" id="p" value="4,500"></div></div>'+
    '<div class="out"><div class="k">10년 흡연 비용</div><div class="v" id="v">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div><p class="note">한 갑 20개비 기준.</p>';
    function calc(){var c=num(el.querySelector("#c").value),p=num(el.querySelector("#p").value),day=c/20*p;
      el.querySelector("#v").innerHTML=won(day*3650)+'<small>원</small>';el.querySelector("#s").textContent="하루 "+won(day)+"원";
      el.querySelector("#rows").innerHTML='<div class="li"><span>월</span><b>'+won(day*30)+'원</b></div><div class="li"><span>1년</span><b>'+won(day*365)+'원</b></div>';}
    bindMoney(el);el.querySelectorAll("input.money").forEach(function(e){e._cb=calc;});calc();}});