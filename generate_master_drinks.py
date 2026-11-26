import os
import math
import random
from PIL import Image, ImageOps, ImageChops, ImageDraw, ImageFilter, ImageEnhance

# Master uploaded template image
MASTER_PATH = r"C:\Users\lenovo\.gemini\antigravity\brain\873fd2d2-24f5-4d5d-b2d2-ed4defc34fdf\.user_uploaded\media_1794817866967_ffb8a325.png"
OUTPUT_DIR_1 = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\assets"
OUTPUT_DIR_2 = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\3d_drinks"
os.makedirs(OUTPUT_DIR_1, exist_ok=True)
os.makedirs(OUTPUT_DIR_2, exist_ok=True)

master = Image.open(MASTER_PATH).convert("RGBA")
W, H = master.size
r_m, g_m, b_m, alpha_master = master.split()
gray_master = master.convert("L")

# 1. Extract the clean HONNE logo layer
logo_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for y in range(450, 850):
    for x in range(250, 720):
        r, g, b, a = master.getpixel((x, y))
        if a > 40:
            # Detect dark green text on caramel/cream background
            if r < 75 and b < 75 and g < 95 and (r + b) < 135:
                darkness = 1.0 - max(r, g, b) / 95.0
                alpha_val = int(min(255, 255 * darkness * 1.6))
                logo_layer.putpixel((x, y), (8, 48, 22, alpha_val))

# Also create a white/golden high-contrast logo for very dark drinks
logo_white = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for y in range(450, 850):
    for x in range(250, 720):
        _, _, _, a = logo_layer.getpixel((x, y))
        if a > 10:
            logo_white.putpixel((x, y), (250, 245, 235, int(a * 0.95)))

# Function to generate horizontal/vertical gradient masks
def create_linear_mask(w, h, y_start, y_end):
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    for y in range(h):
        if y < y_start:
            val = 0
        elif y > y_end:
            val = 255
        else:
            val = int(255 * (y - y_start) / (y_end - y_start))
        draw.line([(0, y), (w, y)], fill=val)
    return mask

def save_drink(img, filename):
    p1 = os.path.join(OUTPUT_DIR_1, filename)
    p2 = os.path.join(OUTPUT_DIR_2, filename)
    img.save(p1, "PNG", optimize=True)
    img.save(p2, "PNG", optimize=True)
    print(f"Saved: {filename}")

# --- 1. CÀ PHÊ SỮA ĐÁ (drink_coffee_milk.png) ---
# Perfect master image itself!
save_drink(master, "drink_coffee_milk.png")

# --- 2. CÀ PHÊ ĐEN (drink_coffee_black.png) ---
# Pure dark Robusta espresso with sparkling crystal ice cubes on top
black_coffee = ImageOps.colorize(
    gray_master,
    black=(12, 6, 4),
    mid=(42, 22, 14),
    white=(245, 235, 225)
)
black_coffee.putalpha(alpha_master)
# Subtle golden crema glow at top liquid line (y: 170-260)
crema_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cr_draw = ImageDraw.Draw(crema_overlay)
cr_draw.ellipse([200, 160, 780, 260], fill=(160, 95, 35, 70))
crema_overlay = crema_overlay.filter(ImageFilter.GaussianBlur(15))
black_coffee.alpha_composite(crema_overlay)
# Apply high-contrast logo
black_coffee.alpha_composite(logo_white)
save_drink(black_coffee, "drink_coffee_black.png")

# --- 3. CÀ PHÊ MUỐI (drink_coffee_muoi.png) ---
# Two-tone: Lower 60% dark coffee, Upper 40% thick white salted cream foam + cocoa powder
coffee_bottom = ImageOps.colorize(
    gray_master,
    black=(18, 9, 5),
    mid=(48, 25, 15),
    white=(235, 220, 205)
)
cream_top = ImageOps.colorize(
    gray_master,
    black=(200, 195, 185),
    mid=(245, 240, 230),
    white=(255, 255, 252)
)
# Composite boundary around y=520 (split line)
transition_mask = create_linear_mask(W, H, 480, 560)
ca_phe_muoi = Image.composite(coffee_bottom, cream_top, transition_mask)
ca_phe_muoi.putalpha(alpha_master)

# Cocoa dust on top ice cubes (y: 150-280)
dust_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d_draw = ImageDraw.Draw(dust_overlay)
random.seed(101)
for _ in range(160):
    dx = random.randint(280, 680)
    dy = random.randint(150, 290)
    if alpha_master.getpixel((dx, dy)) > 150:
        d_draw.ellipse([dx-3, dy-2, dx+3, dy+2], fill=(55, 25, 12, random.randint(180, 240)))
dust_overlay = dust_overlay.filter(ImageFilter.GaussianBlur(1))
ca_phe_muoi.alpha_composite(dust_overlay)
# Brand logo in signature dark green
ca_phe_muoi.alpha_composite(logo_layer)
save_drink(ca_phe_muoi, "drink_coffee_muoi.png")

