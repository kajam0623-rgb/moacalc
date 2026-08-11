TOOLS.push({id:"caffeine",cat:"생활",icon:"",name:"카페인 계산기",desc:"하루 섭취량",render:function(el){
    el.innerHTML='<label>음료</label><select id="d"><option value="150">아메리카노(150mg)</option><option value="75">에스프레소 1샷(75mg)</option><option value="74">캔커피(74mg)</option><option value="100">에너지드링크(100mg)</option><option value="34">콜라(34mg)</option><option value="30">녹차(30mg)</option></select>'+
    '<label>잔 수</label><div class="field"><input class="money" id="n" value="3"><span class="suf">잔</span></div>'+
    '<div class="out"><div class="k">하루 카페인</div><div class="v" id="v">0<small>mg</small></div><div class="s" id="s"></div></div>'+
    '<p class="note">성인 권장 한도 하루 400mg, 임산부 200mg.</p>';
    function calc(){var d=+el.querySelector("#d").value,n=num(el.querySelector("#n").value),mg=d*n;
      el.querySelector("#v").innerHTML=mg+'<small>mg</small>';el.querySelector("#s").textContent=mg>400?"권장 한도(400mg) 초과":"권장 한도 이내";}
    bindMoney(el);el.querySelector("#n")._cb=calc;el.querySelector("#d").addEventListener("change",calc);calc();}});