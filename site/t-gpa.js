TOOLS.push({id:"gpa",cat:"생활",icon:"",name:"학점 계산기",desc:"평점(GPA)",render:function(el){
    el.innerHTML='<label>과목 (학점,평점 — 한 줄에 하나)</label><textarea id="t" style="min-height:110px">3,4.5\n3,4.0\n2,3.5\n3,4.5</textarea>'+
    '<div class="out"><div class="k">평점 평균(GPA)</div><div class="v" id="v">0</div><div class="s" id="s"></div></div>'+
    '<p class="note">예: 3학점 과목에서 4.5 → "3,4.5". 4.5 만점 기준.</p>';
    function calc(){var tc=0,tp=0;el.querySelector("#t").value.split(/\n/).forEach(function(r){var m=r.split(","),c=Number(m[0]),g=Number(m[1]);if(!isNaN(c)&&!isNaN(g)){tc+=c;tp+=c*g;}});
      el.querySelector("#v").textContent=tc?(tp/tc).toFixed(2):"0";el.querySelector("#s").textContent="총 "+tc+"학점";}
    el.querySelector("#t").addEventListener("input",calc);calc();}});