# --- 4. CÀ PHÊ KEM BMT (drink_coffee_bmt.png) ---
# Rich Ban Me Thuot coffee with vanilla whipped cream top & coffee beans
bmt_coffee = ImageOps.colorize(
    gray_master,
    black=(22, 11, 6),
    mid=(58, 30, 18),
    white=(240, 230, 215)
)
vanilla_cream = ImageOps.colorize(
    gray_master,
    black=(220, 210, 195),
    mid=(252, 247, 238),
    white=(255, 255, 255)
)
bmt_mask = create_linear_mask(W, H, 380, 460)
ca_phe_kem_bmt = Image.composite(bmt_coffee, vanilla_cream, bmt_mask)
ca_phe_kem_bmt.putalpha(alpha_master)

# Coffee beans on top
bean_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
b_draw = ImageDraw.Draw(bean_overlay)
for bx, by in [(360, 200), (580, 220), (470, 260)]:
    b_draw.ellipse([bx-18, by-12, bx+18, by+12], fill=(28, 14, 8, 245))
    b_draw.line([(bx-14, by), (bx+14, by)], fill=(12, 6, 3, 255), width=3)
    b_draw.ellipse([bx-8, by-8, bx+2, by-4], fill=(255, 255, 255, 60))
ca_phe_kem_bmt.alpha_composite(bean_overlay)
ca_phe_kem_bmt.alpha_composite(logo_layer)
save_drink(ca_phe_kem_bmt, "drink_coffee_bmt.png")

# --- 5. MATCHA LATTE (drink_matcha.png) ---
# Ceremonial Japanese matcha green top, velvety fresh milk bottom
matcha_green = ImageOps.colorize(
    gray_master,
    black=(28, 68, 20),
    mid=(65, 138, 45),
    white=(230, 250, 220)
)
fresh_milk = ImageOps.colorize(
    gray_master,
    black=(210, 208, 200),
    mid=(248, 246, 238),
    white=(255, 255, 255)
)
matcha_mask = create_linear_mask(W, H, 480, 580)
matcha_latte = Image.composite(fresh_milk, matcha_green, matcha_mask)
matcha_latte.putalpha(alpha_master)
matcha_latte.alpha_composite(logo_layer)
save_drink(matcha_latte, "drink_matcha.png")

# --- 6. TRÀ SỮA TRUYỀN THỐNG (drink_milktea_trad.png) ---
# Classic caramel Ceylon black milk tea + chewy dark boba pearls at bottom
milk_tea = ImageOps.colorize(
    gray_master,
    black=(110, 65, 38),
    mid=(205, 155, 110),
    white=(255, 248, 238)
)
milk_tea.putalpha(alpha_master)

