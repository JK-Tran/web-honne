import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ASSET_DIR = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\assets"
os.makedirs(ASSET_DIR, exist_ok=True)

# Generate high-resolution, modern cafe architectural storefront graphics
def create_store_front(w, h, name, subtitle, color_theme):
    img = Image.new("RGBA", (w, h), color_theme[0])
    draw = ImageDraw.Draw(img)

    # Modern wooden slat facade background
    for y in range(0, h, 28):
        draw.line([(0, y), (w, y)], fill=color_theme[1], width=2)

    # Glass window storefront with warm amber cafe lighting
    draw.rounded_rectangle([40, 60, w - 40, h - 30], radius=24, fill=(28, 22, 18, 240), outline=(210, 160, 90, 200), width=4)
    # Warm interior glow
    draw.rounded_rectangle([50, 70, w - 50, h - 40], radius=20, fill=(45, 32, 22, 255))
    
    # Countertop & hanging lights
    draw.ellipse([w//3 - 30, 80, w//3 + 30, 110], fill=(255, 220, 140, 220))
    draw.ellipse([2*w//3 - 30, 80, 2*w//3 + 30, 110], fill=(255, 220, 140, 220))
    # Green plants
    draw.ellipse([50, h - 110, 120, h - 30], fill=(35, 90, 50, 240))
    draw.ellipse([w - 120, h - 110, w - 50, h - 30], fill=(35, 90, 50, 240))

    # Glowing Signboard
    draw.rounded_rectangle([w//4, 15, 3*w//4, 55], radius=12, fill=(18, 55, 33, 255), outline=(212, 175, 55, 255), width=2)

    try:
        font_b = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 22)
        font_s = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 14)
    except:
        font_b = ImageFont.load_default()
        font_s = ImageFont.load_default()

    draw.text((w//2 - 65, 22), "HONNE CAFE", font=font_b, fill=(245, 230, 180, 255))
    draw.text((w//2 - 70, h//2 - 10), name, font=font_b, fill=(255, 255, 255, 255))
    draw.text((w//2 - 80, h//2 + 25), subtitle, font=font_s, fill=(210, 190, 160, 230))

    return img

stores = [
    ("store_thumb1.png", "Chi nhánh Quận 1", "123 Nguyễn Văn Cừ, P.2", ((22, 60, 38), (30, 80, 50))),
    ("store_thumb2.png", "Chi nhánh Phú Nhuận", "456 Phan Đình Phùng", ((28, 50, 42), (38, 70, 58))),
    ("about_store.png", "HONNE Flagship Store", "Không gian xanh thư giãn", ((18, 50, 32), (26, 72, 46))),
    ("store_map.png", "Saigon Coffee Map", "Hệ thống 4 chi nhánh", ((20, 45, 30), (28, 65, 45))),
]

for filename, title, sub, theme in stores:
    out_img = create_store_front(600, 380, title, sub, theme)
    path = os.path.join(ASSET_DIR, filename)
    out_img.save(path, "PNG")
    print("Generated clean asset:", filename)
