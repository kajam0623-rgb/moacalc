TOOLS.push({id:"draw",cat:"재미·운세",icon:"🎲",name:"랜덤 뽑기",desc:"추첨·순서 정하기",render:function(el){
    el.innerHTML='<label>후보(줄바꿈 또는 쉼표로 구분)</label><textarea id="t" style="min-height:100px">철수\n영희\n민수\n지영</textarea>'+
    '<div class="r2" style="margin-top:12px"><div><label>몇 명 뽑기</label><input class="money" id="n" value="1"></div><div style="display:flex;align-items:flex-end"><button id="b" style="width:100%;padding:13px;border:none;border-radius:11px;background:var(--accent);color:#fff;font:inherit;font-weight:800;cursor:pointer">뽑기</button></div></div>'+
    '<div class="out" id="o" style="display:none"><div class="k">당첨</div><div class="v" id="v" style="font-size:26px"></div></div>';
    function draw(){var arr=el.querySelector("#t").value.split(/[\n,]/).map(function(s){return s.trim();}).filter(Boolean);
      var n=Math.min(num(el.querySelector("#n").value)||1,arr.length);for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
      el.querySelector("#o").style.display="block";el.querySelector("#v").textContent=arr.slice(0,n).join(", ");}
    el.querySelector("#b").addEventListener("click",draw);}});