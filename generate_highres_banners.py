import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ASSET_DIR = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\assets"
os.makedirs(ASSET_DIR, exist_ok=True)

try:
    font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 26)
    font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 16)
    font_badge = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 14)
except:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_badge = ImageFont.load_default()

def create_card_banner(w, h, bg_color1, bg_color2, tag, title, subtitle, icon_type):
    img = Image.new("RGBA", (w, h), bg_color1)
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(h):
        t = y / float(h)
        r = int(bg_color1[0] * (1 - t) + bg_color2[0] * t)
        g = int(bg_color1[1] * (1 - t) + bg_color2[1] * t)
        b = int(bg_color1[2] * (1 - t) + bg_color2[2] * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Organic circles and aesthetic lighting
    draw.ellipse([w - 180, -40, w + 60, 200], fill=(255, 255, 255, 25))
    draw.ellipse([w - 240, h - 160, w + 40, h + 100], fill=(255, 255, 255, 30))

    # Decorative icon circles
    draw.rounded_rectangle([35, 35, 35 + 130, 68], radius=16, fill=(255, 255, 255, 45))
    draw.text((48, 42), tag.upper(), font=font_badge, fill=(255, 255, 255, 240))

    # Title & Subtitle
    draw.text((35, h - 120), title, font=font_title, fill=(255, 255, 255, 255))
    draw.text((35, h - 75), subtitle, font=font_sub, fill=(230, 240, 235, 220))

    # Draw specific beverage icon / visual on the right
    if icon_type == "matcha":
        # Green tea bowl & whisk graphic
        draw.ellipse([w - 140, h//2 - 50, w - 40, h//2 + 50], fill=(45, 120, 60, 230), outline=(255, 255, 255, 180), width=4)
        draw.ellipse([w - 125, h//2 - 35, w - 55, h//2 + 35], fill=(70, 165, 80, 255))
    elif icon_type == "coffee":
        # Roasted coffee beans graphic
        draw.ellipse([w - 130, h//2 - 30, w - 70, h//2 + 20], fill=(42, 22, 14, 240), outline=(210, 160, 110, 200), width=3)
        draw.line([(w - 120, h//2 - 5), (w - 80, h//2 - 5)], fill=(20, 10, 5, 255), width=3)
        draw.ellipse([w - 90, h//2 + 10, w - 35, h//2 + 55], fill=(55, 28, 16, 240), outline=(210, 160, 110, 200), width=3)
        draw.line([(w - 80, h//2 + 32), (w - 45, h//2 + 32)], fill=(20, 10, 5, 255), width=3)
    elif icon_type == "space":
        # Cafe interior warm glow
        draw.rounded_rectangle([w - 160, h//2 - 50, w - 40, h//2 + 50], radius=16, fill=(35, 28, 20, 220), outline=(245, 210, 130, 200), width=3)
        draw.ellipse([w - 110, h//2 - 35, w - 90, h//2 - 15], fill=(255, 225, 130, 240))
        draw.ellipse([w - 140, h//2 + 10, w - 60, h//2 + 40], fill=(40, 95, 55, 240))
    elif icon_type == "combo":
        # Cup & Cake graphic
        draw.rounded_rectangle([w - 140, h//2 - 40, w - 75, h//2 + 50], radius=12, fill=(235, 150, 60, 230), outline=(255, 255, 255, 200), width=3)
        draw.polygon([(w - 70, h//2 + 10), (w - 30, h//2 + 10), (w - 50, h//2 + 50)], fill=(210, 110, 50, 240))

    return img

banners = [
    ("combo_chill.png", (22, 65, 42), (15, 45, 28), "Combo 49K", "Combo Thật Chill", "Cà phê muối + Bánh ngọt tươi ngon", "combo"),
    ("blog1.png", (28, 85, 50), (18, 55, 32), "Matcha Nhật Bản", "Matcha - Thức uống xanh", "Chất chống oxy hóa cho cuộc sống an lành", "matcha"),
    ("blog2.png", (45, 25, 15), (28, 14, 8), "Văn hóa Cà phê", "5 Lý do thưởng thức cà phê", "Đánh thức sự tập trung & sáng tạo mỗi ngày", "coffee"),
    ("blog3.png", (18, 50, 35), (12, 38, 25), "Không gian xanh", "Điểm hẹn thư thái HONNE", "Góc bình yên giữa lòng phố thị náo nhiệt", "space"),
]

for filename, bg1, bg2, tag, title, sub, icon in banners:
    out = create_card_banner(600, 380, bg1, bg2, tag, title, sub, icon)
    path = os.path.join(ASSET_DIR, filename)
    out.save(path, "PNG")
    print("Generated high-res banner:", filename)
