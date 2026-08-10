var num=function(s){return Number(String(s).replace(/[^0-9.]/g,""))||0;};
  var won=function(n){return Math.round(n).toLocaleString("ko-KR");};
  var comma=function(n){return num(n).toLocaleString("ko-KR");};
  function bindMoney(root){root.querySelectorAll("input.money").forEach(function(el){
    el.addEventListener("input",function(){var v=num(this.value);this.value=v?v.toLocaleString("ko-KR"):"";if(this._cb)this._cb();});});}

  // ---------- 만세력 엔진 (태양황경 기반: 절기·연/월/일/시주) ----------
  var SJ_S=["갑","을","병","정","무","기","경","신","임","계"],SJ_SH="甲乙丙丁戊己庚辛壬癸";
  var SJ_B=["자","축","인","묘","진","사","오","미","신","유","술","해"],SJ_BH="子丑寅卯辰巳午未申酉戌亥";
  var SJ_TTI=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  var ZO_EN=["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
  var ZO_TRAIT=["재치와 기민함으로 기회를 먼저 잡는 기질","묵묵히 쌓아 끝내 이루는 뚝심","두려움 없이 앞장서는 용기와 카리스마","섬세한 배려와 부드러운 지혜","큰 그림을 그리는 스케일과 존재감","깊이 통찰하고 조용히 움직이는 영민함","자유롭고 활동적인 추진력","온화한 감성과 예술적 감각","영리한 임기응변과 재주","분명한 기준과 성실한 자기관리","의리와 신의로 사람을 얻는 힘","넉넉한 인심과 복을 부르는 여유"];
  function zoCard(b,label){return '<div class="sj-char"><img width="520" height="520" src="img/char/zo-'+ZO_EN[b]+'.webp" alt="'+SJ_TTI[b]+'띠" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
    '<div class="cap"><div class="t">'+(label||"나의 띠")+'</div><div class="n">'+SJ_TTI[b]+'띠</div><p>'+ZO_TRAIT[b]+'</p></div></div>';}
  // ── 서양 점성술(태양 별자리) ──
  var ST_KO=["양자리","황소자리","쌍둥이자리","게자리","사자자리","처녀자리","천칭자리","전갈자리","궁수자리","염소자리","물병자리","물고기자리"];
  var ST_EN=["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  var ST_SYM=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  var ST_RANGE=["3.21~4.19","4.20~5.20","5.21~6.21","6.22~7.22","7.23~8.22","8.23~9.22","9.23~10.22","10.23~11.21","11.22~12.21","12.22~1.19","1.20~2.18","2.19~3.20"];
  var ST_ELE=["불","흙","공기","물"]; // 별자리 index%4
  var ST_RULER=["화성","금성","수성","달","태양","수성","금성","화성","목성","토성","토성","목성"]; // 전통 지배성
  var ST_TRAIT=["망설임 없이 먼저 뛰어드는 개척자. 속도가 곧 무기입니다.","한번 정하면 끝까지 지키는 뚝심. 감각과 실속을 함께 챙깁니다.","호기심과 언어 감각이 살아 있는 전달자. 사람과 정보가 늘 모입니다.","마음의 온도를 먼저 읽는 보호자. 내 사람에게는 한없이 깊습니다.","존재만으로 무대를 만드는 사람. 인정받을 때 가장 빛납니다.","작은 어긋남을 먼저 보는 정밀한 눈. 완성도가 곧 자존심입니다.","균형과 관계의 조율자. 아름다움과 공정함을 동시에 봅니다.","한 번 파고들면 끝을 보는 집중력. 겉과 속의 깊이가 다릅니다.","시야가 넓고 낙천적인 탐험가. 갇히는 순간 답답해집니다.","시간을 자기 편으로 만드는 전략가. 늦어도 결국 올라섭니다.","남과 다른 각도로 보는 혁신가. 규칙보다 이유를 묻습니다.","경계 없이 스며드는 공감력. 예술과 직관이 강점입니다."];
  var ST_ELE_RULERS={"불":["태양","화성","목성"],"흙":["금성","수성","토성"],"공기":["수성","금성","토성"],"물":["달","화성","목성"]};
  var WD_KO=["일","월","화","수","목","금","토"];
  var WD_RULER=["태양","달","화성","수성","목성","금성","토성"]; // 요일 지배성(칠요)
  function stOf(y,m,d){return Math.floor(sjSunLong(sjJdKST(y,m,d,12,0))/30);} // 태양황경으로 별자리 판정
  function stCard(i,label){return '<div class="sj-char"><img width="520" height="520" src="img/char/st-'+ST_EN[i]+'.webp" alt="'+ST_KO[i]+'" loading="lazy" onerror="this.closest(\'.sj-char\').remove()">'+
    '<div class="cap"><div class="t">'+(label||"나의 별자리")+'</div><div class="n">'+ST_SYM[i]+' '+ST_KO[i]+'</div><p>'+ST_TRAIT[i]+'</p></div></div>';}
  // 태양의 각도 관계(어스펙트) — 거리 0~6, [기본점수, 이름, 총운, 애정, 재물·일, 조언, [애정·재물·일·건강 보정]]
  var ST_ASP=[
   [88,"합(0°)","태양이 내 별자리 위를 지나는 시기입니다. 존재감이 커지고, 내가 먼저 움직일수록 일이 풀립니다.","먼저 다가가는 쪽이 유리합니다. 표현을 아끼면 기회가 지나갑니다.","새로 시작하는 일에 힘이 실립니다. 다만 혼자 다 하려다 지칠 수 있습니다.","올해의 방향을 다시 세우기 좋은 때입니다. 하고 싶은 것을 문장으로 적어두세요.",[6,2,4,-2]],
   [72,"세미섹스타일(30°)","크게 흔들리지 않는 잔잔한 흐름입니다. 무리하지 않으면 손해도 없습니다.","익숙한 사이에서 편안함을 느낍니다. 새 인연은 서두르지 마세요.","작은 정리와 마무리에 좋은 날입니다.","오늘은 확장보다 정돈입니다. 미뤄둔 일 하나만 끝내세요.",[0,2,4,2]],
   [84,"섹스타일(60°)","기회가 손 닿는 곳에 놓입니다. 다만 스스로 손을 뻗어야 잡히는 종류입니다.","소개·모임·연락에서 좋은 흐름이 옵니다.","제안·협업·부수입에 유리합니다. 연락을 미루지 마세요.","오늘 온 연락은 흘려보내지 마세요. 답장 하나가 흐름을 바꿉니다.",[8,6,6,0]],
   [58,"스퀘어(90°)","마찰이 있는 대신 성장이 있는 날입니다. 부딪히는 지점이 곧 내 약한 고리입니다.","말투 하나로 오해가 생기기 쉽습니다. 한 박자 늦게 답하세요.","일정이 밀리거나 예산이 어긋날 수 있습니다. 여유분을 두세요.","오늘의 짜증은 방향이 아니라 속도의 문제입니다. 잠시 멈추면 보입니다.",[-8,-6,-4,-6]],
   [90,"트라인(120°)","같은 원소끼리 흐르는 순풍입니다. 애쓰지 않아도 일이 매끄럽게 이어집니다.","자연스러운 만남과 화해에 좋습니다. 오래된 인연이 다시 닿습니다.","하던 일에서 결실이 보입니다. 큰 결정을 내리기에도 무난합니다.","순풍일수록 방심하기 쉽습니다. 오늘 얻은 것을 기록해두세요.",[8,6,8,4]],
   [62,"퀸컹스(150°)","서로 결이 다른 기운이 겹칩니다. 조정과 타협이 필요한 하루입니다.","상대의 방식이 낯설게 느껴집니다. 고치려 들지 마세요.","계획과 현실의 간격이 드러납니다. 일정부터 다시 짜세요.","오늘은 정답보다 조율입니다. 한 가지는 양보하세요.",[-4,0,-4,-6]],
   [66,"오포지션(180°)","태양이 정반대에 섭니다. 관계와 균형이 하루의 주제가 됩니다.","상대를 통해 나를 봅니다. 갈등이 있다면 오늘이 풀 기회입니다.","혼자보다 둘이 낫습니다. 계약·협상은 조건을 문서로 남기세요.","맞은편에 있는 사람이 오늘의 거울입니다. 반발보다 관찰을.",[4,2,2,0]]];
  var SJ_ES=[0,0,1,1,2,2,3,3,4,4]; // 천간 오행(목화토금수=01234)
  var SJ_EB=[4,2,0,0,2,1,1,2,3,3,2,4]; // 지지 오행
  var SJ_BMAIN=[9,5,0,1,4,2,3,5,6,7,4,8]; // 지지 본기 천간 idx
  var SJ_EL=["목","화","토","금","수"];
  // 오행별 전통 상징 — [행운색, 방위, 행운숫자]
  var SJ_LUCK=[["청록·초록","동쪽","3·8"],["빨강·자주","남쪽","2·7"],["노랑·베이지","중앙","5·10"],["흰색·은색","서쪽","4·9"],["검정·남색","북쪽","1·6"]];
  var SJ_HOUR=["23~01시","01~03시","03~05시","05~07시","07~09시","09~11시","11~13시","13~15시","15~17시","17~19시","19~21시","21~23시"];
  function sjYukhap(b){return (b===0)?1:(b===1)?0:13-b;} // 육합 짝 지지(자축·인해·묘술·진유·사신·오미)
  function sjJdn(y,m,d){var a=Math.floor((14-m)/12),Y=y+4800-a,M=m+12*a-3;
    return d+Math.floor((153*M+2)/5)+365*Y+Math.floor(Y/4)-Math.floor(Y/100)+Math.floor(Y/400)-32045;}
  function sjSunLong(jd){ // 태양 시황경(도) — Meeus 근사, 오차 <0.01°
    var T=(jd-2451545)/36525,L0=280.46646+36000.76983*T+0.0003032*T*T,
        M=(357.52911+35999.05029*T-0.0001537*T*T)*Math.PI/180,
        C=(1.914602-0.004817*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
    return ((L0+C)%360+360)%360;}
  function sjJdKST(y,mo,d,h,mi){return sjJdn(y,mo,d)-0.5+((h||0)+(mi||0)/60-9)/24;} // KST→UT 포함 JD
  function sjIpchun(y){ // y년 입춘(황경 315°) KST JD
    var lo=sjJdKST(y,2,2,0,0),hi=sjJdKST(y,2,7,0,0);
    for(var i=0;i<40;i++){var mid=(lo+hi)/2,L=sjSunLong(mid);
      (L>=315&&L<330)?hi=mid:lo=mid;}
    return (lo+hi)/2;}
  function sjPillars(y,mo,d,h,mi,tCorr){
    var jd=sjJdKST(y,mo,d,h,mi);
    var yy=(jd<sjIpchun(y))?y-1:y;
    var ys=((yy-4)%10+10)%10,yb=((yy-4)%12+12)%12;
    var L=sjSunLong(jd),mIdx=Math.floor((((L-315)%360)+360)%360/30); // 0=인월
    var ms=((ys%5)*2+2+mIdx)%10,mb=(mIdx+2)%12;
    var dayN=sjJdn(y,mo,d),di=(((dayN-2451545)+54)%60+60)%60,ds=di%10,db=di%12;
    var hp=null;
    if(h!=null&&h!==""){var t=(+h)*60+(+mi||0)-(tCorr?30:0),t2=((t%1440)+1440)%1440;
      var hIdx=Math.floor(((t2+60)%1440)/120);
      // 23시 이후 야자시: 일주는 당일 유지(만세력 표준), 시지=자
      hp={s:((ds%5)*2+hIdx)%10,b:hIdx};}
    return {y:{s:ys,b:yb},m:{s:ms,b:mb},d:{s:ds,b:db},h:hp,tti:SJ_TTI[yb]};}
  // 신강·신약 판정 (월령·득지 가중) → 억부용신 추출
  function sjStrength(p){
    var de=SJ_ES[p.d.s],sup=0,drain=0;
    function add(el,w){ // 나를 돕는 힘: 같은 오행(비겁) + 나를 생하는 오행(인성)
      if(el===de||(el+1)%5===de)sup+=w; else drain+=w;}
    add(SJ_EB[p.m.b],3);            // 월지 = 월령, 가장 큼
    add(SJ_EB[p.d.b],2);            // 일지 = 득지
    add(SJ_ES[p.m.s],1.5);
    add(SJ_ES[p.y.s],1); add(SJ_EB[p.y.b],1);
    if(p.h){add(SJ_ES[p.h.s],1); add(SJ_EB[p.h.b],1);}
    var tot=sup+drain,ratio=tot?sup/tot:0.5;
    var strong=ratio>=0.5;
    // 억부용신: 신강이면 덜어내는 오행(식상·재성·관성), 신약이면 돕는 오행(인성·비겁)
    var yong = strong ? (de+1)%5 : (de+4)%5;   // 신강→식상(내가 생하는) / 신약→인성(나를 생하는)
    var yong2= strong ? (de+2)%5 : de;          // 보조: 신강→재성 / 신약→비겁
    return {strong:strong,ratio:ratio,yong:yong,yong2:yong2,de:de};
  }
  var SJ_YONG={
   목:{color:"초록·청색",dir:"동쪽",season:"봄",job:"교육·기획·의료·목재·출판 등 자라나게 하는 일",act:"새로운 것을 배우고 시작하는 활동"},
   화:{color:"빨강·주황",dir:"남쪽",season:"여름",job:"방송·디자인·요식·에너지·마케팅 등 드러내는 일",act:"사람 앞에 나서고 표현하는 활동"},
   토:{color:"노랑·갈색",dir:"중앙",season:"환절기",job:"부동산·건축·중개·관리·농업 등 중심을 잡는 일",act:"신뢰를 쌓고 관계를 중재하는 활동"},
   금:{color:"흰색·금색",dir:"서쪽",season:"가을",job:"금융·법률·기계·의료기기·군경 등 정리하는 일",act:"규칙을 세우고 결단하는 활동"},
   수:{color:"검정·남색",dir:"북쪽",season:"겨울",job:"연구·유통·무역·수산·IT 등 흐르게 하는 일",act:"정보를 모으고 유연하게 움직이는 활동"}};
  // 십이운성 — 일간이 각 지지에서 갖는 기운의 단계 (양간 순행 / 음간 역행)
  var SJ_UN=["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
  var SJ_UN_DESC={
   "장생":"갓 태어난 기운으로 순수하고 성장 가능성이 큽니다. 사람들의 도움을 자연스럽게 받습니다.",
   "목욕":"멋을 부리고 감정이 풍부한 자리입니다. 매력이 있지만 마음이 흔들리기도 쉽습니다.",
   "관대":"사회에 나서는 청년의 기운입니다. 자신감과 의욕이 넘치나 다소 성급할 수 있습니다.",
   "건록":"스스로 벌어 자립하는 가장 단단한 자리입니다. 실속이 있고 책임감이 강합니다.",
   "제왕":"기운이 가장 왕성한 정점입니다. 주도력이 뛰어나지만 고집으로 흐르지 않게 조절이 필요합니다.",
   "쇠":"정점을 지나 안정으로 접어든 자리입니다. 무리하지 않고 내실을 다지는 데 강합니다.",
   "병":"기운이 약해지며 예민해지는 자리입니다. 감수성과 배려심이 깊어 사람을 잘 살핍니다.",
   "사":"활동보다 사색이 깊어지는 자리입니다. 연구·기획처럼 안으로 파고드는 일에 어울립니다.",
   "묘":"거두어 저장하는 자리입니다. 모으고 지키는 힘이 있어 관리와 축적에 강합니다.",
   "절":"끊어졌다 다시 이어지는 자리입니다. 변화가 많지만 새 출발의 기운도 함께 있습니다.",
   "태":"새 생명이 잉태되는 자리입니다. 아이디어와 가능성이 씨앗처럼 자리 잡습니다.",
   "양":"태어나기 전 길러지는 자리입니다. 보호받으며 준비하는 시기로 온화한 기질을 줍니다."};
  var SJ_JS=[11,6,2,9,2,9,5,0,8,3]; // 천간별 장생 지지
  function sjUnseong(s,b){var js=SJ_JS[s];return SJ_UN[(s%2===0)?((b-js+12)%12):((js-b+12)%12)];}
  // 신살 — 룩업 테이블 (일간·삼합 기준)
  var SJ_CHEONEUL={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],8:[5,3],9:[5,3],7:[6,2]};
  var SJ_MUNCHANG=[5,6,8,9,8,9,11,0,2,3];
  var SJ_YANGIN={0:3,2:6,4:6,6:9,8:0};
  function sjSamhap(b){return b%4;} // 0:신자진 1:사유축 2:인오술 3:해묘미 (지지 index%4 그룹)
  var SJ_DOHWA={2:3,0:9,1:6,3:0},SJ_YEOKMA={2:8,0:2,1:11,3:5},SJ_HWAGAE={2:10,0:4,1:1,3:7};
  var SJ_BAEKHO=["갑진","을미","병술","정축","무진","임술","계축"],SJ_GWAEGANG=["경진","경술","임진","무술"];
  var SJ_SINSAL_DESC={
   "천을귀인":"사주에서 가장 좋은 길신입니다. 어려울 때 도와주는 사람이 나타나고, 큰 위기를 넘기게 하는 힘이 있습니다.",
   "문창귀인":"학문과 글재주의 별입니다. 공부·시험·글쓰기·기획 등 머리를 쓰는 일에서 두각을 나타냅니다.",
   "도화살":"매력과 인기의 별입니다. 사람을 끄는 힘이 강해 예술·연예·서비스·영업 분야에서 강점이 됩니다.",
   "역마살":"이동과 변화의 별입니다. 해외·출장·이사·유통처럼 움직이는 일에서 기회가 열립니다.",
   "화개살":"고독과 예술의 별입니다. 혼자 깊이 파고드는 힘이 있어 연구·종교·예술·전문직에 어울립니다.",
   "양인살":"강한 칼의 기운입니다. 결단력과 추진력이 뛰어나지만 과하면 다툼이 되니 조절이 필요합니다.",
   "백호대살":"강렬한 기운의 별입니다. 승부처에서 힘을 발휘하나 건강과 안전을 특히 챙겨야 합니다.",
   "괴강살":"우두머리의 기운입니다. 카리스마와 리더십이 강하며 극단으로 흐르기 쉬운 면도 있습니다."};
  function sjSinsal(p){
    var ds=p.d.s,found=[],bs=[p.y.b,p.m.b,p.d.b];if(p.h)bs.push(p.h.b);
    var ce=SJ_CHEONEUL[ds]||[];if(bs.some(function(b){return ce.indexOf(b)>=0;}))found.push("천을귀인");
    if(bs.indexOf(SJ_MUNCHANG[ds])>=0)found.push("문창귀인");
    var base=sjSamhap(p.y.b),base2=sjSamhap(p.d.b);
    if(bs.indexOf(SJ_DOHWA[base])>=0||bs.indexOf(SJ_DOHWA[base2])>=0)found.push("도화살");
    if(bs.indexOf(SJ_YEOKMA[base])>=0||bs.indexOf(SJ_YEOKMA[base2])>=0)found.push("역마살");
    if(bs.indexOf(SJ_HWAGAE[base])>=0||bs.indexOf(SJ_HWAGAE[base2])>=0)found.push("화개살");
    if(SJ_YANGIN[ds]!==undefined&&bs.indexOf(SJ_YANGIN[ds])>=0)found.push("양인살");
    var dj=SJ_S[p.d.s]+SJ_B[p.d.b];
    if(SJ_BAEKHO.indexOf(dj)>=0)found.push("백호대살");
    if(SJ_GWAEGANG.indexOf(dj)>=0)found.push("괴강살");
    return found;
  }
  // 격국 — 월지 본기의 십성으로 판정
  var SJ_GYEOK={"비견":"건록격","겁재":"양인격","식신":"식신격","상관":"상관격","편재":"편재격","정재":"정재격","편관":"편관격","정관":"정관격","편인":"편인격","정인":"정인격"};
  var SJ_GYEOK_DESC={
   "건록격":"스스로 벌어 스스로 서는 자수성가형입니다. 남에게 기대기보다 내 힘으로 기반을 만드는 구조라 독립·전문직·자기 사업이 잘 맞습니다.",
   "양인격":"강한 추진력과 승부 기질을 타고났습니다. 극한의 상황에서 오히려 힘을 내지만, 평상시엔 그 기운을 운동이나 전문 기술로 풀어야 합니다.",
   "식신격":"먹을 복과 표현력의 구조입니다. 만들고 창작하고 가르치는 일에서 결실이 나며 성격도 여유로운 편입니다.",
   "상관격":"재능이 밖으로 뻗는 구조입니다. 기존 틀을 깨는 아이디어가 강점이나, 조직의 규율과는 부딪히기 쉬워 자율성이 있는 환경이 좋습니다.",
   "편재격":"큰 판을 보는 사업가형 구조입니다. 돈의 흐름을 읽는 감각이 뛰어나며, 유통·영업·투자처럼 규모가 움직이는 분야에 어울립니다.",
   "정재격":"성실하게 쌓아 올리는 구조입니다. 정해진 수입을 꾸준히 관리해 자산을 만드는 데 강하며 신용이 곧 재산이 됩니다.",
   "편관격":"압박을 이겨내며 성장하는 구조입니다. 경쟁이 치열한 분야, 위기 관리가 필요한 자리에서 능력이 드러납니다.",
   "정관격":"질서와 명예를 중시하는 구조입니다. 원칙대로 일할 때 인정받으며 공직·대기업·전문 자격 분야가 잘 맞습니다.",
   "편인격":"독특한 관점과 직관의 구조입니다. 남들이 안 보는 것을 보며, 전문 연구·기술·예술 등 깊이 파는 분야에서 빛납니다.",
   "정인격":"배우고 품는 구조입니다. 학문·교육·상담처럼 지식을 쌓아 나누는 일에서 인정받고 귀인의 도움도 따릅니다."};
  function sjTenGod(dayS,otherS){ // 십성
    var de=SJ_ES[dayS],oe=SJ_ES[otherS],same=(dayS%2)===(otherS%2);
    if(de===oe)return same?"비견":"겁재";
    if((de+1)%5===oe)return same?"식신":"상관";
    if((de+2)%5===oe)return same?"편재":"정재";
    if((oe+2)%5===de)return same?"편관":"정관";
    return same?"편인":"정인";}
  // ---------- shared: 소득세(간이 연 결정세액 근사) ----------
  function earnedDed(g){if(g<=5e6)return g*0.7;if(g<=15e6)return 3.5e6+(g-5e6)*0.4;if(g<=45e6)return 7.5e6+(g-15e6)*0.15;if(g<=1e8)return 12e6+(g-45e6)*0.05;return 14.75e6+(g-1e8)*0.02;}
  function progressive(b){if(b<=14e6)return b*0.06;if(b<=50e6)return .84e6+(b-14e6)*.15;if(b<=88e6)return 6.24e6+(b-50e6)*.24;if(b<=15e7)return 15.36e6+(b-88e6)*.35;if(b<=3e8)return 37.06e6+(b-15e7)*.38;if(b<=5e8)return 94.06e6+(b-3e8)*.4;if(b<=1e9)return 174.06e6+(b-5e8)*.42;return 384.06e6+(b-1e9)*.45;}
  function incomeTaxMonthly(taxableMonthly,family,np,hi,ltc,ei){
    var g=taxableMonthly*12,earned=g-earnedDed(g),base=Math.max(earned-np*12-(hi+ltc+ei)*12-family*15e5,0);
    var c=progressive(base),cr=c<=13e5?c*.55:715000+(c-13e5)*.3,lim=g<=33e6?74e4:g<=7e7?66e4:g<=12e7?5e5:2e5;
    return Math.max(c-Math.min(cr,lim),0)/12;}
  function escH(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function loadPrefs(){try{return JSON.parse(localStorage.getItem("dnbs")||"{}");}catch(e){return {};}}
  function savePrefs(p){try{var c=loadPrefs();for(var k in p)c[k]=p[k];localStorage.setItem("dnbs",JSON.stringify(c));}catch(e){}}
  function track(ev,p){try{if(typeof gtag==="function")gtag("event",ev,p||{});}catch(e){}}
  if(typeof window!=="undefined")window.addEventListener("error",function(e){track("js_error",{m:String(e.message||"").slice(0,100)});});
  function rateBar(n,v){var c=v>=80?"var(--fun)":v>=65?"var(--accent)":"var(--deduct)";
    return '<div class="sj-bar"><span class="n">'+n+'</span><span class="t" role="meter" aria-valuenow="'+v+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+n+' '+v+'점"><i style="width:'+v+'%;background:'+c+'"></i></span><span class="c">'+v+'</span></div>';}
  function shareBtn(){return '<button type="button" class="share-btn">결과 공유하기</button>';}
  function bindShare(el,title,text){var b=el.querySelector(".share-btn");if(!b)return;
    b.addEventListener("click",function(){
      track("share_click",{tool:location.pathname});
      var d={title:title,text:text,url:location.href.split("#")[0].split("?")[0]};
      if(navigator.share){navigator.share(d).catch(function(){});}
      else if(navigator.clipboard){navigator.clipboard.writeText(d.text+" "+d.url).then(function(){
        b.textContent="복사됨! 카톡에 붙여넣으세요";setTimeout(function(){b.textContent="결과 공유하기";},2200);});}});}

  // ---------- TOOLS ----------
  
var TOOLS=[];
window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(t)t.render(document.getElementById(elId));};