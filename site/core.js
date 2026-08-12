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
  // 일간 정체성 1줄 압축판 — 오늘의 운세 첫 화면용 (saju ILGAN 장문과 별개)
  var SJ_ILGAN_ID=[
   "甲(갑) — 하늘로 곧게 크는 큰 나무.",
   "乙(을) — 바위를 감아 오르는 덩굴의 유연함.",
   "丙(병) — 숨김없이 내리쬐는 태양.",
   "丁(정) — 어둠을 밝히는 촛불의 온기.",
   "戊(무) — 흔들리지 않는 큰 산의 흙.",
   "己(기) — 곡식을 기르는 밭의 흙.",
   "庚(경) — 벼려서 날을 세우는 무쇠.",
   "辛(신) — 다듬어 빛나는 보석의 금.",
   "壬(임) — 바다처럼 깊고 넓게 흐르는 물.",
   "癸(계) — 스며들어 적시는 빗물과 이슬."];
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
   "장생":"갓 태어난 기운일세. 순수하고 자랄 여지가 크며, 사람들 도움을 자연스럽게 받는 자리야.",
   "목욕":"멋을 부리고 감정이 풍부한 자리일세. 매력은 있으나 마음이 잘 흔들리기도 하네.",
   "관대":"세상에 갓 나선 청년의 기운이야. 자신감과 의욕이 넘치되 다소 성급하네.",
   "건록":"스스로 벌어 스스로 서는, 열둘 중 가장 단단한 축에 드는 자리일세. 실속 있고 책임감이 서네.",
   "제왕":"기운이 가장 왕성한 정점이야. 주도력이 뛰어난 만큼 고집으로 흐르지 않게 조절해야 하네.",
   "쇠":"정점을 지나 안정으로 접어든 자리일세. 무리하지 않고 안을 다지는 데 강해.",
   "병":"기운이 여려지며 예민해지는 자리야. 대신 감수성과 배려가 깊어 사람을 잘 살피네.",
   "사":"활동보다 생각이 깊어지는 자리일세. 연구·기획처럼 안으로 파고드는 일에 어울려.",
   "묘":"거두어 갈무리하는 자리야. 모으고 지키는 힘이 있어 관리와 축적에 강하네.",
   "절":"끊어졌다 다시 이어지는 자리일세. 변화가 잦지만 새 출발의 기운도 같이 들어 있어.",
   "태":"새 생명이 잉태되는 자리야. 아이디어와 가능성이 씨앗처럼 자리를 잡네.",
   "양":"태어나기 전 길러지는 자리일세. 보호받으며 준비하는 시기라 기질이 온화해지네."};
  // 개념 삽화 파일명 매핑 — 한글 개념명을 이미지 파일명으로 연결한다
  var ART_UN={"장생":"un-jangsaeng","목욕":"un-mogyok","관대":"un-gwandae","건록":"un-geollok","제왕":"un-jewang","쇠":"un-soe","병":"un-byeong","사":"un-sa","묘":"un-myo","절":"un-jeol","태":"un-tae","양":"un-yang"};
  var ART_SINSAL={"천을귀인":"sinsal-cheoneul","문창귀인":"sinsal-munchang","도화살":"sinsal-dohwa","역마살":"sinsal-yeokma","화개살":"sinsal-hwagae","양인살":"sinsal-yangin","백호대살":"sinsal-baekho","괴강살":"sinsal-gwaegang"};
  var ART_GYEOK={"건록격":"gyeok-geollok","양인격":"gyeok-yangin","식신격":"gyeok-siksin","상관격":"gyeok-sanggwan","편재격":"gyeok-pyeonjae","정재격":"gyeok-jeongjae","편관격":"gyeok-pyeongwan","정관격":"gyeok-jeonggwan","편인격":"gyeok-pyeonin","정인격":"gyeok-jeongin"};
  var ART_ILGAN=["ilgan-gap","ilgan-eul","ilgan-byeong","ilgan-jeong","ilgan-mu","ilgan-gi","ilgan-gyeong","ilgan-sin","ilgan-im","ilgan-gye"];
  // 개념 삽화 한 장. 파일이 없으면 스스로 사라져 레이아웃이 깨지지 않는다
  function conceptArt(file,alt){
    if(!file)return "";
    return '<img class="sj-art" width="520" height="520" src="img/char/'+file+'.webp" alt="'+escH(alt||"")+'" loading="lazy" onerror="this.remove()">';}
  // 십이운성 무드 — 하루의 '온도'를 총운에 접합 (오늘의 운세 총운 조립용, SJ_UN_DESC와 별개)
  var UN_MOOD={
   "장생":"몸이 가볍게 열리는 날이라 새로 시작하는 일에 힘이 붙네.",
   "목욕":"감정이 풍부해져 매력은 사는데, 기분 따라 정하면 흔들리기 쉬운 날일세.",
   "관대":"의욕이 차오르는 날이야. 자신감은 좋으나 서두르면 마무리가 거칠어지네.",
   "건록":"발밑이 단단한 날일세. 손에 쥔 것부터 끝내면 하루가 알차게 쌓여.",
   "제왕":"기운이 정점이라 밀어붙이는 힘은 좋은데 과속만 조심하게.",
   "쇠":"속도를 줄이고 안을 다지기 좋은 날이야. 벌이기보다 정리가 어울리네.",
   "병":"감수성이 깊어지는 날일세. 몸의 신호에 예민해지니 컨디션부터 챙기게.",
   "사":"생각이 안으로 파고드는 날이라 혼자 붙잡는 일에서 성과가 나네.",
   "묘":"거두고 갈무리하는 날일세. 새 판 벌이기보다 모아둔 걸 지키게.",
   "절":"흐름이 한 번 끊겼다 다시 이어지는 날이야. 변화가 와도 새 출발 신호로 읽게.",
   "태":"생각이 씨앗처럼 맺히는 날일세. 바로 실행보다 적어두기 좋아.",
   "양":"보호받으며 준비하는 날이야. 서두르지 말고 힘을 기르는 데 쓰게."};
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
   "천을귀인":"사주에서 가장 좋은 길신일세. 어려울 때 사람이 나타나 큰 고비를 넘기게 해주는 힘이 있어.",
   "문창귀인":"학문과 글재주의 별이야. 공부든 시험이든 글이든 기획이든, 머리 쓰는 자리에서 두각이 나네.",
   "도화살":"매력과 인기의 별일세. 사람을 끄는 힘이 강해 예술·연예·서비스·영업 쪽에서 강점이 되네.",
   "역마살":"이동과 변화의 별이야. 해외든 출장이든 이사든 유통이든, 움직이는 일에서 기회가 열리네.",
   "화개살":"고독과 예술의 별일세. 혼자 깊이 파고드는 힘이 있어 연구·종교·예술·전문직에 어울려.",
   "양인살":"강한 칼의 기운이야. 결단력과 추진력이 뛰어나되 과하면 다툼이 되니 벼려서 써야 하네.",
   "백호대살":"강렬한 기운의 별일세. 승부처에서 힘을 내지만 건강과 안전만은 각별히 챙겨야 하네.",
   "괴강살":"우두머리의 기운이야. 카리스마와 리더십이 강하며, 그만큼 극단으로 흐르기도 쉽네."};
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
   "건록격":"스스로 벌어 스스로 서는 자수성가의 구조일세. 남에게 기대기보다 제 힘으로 기반을 만드는 짜임이라 독립·전문직·자기 사업이 잘 맞네.",
   "양인격":"강한 추진력과 승부 기질을 타고났네. 극한에서 오히려 힘을 내는 구조라, 평소엔 그 기운을 운동이나 전문 기술로 풀어줘야 하네.",
   "식신격":"먹을 복과 표현력의 구조야. 만들고 창작하고 가르치는 일에서 결실이 나고 성격도 여유로운 편일세.",
   "상관격":"재능이 밖으로 뻗는 구조일세. 틀을 깨는 발상이 강점이나 조직의 규율과는 부딪히기 쉬우니 자율이 있는 자리가 좋네.",
   "편재격":"큰 판을 보는 사업가의 구조야. 돈의 흐름을 읽는 감이 뛰어나 유통·영업·투자처럼 규모가 움직이는 데가 어울리네.",
   "정재격":"성실하게 쌓아 올리는 구조일세. 정해진 수입을 꾸준히 굴려 자산을 만드는 데 강하고, 신용이 곧 재산이 되네.",
   "편관격":"압박을 이겨내며 크는 구조야. 경쟁이 치열한 자리, 위기를 관리해야 하는 자리에서 능력이 드러나네.",
   "정관격":"질서와 명예를 중히 여기는 구조일세. 원칙대로 갈 때 인정받으니 공직·대기업·전문 자격 쪽이 잘 맞네.",
   "편인격":"독특한 관점과 직관의 구조야. 남들이 안 보는 걸 보니 전문 연구·기술·예술처럼 깊이 파는 데서 빛나네.",
   "정인격":"배우고 품는 구조일세. 학문·교육·상담처럼 지식을 쌓아 나누는 일에서 인정받고 귀인의 도움도 따르네."};
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
  // 한글 조사 자동 선택 — 앞 글자의 받침 유무로 고른다. josa("불","와/과")="과"
  function josa(w,pair){
    var p=pair.split("/"),c=String(w).charCodeAt(String(w).length-1);
    var hasJong=(c>=0xAC00&&c<=0xD7A3)&&((c-0xAC00)%28!==0);
    return hasJong?p[1]:p[0];}
  function loadPrefs(){try{return JSON.parse(localStorage.getItem("dnbs")||"{}");}catch(e){return {};}}
  function savePrefs(p){try{var c=loadPrefs();for(var k in p)c[k]=p[k];localStorage.setItem("dnbs",JSON.stringify(c));}catch(e){}}
  function track(ev,p){try{if(typeof gtag==="function")gtag("event",ev,p||{});}catch(e){}}
  // P2-4 최소 에러 모니터링 — 외부 서비스 없이 GA4 이벤트로만 수집
  if(typeof window!=="undefined"){
    window.addEventListener("error",function(e){
      track("js_error",{m:String(e.message||"").slice(0,100),f:String(e.filename||"").split("/").pop()});});
    window.addEventListener("unhandledrejection",function(e){
      track("js_error",{m:("promise: "+(e.reason&&e.reason.message||e.reason||"")).slice(0,100)});});}
  if(typeof window!=="undefined")window.addEventListener("error",function(e){track("js_error",{m:String(e.message||"").slice(0,100)});});
  function rateBar(n,v){var c=v>=80?"var(--fun)":v>=65?"var(--accent)":"var(--deduct)";
    return '<div class="sj-bar"><span class="n">'+n+'</span><span class="t" role="meter" aria-valuenow="'+v+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+n+' '+v+'점"><i style="width:'+v+'%;background:'+c+'"></i></span><span class="c">'+v+'</span></div>';}
  // ---------- 물어보기 게이트 ----------
  // 입력만 바꿔도 결과가 즉시 나오면 '물어본다'는 감각이 사라진다.
  // 답은 버튼을 눌러야 나오고, 나오기 직전에 보살이 짚어 보는 시간을 둔다.
  var ASK_LABEL="동네보살에게 물어보기";
  function askWait(msg){
    return '<div class="ask-wait"><div class="ic">🔮</div><div class="t">'+(msg||"아직 안 물어봤네.")+'</div>'+
      '<div class="d">생년월일을 맞춘 뒤 위 버튼을 누르게.<br>같은 날 같은 생일이면 몇 번을 눌러도 같은 답이 나오네.</div></div>';}
  var ASK_GANJI="甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";
  // 버튼을 누른 뒤 결과까지 약 1초. 릴이 돌고 짚는 순서가 한 줄씩 지나간다.
  function askThink(out,btn,steps,done){
    var reel="";for(var i=0;i<14;i++)reel+=ASK_GANJI.charAt(Math.floor(Math.random()*ASK_GANJI.length));
    out.innerHTML='<div class="ask-think"><div class="ask-reel"><i>'+reel.split("").join("<br>")+'</i></div>'+
      '<div class="ask-step"></div><div class="ask-dots">'+steps.map(function(){return "<span></span>";}).join("")+'</div></div>';
    var stepEl=out.querySelector(".ask-step"),dots=out.querySelectorAll(".ask-dots span");
    var was=btn?btn.textContent:"",n=0;
    if(btn){btn.disabled=true;btn.textContent="보살이 짚어 보는 중…";}
    (function tick(){
      if(n<steps.length){
        stepEl.textContent=steps[n];
        if(dots[n])dots[n].classList.add("on");
        n++;setTimeout(tick,340);return;}
      if(btn){btn.disabled=false;btn.textContent=was;}
      done();
    })();}
  // 결과 섹션을 위에서부터 차례로 띄운다. 지연은 12번째 이후로는 늘리지 않는다.
  // 애니메이션이 끝나면 클래스를 걷어낸다. 백그라운드 탭처럼 애니메이션이
  // 아예 돌지 않는 상황에서 opacity:0인 채로 남는 것을 막는다.
  function reveal(out){
    var kids=Array.prototype.slice.call(out.children),i,d;
    for(i=0;i<kids.length;i++){
      d=Math.min(i,12)*55;
      kids[i].classList.add("rv");
      kids[i].style.animationDelay=d+"ms";}
    setTimeout(function(){
      kids.forEach(function(k){k.classList.remove("rv");k.style.animationDelay="";});},1300);}
  // 점수는 0에서 올라간다. 숫자가 멈추는 순간이 이 도구의 결과 발표다.
  function countUp(node,to,ms){
    if(!node)return;var t0=null,dur=ms||620;
    // 백그라운드 탭에서는 rAF가 멈춘다. 최종값을 먼저 써 두어야 점수 자리가 비지 않는다
    node.textContent=to;
    if(typeof requestAnimationFrame!=="function")return;
    function f(ts){
      if(t0===null)t0=ts;
      var p=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-p,3);
      node.textContent=Math.round(to*e);
      if(p<1)requestAnimationFrame(f);else node.textContent=to;}
    requestAnimationFrame(f);}
  // 막대도 0에서 채운다. 목표 폭은 인라인 style에 이미 들어 있으므로 잠깐 0으로 눌렀다 되돌린다.
  // rAF는 백그라운드 탭에서 멈춘다. 되돌리는 쪽은 타이머로 걸어야 막대가 0에 머물지 않는다
  function fillBars(out){
    var bars=out.querySelectorAll(".sj-bar .t i");
    Array.prototype.forEach.call(bars,function(b,i){
      var w=b.style.width;b.style.width="0";b.style.transition="width .7s cubic-bezier(.2,.8,.2,1) "+(i*90+120)+"ms";
      setTimeout(function(){b.style.width=w;},20);});}
  // 결과 카드에 등급 뱃지를 달고, 대길일 때만 한 번 번쩍인다.
  // 점수가 없는 도구(사주 명식)는 뱃지·번쩍임 없이 넘어간다.
  function gradeFx(out,score,grade){
    var card=out.querySelector(".out");if(!card)return;
    if(grade){var s=card.querySelector(".s");
      // 앞에 공백을 둔다. 없으면 스크린리더·복사 텍스트에서 "…의 날길"로 붙어 읽힌다
      if(s)s.insertAdjacentHTML("beforeend",' <span class="grade-tag g-'+grade+'">'+grade+'</span>');}
    if(typeof score!=="number"||!isFinite(score))return;
    var v=card.querySelector(".v");
    if(v){var small=v.querySelector("small"),txt=document.createElement("span");
      v.insertBefore(txt,v.firstChild);
      // 숫자만 0에서 올린다. 뒤에 붙는 "점 · 등급" 표기는 그대로 둔다
      Array.prototype.slice.call(v.childNodes).forEach(function(n){
        if(n!==txt&&n!==small&&n.nodeType===3)n.textContent="";});
      countUp(txt,score);}
    if(score>=85)card.classList.add("hit");}
  // ---------- 연속 확인 스트릭 ----------
  // 어제 봤으면 +1, 오늘 이미 봤으면 그대로, 끊겼으면 1부터 다시.
  function bumpStreak(){
    var p=loadPrefs(),today=new Date(),key=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    if(p.stDay===key)return {n:p.stN||1,fresh:false};
    var y=new Date(today.getFullYear(),today.getMonth(),today.getDate()-1);
    var yKey=y.getFullYear()+"-"+(y.getMonth()+1)+"-"+y.getDate();
    var n=(p.stDay===yKey)?(p.stN||1)+1:1;
    savePrefs({stDay:key,stN:n});
    return {n:n,fresh:true};}
  function streakHtml(s){
    var cal="";for(var i=0;i<7;i++)cal+='<i class="'+(i<Math.min(s.n,7)?"on":"")+'"></i>';
    var msg=s.n<=1?"오늘부터 세어 보겠네. 내일도 오게.":
      s.n<7?"자네, <b>"+s.n+"일</b> 연속으로 물어보러 왔군.":
      "<b>"+s.n+"일</b> 연속일세. 이쯤이면 습관이야.";
    return '<div class="streak"><span>🔥</span><span>'+msg+'</span><span class="cal">'+cal+'</span></div>';}
  // ---------- 오늘의 부적 ----------
  // 하루 한 번만 열린다. 같은 날 다시 눌러도 같은 문장이 나오도록 날짜+점수로 뽑는다.
  var BUJEOK=[
   ["막힌 문 앞에서 돌아서지 말 것","오늘 한 번 더 두드리면 열리는 문이 있네. 두 번은 말고 한 번만 더 하게."],
   ["작게 시작한 것을 끝까지","크게 벌인 것보다 작게 끝낸 것이 오늘 자네를 살리네."],
   ["말보다 한 박자 늦게","오늘 참은 한마디가 이번 주를 조용하게 만드네."],
   ["먼저 연락하는 쪽이 이긴다","자존심은 내일도 쓸 수 있네. 오늘은 관계를 먼저 놓게."],
   ["지갑은 닫고 귀는 열고","오늘 들어온 이야기는 값이 나가고, 오늘 나간 돈은 값이 없네."],
   ["몸이 먼저 보낸 신호를 믿게","오늘 피곤한 건 게을러서가 아닐세. 일찍 눕게."],
   ["아는 사람에게 물을 것","혼자 사흘 걸릴 일이 오늘은 한 통이면 풀리네."],
   ["오늘 적어둔 것이 내일의 증거","머리에만 두지 말고 날짜 찍히는 곳에 남기게."]];
  function bujeokHtml(score,grade){
    var p=loadPrefs(),now=new Date(),key=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    var idx=(now.getDate()+now.getMonth()*31+score)%BUJEOK.length,b=BUJEOK[idx];
    var first=(p.bjDay!==key);
    if(first)savePrefs({bjDay:key});
    return '<div class="bujeok"><div class="k">오늘의 부적 · '+(grade||"")+'</div>'+
      '<div class="w">'+b[0]+'</div><div class="m">'+b[1]+'</div>'+
      '<div class="m" style="margin-top:12px;opacity:.6">'+(first?"오늘 몫은 이걸로 다 썼네. 내일 새로 한 장 나오네.":"오늘은 이미 받아 갔네. 부적은 하루 한 장일세.")+'</div></div>';}
  // 결과 렌더 후 한 번에 거는 마무리 연출. o={score,grade,streak,bujeok}
  function askFx(el,o){
    var out=el.querySelector("#out");if(!out)return;o=o||{};
    if(o.streak)out.insertAdjacentHTML("afterbegin",streakHtml(bumpStreak()));
    if(o.bujeok){
      // 공유 버튼 '앞'에 넣는다. parentNode 기준으로 넣으면 #out 밖으로 빠져나간다
      var sb=out.querySelector(".share-btn");
      if(sb)sb.insertAdjacentHTML("beforebegin",bujeokHtml(o.score,o.grade));
      else out.insertAdjacentHTML("beforeend",bujeokHtml(o.score,o.grade));}
    gradeFx(out,o.score,o.grade);reveal(out);fillBars(out);
    var top=out.querySelector(".out");
    if(top&&top.scrollIntoView)try{top.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}}
  // 물어보기 배선 — 초기엔 대기 화면, 버튼을 눌러야 짚어 보고 답이 나온다
  function askWire(el,go,steps,waitMsg){
    var btn=el.querySelector("#go"),out=el.querySelector("#out");
    if(out)out.innerHTML=askWait(waitMsg);
    if(btn)btn.addEventListener("click",function(){askThink(out,btn,steps,go);});}
  // 생년월일 다이얼. 기존 input[type=date]를 감춘 채 값만 갱신하므로 각 도구의 계산 로직은 그대로다.
  // sel = 감출 input의 선택자, 돌릴 때마다 그 날짜의 일진 간지를 보여준다.
  function birthDial(el,sel,onChange){
    if(typeof document==="undefined")return null;
    var inp=el.querySelector(sel);if(!inp)return null;
    var host=inp.parentNode;if(!host)return null; // 검증 하네스의 mock DOM 대비
    var base=(inp.value||"1990-03-15").split("-");
    var Y=+base[0]||1990,M=+base[1]||3,D=+base[2]||15;
    var nowY=new Date().getFullYear();
    var wrap=document.createElement("div");wrap.className="dial";
    var gan=document.createElement("div");gan.className="dial-ganji";
    function pad(n){return n<10?"0"+n:""+n;}
    function daysIn(y,m){return new Date(y,m,0).getDate();}
    function build(unit,from,to,cur,suffix){
      var c=document.createElement("div");c.className="dial-col";c.dataset.unit=unit;
      c.tabIndex=0;c.setAttribute("role","listbox");c.setAttribute("aria-label",suffix);
      c.appendChild(Object.assign(document.createElement("div"),{className:"dial-pad"}));
      for(var v=from;v<=to;v++){
        var i=document.createElement("div");i.className="dial-item"+(v===cur?" on":"");
        i.textContent=v+suffix;i.dataset.v=v;i.setAttribute("role","option");
        c.appendChild(i);}
      c.appendChild(Object.assign(document.createElement("div"),{className:"dial-pad"}));
      return c;}
    var cols={y:build("y",1930,nowY,Y,"년"),m:build("m",1,12,M,"월"),d:build("d",1,daysIn(Y,M),D,"일")};
    wrap.appendChild(cols.y);wrap.appendChild(cols.m);wrap.appendChild(cols.d);
    var selBar=document.createElement("div");selBar.className="dial-sel";wrap.appendChild(selBar);
    // 다이얼을 input 자리에 놓고, input은 아래로 옮겨 '직접 입력'으로 남긴다
    inp.classList.add("dial-typed");
    host.insertBefore(wrap,inp);
    host.insertBefore(gan,inp);
    var typedLabel=document.createElement("div");
    typedLabel.className="dial-typed-label";
    typedLabel.textContent="직접 입력";
    host.insertBefore(typedLabel,inp);
    function center(col){ // 스크롤 위치로 가운데 항목을 판정한다
      var items=col.querySelectorAll(".dial-item");
      var idx=Math.round(col.scrollTop/44);
      return items[Math.max(0,Math.min(items.length-1,idx))];}
    function mark(col){
      var it=center(col);if(!it)return;
      col.querySelectorAll(".dial-item").forEach(function(x){x.classList.toggle("on",x===it);});
      return +it.dataset.v;}
    function scrollTo(col,v,smooth){
      var items=col.querySelectorAll(".dial-item");
      for(var i=0;i<items.length;i++)if(+items[i].dataset.v===v){
        col.scrollTo({top:i*44,behavior:smooth?"smooth":"auto"});return;}}
    // 일 목록은 실제 일수가 바뀔 때만 다시 만든다. 매번 교체하면 스크롤이 끊긴다
    var dayCount=daysIn(Y,M);
    function rebuildDays(){
      var max=daysIn(Y,M);
      if(max===dayCount&&D<=max)return;
      dayCount=max;if(D>max)D=max;
      var fresh=build("d",1,max,D,"일");
      wrap.replaceChild(fresh,cols.d);cols.d=fresh;bind(fresh);scrollTo(fresh,D,false);}
    var wheelLock=false;
    // 현재 선택에서 n칸 이동 — 휠·키보드가 함께 쓴다
    function step(col,n){
      var items=col.querySelectorAll(".dial-item"),cur=center(col);
      for(var i=0;i<items.length;i++){
        if(items[i]!==cur)continue;
        var t=items[Math.max(0,Math.min(items.length-1,i+n))];
        col.scrollTo({top:(i+n<0?0:Math.min(items.length-1,i+n))*44,behavior:"smooth"});
        apply(col,+t.dataset.v);
        return;}}
    // 값 확정 — 단위에 따라 Y/M/D를 갱신하고 결과를 다시 계산한다
    function apply(col,v){
      var u=col.dataset.unit;
      if(u==="y"){if(Y===v)return;Y=v;rebuildDays();}
      else if(u==="m"){if(M===v)return;M=v;rebuildDays();}
      else{if(D===v)return;D=v;}
      mark(col);commit();}
    var selfSet=false; // commit이 만든 change를 직접입력 핸들러가 되받지 않게 하는 표시
    function commit(){
      var v=Y+"-"+pad(M)+"-"+pad(D);
      selfSet=true;inp.value=v;setTimeout(function(){selfSet=false;},0);
      try{ // 간지 미리보기 — 만세력 엔진 재사용
        var p=sjPillars(Y,M,D,null,0,false);
        gan.innerHTML='이 날의 일진 <b>'+SJ_SH[p.d.s]+SJ_BH[p.d.b]+'</b> ('+SJ_S[p.d.s]+SJ_B[p.d.b]+') · '+SJ_TTI[p.y.b]+'띠';
      }catch(e){gan.textContent="";}
      inp.dispatchEvent(new Event("change",{bubbles:true}));
      if(typeof onChange==="function")onChange(v);
      // 날짜를 돌리는 것만으로 답이 나오면 '물어본다'는 감각이 사라진다.
      // 다이얼은 입력만 바꾸고, 답은 물어보기 버튼에서만 나온다.
      }
    var timer=null;
    function bind(col){
      col.addEventListener("scroll",function(){
        var v=mark(col);if(v==null)return;
        clearTimeout(timer);
        timer=setTimeout(function(){apply(col,v);},90);});
      // 마우스 휠은 한 틱에 100px 안팎이라 44px 항목을 두세 칸씩 건너뛴다.
      // 기본 스크롤을 막고 한 틱 = 정확히 한 칸으로 고정한다.
      col.addEventListener("wheel",function(e){
        e.preventDefault();
        if(wheelLock)return;
        wheelLock=true;setTimeout(function(){wheelLock=false;},70);
        step(col, e.deltaY>0?1:-1);
      },{passive:false});
      // 클릭 후 드래그로 돌리기 — 손가락으로 굴리듯 위아래로 끈다
      var dragging=false,startY=0,startTop=0,dragMoved=0;
      col.addEventListener("pointerdown",function(e){
        dragging=true;dragMoved=0;startY=e.clientY;startTop=col.scrollTop;
        col.setPointerCapture(e.pointerId);col.style.scrollSnapType="none";});
      col.addEventListener("pointermove",function(e){
        if(!dragging)return;
        var dy=e.clientY-startY;dragMoved=Math.max(dragMoved,Math.abs(dy));
        col.scrollTop=startTop-dy;});
      function endDrag(e){
        if(!dragging)return;
        dragging=false;col.style.scrollSnapType="";
        try{col.releasePointerCapture(e.pointerId);}catch(_){}
        var it=center(col);if(!it)return;
        col.scrollTo({top:Math.round(col.scrollTop/44)*44,behavior:"smooth"});
        apply(col,+it.dataset.v);}
      col.addEventListener("pointerup",endDrag);
      col.addEventListener("pointercancel",endDrag);
      // 끌지 않고 눌렀다 뗀 경우만 클릭으로 본다 (6px 미만)
      col.addEventListener("click",function(e){
        if(dragMoved>6)return;
        var it=e.target.closest(".dial-item");if(!it)return;
        scrollTo(col,+it.dataset.v,true);apply(col,+it.dataset.v);});
      col.addEventListener("keydown",function(e){
        var d=e.key==="ArrowDown"?1:e.key==="ArrowUp"?-1:0;if(!d)return;
        e.preventDefault();
        step(col,d);});}
    bind(cols.y);bind(cols.m);bind(cols.d);
    // 직접 입력 → 다이얼 위치를 맞춘다 (달력에서 고르거나 타이핑한 경우)
    function syncFromInput(){
      if(selfSet)return;
      var v=(inp.value||"").split("-");
      if(v.length<3)return;
      var y=+v[0],m=+v[1],d=+v[2];
      if(!y||!m||!d||y<1930||y>nowY)return;
      Y=y;M=m;D=d;rebuildDays();
      scrollTo(cols.y,Y,true);scrollTo(cols.m,M,true);scrollTo(cols.d,D,true);
      mark(cols.y);mark(cols.m);mark(cols.d);commit();}
    inp.addEventListener("change",syncFromInput);
    inp.addEventListener("input",syncFromInput);
    // rAF는 백그라운드 탭에서 실행되지 않아 휠이 0(1930년)에 머문 채 값과 어긋난다.
    // 타이머로도 한 번 더 맞춰 초기 위치를 보장한다.
    function settle(){scrollTo(cols.y,Y,false);scrollTo(cols.m,M,false);scrollTo(cols.d,D,false);commit();}
    requestAnimationFrame(settle);setTimeout(settle,0);
    setTimeout(settle,180);
    return wrap;}

  function shareBtn(){return '<button type="button" class="share-btn">결과 공유하기</button>'+
    '<button type="button" class="save-btn">이미지로 저장</button>';}
  // 캔버스는 자동 줄바꿈이 없다. 폭을 넘기기 직전 어절에서 끊어 줄 배열로 돌려준다
  function wrapText(ctx,text,maxW){
    var words=String(text).split(" "),lines=[],cur="";
    for(var i=0;i<words.length;i++){
      var test=cur?cur+" "+words[i]:words[i];
      if(ctx.measureText(test).width>maxW&&cur){lines.push(cur);cur=words[i];}else cur=test;}
    if(cur)lines.push(cur);return lines;}
  // 결과 카드 1080×1350 PNG. 외부 라이브러리 없이 Canvas만 사용
  function fortuneCard(o){
    if(typeof document==="undefined")return null;
    var W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;
    var x=c.getContext("2d");
    var g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#0d1424");g.addColorStop(.55,"#131c30");g.addColorStop(1,"#0a0f1a");
    x.fillStyle=g;x.fillRect(0,0,W,H);
    // 별: 좌표는 결정적이어야 같은 결과가 같은 그림을 낸다
    x.fillStyle="rgba(255,255,255,.55)";
    for(var i=0;i<90;i++){var sx=(i*137.5)%W,sy=(i*89.3)%(H*.62),r=(i%3)*.7+.6;
      x.beginPath();x.arc(sx,sy,r,0,6.283);x.fill();}
    x.strokeStyle="rgba(212,175,110,.5)";x.lineWidth=2;x.strokeRect(48,48,W-96,H-96);
    var F='"Noto Sans KR","Malgun Gothic",sans-serif';
    x.textAlign="center";
    x.fillStyle="#d4af6e";x.font="600 34px "+F;
    x.fillText(o.tool||"오늘의 운세",W/2,168);
    if(o.ident){x.fillStyle="#8b95a6";x.font="400 30px "+F;x.fillText(o.ident,W/2,224);}
    if(o.score!=null){
      x.fillStyle="#fff";x.font="900 210px "+F;x.fillText(String(o.score),W/2,470);
      x.fillStyle="#d4af6e";x.font="700 60px "+F;x.fillText(o.grade||"",W/2,556);}
    x.fillStyle="#fff";x.font="800 54px "+F;
    var hl=wrapText(x,o.headline||"",W-200),hy=o.score!=null?700:520;
    for(var j=0;j<hl.length&&j<3;j++){x.fillText(hl[j],W/2,hy+j*74);}
    if(o.body){
      x.fillStyle="#c3ccd9";x.font="400 38px "+F;
      var bl=wrapText(x,o.body,W-220),by=hy+hl.length*74+56;
      for(var k=0;k<bl.length&&k<6;k++){x.fillText(bl[k],W/2,by+k*60);}}
    x.fillStyle="#d4af6e";x.font="700 42px "+F;x.fillText("동네보살",W/2,H-136);
    x.fillStyle="#8b95a6";x.font="400 32px "+F;x.fillText("gyesangi.vercel.app",W/2,H-84);
    return c;}
  function bindSave(el,opts){
    var b=el.querySelector(".save-btn");if(!b)return;
    b.addEventListener("click",function(){
      track("image_save",{tool:location.pathname});
      var c=fortuneCard(typeof opts==="function"?opts():opts);if(!c)return;
      var name=(opts&&opts.file||"dongnebosal")+".png";
      b.textContent="만드는 중...";
      c.toBlob(function(blob){
        if(!blob){b.textContent="저장 실패";return;}
        var f=null;
        try{f=new File([blob],name,{type:"image/png"});}catch(e){}
        if(f&&navigator.canShare&&navigator.canShare({files:[f]})){
          navigator.share({files:[f]}).catch(function(){}).then(reset);
        }else{
          var u=URL.createObjectURL(blob),a=document.createElement("a");
          a.href=u;a.download=name;document.body.appendChild(a);a.click();
          document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(u);},1500);
          reset();}
        function reset(){b.textContent="이미지로 저장";}
      },"image/png");});}
  function bindShare(el,title,text){var b=el.querySelector(".share-btn");if(!b)return;
    b.addEventListener("click",function(){
      track("share_click",{tool:location.pathname});
      var d={title:title,text:text,url:location.href.split("#")[0].split("?")[0]},full=d.text+" "+d.url;
      function done(){b.textContent="복사됨! 카톡에 붙여넣으세요";setTimeout(function(){b.textContent="결과 공유하기";},2200);}
      function legacy(){ // clipboard API가 거부돼도 동작하는 최후 폴백
        var ta=document.createElement("textarea");ta.value=full;ta.style.position="fixed";ta.style.opacity="0";
        document.body.appendChild(ta);ta.select();
        try{document.execCommand("copy");done();}catch(e){b.textContent="복사 실패 — 길게 눌러 직접 복사하세요";}
        document.body.removeChild(ta);}
      if(navigator.share){navigator.share(d).catch(function(){});}
      else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(full).then(done,legacy);}
      else legacy();});}

  // ---------- TOOLS ----------
  
var TOOLS=[];
window.mountTool=function(id,elId){var t=TOOLS.filter(function(x){return x.id===id;})[0];if(t)t.render(document.getElementById(elId));};