# Tapioca pearls at bottom (y: 800 - 990)
boba_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bb_draw = ImageDraw.Draw(boba_overlay)
random.seed(42)
for _ in range(65):
    cx = random.randint(310, 640)
    cy = random.randint(790, 970)
    cr = random.randint(18, 26)
    # Check within cup
    if alpha_master.getpixel((cx, cy)) > 150:
        bb_draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=(22, 14, 10, 250))
        bb_draw.ellipse([cx-cr//3, cy-cr//2, cx-cr//6, cy-cr//3], fill=(255, 255, 255, 180))
milk_tea.alpha_composite(boba_overlay)
milk_tea.alpha_composite(logo_layer)
save_drink(milk_tea, "drink_milktea_trad.png")

# --- 7. TRÀ SỮA OOLONG (drink_milktea_oolong.png) ---
# Roasted amber Oolong milk tea with warm golden tone
oolong_tea = ImageOps.colorize(
    gray_master,
    black=(95, 52, 28),
    mid=(190, 135, 90),
    white=(255, 245, 230)
)
oolong_tea.putalpha(alpha_master)
oolong_tea.alpha_composite(logo_layer)
save_drink(oolong_tea, "drink_milktea_oolong.png")

# --- 8. TRÀ SỮA THÁI XANH (drink_milktea_thai.png) ---
# Vibrant jade Thai green tea
thai_green = ImageOps.colorize(
    gray_master,
    black=(20, 85, 45),
    mid=(55, 155, 90),
    white=(225, 250, 230)
)
thai_green.putalpha(alpha_master)
thai_green.alpha_composite(logo_layer)
save_drink(thai_green, "drink_milktea_thai.png")

# --- 9. TRÀ SỮA SOCOLA (drink_milktea_choco.png) ---
# Rich chocolate fudge milk tea
choco_milktea = ImageOps.colorize(
    gray_master,
    black=(32, 16, 10),
    mid=(85, 46, 28),
    white=(245, 230, 218)
)
choco_milktea.putalpha(alpha_master)
choco_milktea.alpha_composite(logo_white)
save_drink(choco_milktea, "drink_milktea_choco.png")

# --- 10. TRÀ ĐÀO CAM SẢ (drink_peach_tea.png) ---
# Sparkling golden peach orange tea with fresh orange slice & mint
peach_tea = ImageOps.colorize(
    gray_master,
    black=(145, 55, 15),
    mid=(235, 138, 42),
    white=(255, 240, 210)
)
peach_tea.putalpha(alpha_master)

# Fresh orange slice floating on top
orange_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
o_draw = ImageDraw.Draw(orange_overlay)
ox, oy = 560, 250
o_draw.ellipse([ox-70, oy-40, ox+70, oy+40], fill=(245, 140, 15, 230), outline=(255, 210, 40, 255), width=5)
o_draw.ellipse([ox-55, oy-28, ox+55, oy+28], fill=(240, 115, 10, 210))
# Mint leaves
o_draw.ellipse([420, 210, 480, 250], fill=(42, 160, 58, 240))
o_draw.ellipse([450, 230, 510, 270], fill=(32, 140, 48, 240))
peach_tea.alpha_composite(orange_overlay)
peach_tea.alpha_composite(logo_layer)
save_drink(peach_tea, "drink_peach_tea.png")

# --- 11. TRÀ VẢI NHIỆT ĐỚI (drink_lychee_tea.png) ---
# Rose-pink tropical jasmine tea with sweet lychee fruits
lychee_tea = ImageOps.colorize(
    gray_master,
    black=(135, 38, 42),
    mid=(225, 105, 95),
    white=(255, 238, 235)
)
lychee_tea.putalpha(alpha_master)

# Sweet white lychee fruit pieces
fruit_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
f_draw = ImageDraw.Draw(fruit_overlay)
for lx, ly in [(400, 270), (550, 310)]:
    f_draw.ellipse([lx-35, ly-30, lx+35, ly+30], fill=(250, 245, 240, 220), outline=(240, 220, 215, 255), width=3)
    f_draw.ellipse([lx-10, ly-8, lx+10, ly+8], fill=(210, 160, 150, 120))
lychee_tea.alpha_composite(fruit_overlay)
lychee_tea.alpha_composite(logo_layer)
save_drink(lychee_tea, "drink_lychee_tea.png")

# --- 12. TRÀ MẬN KIWI (drink_kiwi_tea.png) ---
# Ruby plum tea with vibrant green kiwi slices
kiwi_tea = ImageOps.colorize(
    gray_master,
    black=(110, 20, 35),
    mid=(185, 48, 65),
    white=(255, 230, 235)
)
kiwi_tea.putalpha(alpha_master)

# Kiwi slice
kiwi_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
k_draw = ImageDraw.Draw(kiwi_overlay)
kx, ky = 520, 280
k_draw.ellipse([kx-65, ky-45, kx+65, ky+45], fill=(95, 175, 45, 235), outline=(70, 135, 30, 255), width=4)
k_draw.ellipse([kx-22, ky-15, kx+22, ky+15], fill=(235, 250, 200, 240))
# Kiwi seeds
for ang in range(0, 360, 35):
    rad = math.radians(ang)
    sx = kx + int(34 * math.cos(rad))
    sy = ky + int(24 * math.sin(rad))
    k_draw.ellipse([sx-2, sy-2, sx+2, sy+2], fill=(20, 20, 15, 240))
kiwi_tea.alpha_composite(kiwi_overlay)
kiwi_tea.alpha_composite(logo_layer)
save_drink(kiwi_tea, "drink_kiwi_tea.png")

# --- 13. SOCOLA ĐÁ XAY (drink_choco_frappe.png) ---
# Blended iced chocolate with whipped cream peak
choco_frappe = ImageOps.colorize(
    gray_master,
    black=(25, 12, 8),
    mid=(75, 40, 24),
    white=(245, 232, 222)
)
whip_cream = ImageOps.colorize(
    gray_master,
    black=(215, 205, 195),
    mid=(252, 248, 242),
    white=(255, 255, 255)
)
frappe_mask = create_linear_mask(W, H, 220, 320)
socola_da_xay = Image.composite(choco_frappe, whip_cream, frappe_mask)
socola_da_xay.putalpha(alpha_master)

# Cocoa powder on whipped cream
fc_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
fc_draw = ImageDraw.Draw(fc_overlay)
random.seed(99)
for _ in range(120):
    fx = random.randint(300, 650)
    fy = random.randint(140, 270)
    if alpha_master.getpixel((fx, fy)) > 150:
        fc_draw.ellipse([fx-3, fy-2, fx+3, fy+2], fill=(45, 20, 10, random.randint(180, 240)))
socola_da_xay.alpha_composite(fc_overlay)
socola_da_xay.alpha_composite(logo_white)
save_drink(socola_da_xay, "drink_choco_frappe.png")

print("All 13 photorealistic transparent PNG drinks successfully created based on sample cup!")
