TOOLS.push({id:"freelance",cat:"급여·노동",icon:"🧑‍💻",name:"프리랜서 3.3%",desc:"원천징수·실수령",render:function(el){
    el.innerHTML='<label>계약금액(세전)</label><div class="field"><input class="money" id="a" value="3,000,000"><span class="suf">원</span></div>'+
    '<div class="out"><div class="k">실수령액</div><div class="v" id="r">0<small>원</small></div><div class="s" id="s"></div></div>'+
    '<div class="rows" id="rows"></div>'+
    '<p class="note">3.3% = 소득세 3% + 지방소득세 0.3%. 5월 종합소득세 신고 시 대부분 환급 발생.</p>';
    function calc(){var a=num(el.querySelector("#a").value),it=a*.03,lt=a*.003,net=a-it-lt;
      el.querySelector("#r").innerHTML=won(net)+'<small>원</small>';el.querySelector("#s").textContent="공제 "+won(it+lt)+"원 (3.3%)";
      el.querySelector("#rows").innerHTML='<div class="li neg"><span>소득세 3%</span><b>-'+won(it)+'원</b></div><div class="li neg"><span>지방소득세 0.3%</span><b>-'+won(lt)+'원</b></div>';}
    bindMoney(el);el.querySelector("#a")._cb=calc;calc();}});