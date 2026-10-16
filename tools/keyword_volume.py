import json, sys, time, urllib.request
KW = """결혼운 결혼시기 결혼운세 재혼운 이사날짜 이사택일 이사방향 이사운 개업날짜 개업택일 택일 결혼택일 결혼날짜 아기이름짓기 작명 이름풀이 개명 이름점 성명학
관상 손금 손금보는법 관상보는법 풍수 풍수인테리어 현관풍수 거울풍수 돈들어오는그림 풍수그림 해바라기그림 돈들어오는방법 금전운 재물운높이는법 부자되는사주
행운의색 띠별행운의색 오늘의행운의색 탄생화 탄생화의미 생일꽃 혈액형성격 혈액형궁합 별자리성격 사주궁합보는법 궁합보는법
도화살 역마살 백호살 괴강살 화개살 양인살 천을귀인 귀문관살 원진살 홍염살 신살종류 공망
대운 대운보는법 대운바뀌는해 용신 용신찾기 격국 십성 식신 상관 편재 정재 편관 정관 편인 정인 비견 겁재
승진운 취업운 이직운 이직시기 취업시기 연애운세 재회운 짝사랑 재회타로 연애타로 속마음타로
24절기 절기 입동 동지 동지팥죽 소설 대설 소한 대한 입춘대길 입춘 경칩 설날 정월대보름 부럼 오곡밥 복조리 세배 덕담 새해덕담 새해인사말
사주오행 오행부족 오행뜻 금기운 수기운 목기운 화기운 토기운 오행색 오방색
일주 일주론 갑자일주 무토 기토 갑목 을목 병화 정화 경금 신금 임수 계수
띠별성격 쥐띠성격 소띠성격 양띠성격 말띠성격 띠별궁합표 띠궁합표
사주란 사주보는법 사주팔자뜻 팔자 사주용어 만세력보는법 음력생일 음력생일계산 양력음력변환 음력달력 손없는날
태몽 태몽해몽 태몽종류 아들태몽 딸태몽 꿈해몽사전
2027년운세 2027년대운 2027년재물운 2027년연애운 2027삼재띠 정미년생 1967년생 1967년생운세 환갑 칠순 환갑나이 칠순나이 회갑
신점 사주카페 철학관 무료운세 운세보기 무료타로 타로카드의미 타로카드종류""".split()
URL = "https://magic-map-fawn.vercel.app/api/naver-keyword-volume"
out = {}
for i in range(0, len(KW), 10):
    chunk = KW[i:i+10]
    req = urllib.request.Request(URL, data=json.dumps({"keywords": chunk}).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        r = json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8"))
    except Exception as e:
        print("ERR", chunk[0], e, file=sys.stderr); time.sleep(3); continue
    items = r.get("results") or r.get("data") or r.get("items") or r
    if isinstance(items, dict): items = list(items.values())
    for it in items:
        if isinstance(it, dict):
            k = it.get("keyword") or it.get("relKeyword") or it.get("kw")
            v = it.get("totalCount") if it.get("totalCount") is not None else it.get("total")
            if k: out[k] = v
    time.sleep(1.5)
json.dump(out, open("C:/tmp/col-new/kv_2026-10-13.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
for k, v in sorted(out.items(), key=lambda x: -(x[1] or 0)):
    print(k, v)
print("n", len(out), "of", len(KW))
