TOOLS.push({id:"lotto",cat:"재미·운세",icon:"🍀",name:"로또 번호 생성기",desc:"행운의 6자리",render:function(el){
    el.innerHTML='<div class="out"><div class="k">이번 주 행운 번호</div><div class="chips" id="c" style="justify-content:center"></div></div>'+
    '<button id="b" style="margin-top:14px;width:100%;padding:14px;border:none;border-radius:12px;background:var(--accent);color:#fff;font:inherit;font-weight:800;font-size:16px;cursor:pointer">다시 뽑기</button>';
    function gen(){var s=new Set();while(s.size<6)s.add(Math.floor(Math.random()*45)+1);
      el.querySelector("#c").innerHTML=[...s].sort(function(a,b){return a-b;}).map(function(n){return '<span class="chip" style="min-width:42px;text-align:center">'+n+'</span>';}).join("");}
    el.querySelector("#b").addEventListener("click",gen);gen();}});