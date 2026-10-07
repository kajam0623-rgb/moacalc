"""로고·파비콘 만들기 — 아기보살(art/bosal-mascot-a.png) 머리를 원 안에 넣는다.
실행: py -3 tools/make_logo.py  → img/ 의 logo·icon·favicon 8개를 덮어쓴다(빌드가 site/img 로 복사)."""
from PIL import Image, ImageDraw
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = Image.open(os.path.join(ROOT, "art", "bosal-mascot-a.png")).convert("RGBA")
FILL, RING = (246, 235, 210, 255), (201, 162, 74, 255)   # 크림 바탕, 금색 테


def mark(size, crop, ring=True, round_=True):
    """crop=(x0,y0,x1,y1) 원본에서 쓸 정사각 영역. 원(또는 꽉 찬 사각) 바탕 위에 얹는다."""
    S = 1024  # 크게 그린 뒤 줄여야 테두리가 매끈하다
    face = SRC.crop(crop).resize((S, S), Image.LANCZOS)
    base = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    if round_:
        d.ellipse((0, 0, S - 1, S - 1), fill=RING if ring else FILL)
        if ring:
            w = S // 26
            d.ellipse((w, w, S - 1 - w, S - 1 - w), fill=FILL)
    else:
        base.paste(FILL, (0, 0, S, S))
    base.alpha_composite(face)
    if round_:  # 그림이 원 밖으로 나가지 않게 잘라 낸다
        m = Image.new("L", (S, S), 0)
        ImageDraw.Draw(m).ellipse((0, 0, S - 1, S - 1), fill=255)
        base.putalpha(Image.composite(base.getchannel("A"), m, m))
    return base.resize((size, size), Image.LANCZOS)


HEAD = (310, 100, 930, 720)  # 모자 위 조금~턱 아래, 얼굴이 가운데
TIGHT = (390, 230, 870, 710)  # 작은 파비콘: 얼굴을 더 크게

out = lambda n: os.path.join(ROOT, "img", n)
mark(240, HEAD).save(out("logo.png"))
mark(120, HEAD).save(out("logo@1x.png"))
mark(68, HEAD).save(out("logo-68.webp"), quality=90)
mark(512, HEAD).save(out("icon-512.png"))
mark(192, HEAD).convert("RGBA").save(out("icon-192.png"))
mark(180, HEAD, round_=False).convert("RGB").save(out("apple-touch-icon.png"))  # iOS 가 모서리를 알아서 깎는다
mark(32, TIGHT, ring=False).save(out("favicon-32.png"))
mark(48, TIGHT, ring=False).save(out("favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print("logo·icon·favicon 8개 저장")
