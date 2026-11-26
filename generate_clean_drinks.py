import os
from PIL import Image, ImageOps, ImageChops, ImageDraw, ImageFilter

MASTER_PATH = r"C:\Users\lenovo\.gemini\antigravity\brain\873fd2d2-24f5-4d5d-b2d2-ed4defc34fdf\.user_uploaded\media_1794817866967_ffb8a325.png"
DIR1 = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\assets"
DIR2 = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\3d_drinks"
os.makedirs(DIR1, exist_ok=True)
os.makedirs(DIR2, exist_ok=True)

master = Image.open(MASTER_PATH).convert("RGBA")
W, H = master.size
r_m, g_m, b_m, alpha_master = master.split()
gray_master = master.convert("L")

# Extract the authentic HONNE logo layer
logo_green = Image.new("RGBA", (W, H), (0, 0, 0, 0))
logo_white = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for y in range(450, 850):
    for x in range(250, 720):
        r, g, b, a = master.getpixel((x, y))
        if a > 40:
            if r < 75 and b < 75 and g < 95 and (r + b) < 135:
                darkness = 1.0 - max(r, g, b) / 95.0
                alpha_val = int(min(255, 255 * darkness * 1.6))
                logo_green.putpixel((x, y), (8, 48, 22, alpha_val))
                logo_white.putpixel((x, y), (252, 248, 240, int(alpha_val * 0.95)))

def create_mask(y_start, y_end):
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    for y in range(H):
        if y < y_start:
            val = 0
        elif y > y_end:
            val = 255
        else:
            val = int(255 * (y - y_start) / (y_end - y_start))
        draw.line([(0, y), (W, y)], fill=val)
    return mask

def save_clean(img, name):
    p1 = os.path.join(DIR1, name)
    p2 = os.path.join(DIR2, name)
    img.save(p1, "PNG", optimize=True)
    img.save(p2, "PNG", optimize=True)
    print(f"Photorealistic PNG saved: {name}")

# 1. CÀ PHÊ SỮA ĐÁ (The original master photo)
save_clean(master, "drink_coffee_milk.png")

# 2. CÀ PHÊ ĐEN (Pure dark Robusta with amber edge)
black_cup = ImageOps.colorize(
    gray_master,
    black=(10, 5, 3),
    mid=(38, 18, 10),
    white=(245, 235, 225)
)
black_cup.putalpha(alpha_master)
black_cup.alpha_composite(logo_white)
save_clean(black_cup, "drink_coffee_black.png")

# 3. CÀ PHÊ MUỐI (Two-tone: Lower dark coffee, Upper thick salted cream)
coffee_bot = ImageOps.colorize(
    gray_master,
    black=(18, 9, 5),
    mid=(46, 24, 14),
    white=(230, 215, 200)
)
salt_foam = ImageOps.colorize(
    gray_master,
    black=(190, 185, 175),
    mid=(246, 242, 234),
    white=(255, 255, 252)
)
mask_muoi = create_mask(490, 580)
ca_phe_muoi = Image.composite(coffee_bot, salt_foam, mask_muoi)
ca_phe_muoi.putalpha(alpha_master)
ca_phe_muoi.alpha_composite(logo_green)
save_clean(ca_phe_muoi, "drink_coffee_muoi.png")

# 4. CÀ PHÊ KEM BMT (Rich Ban Me coffee with velvety vanilla cream crown - NO artificial dots!)
bmt_dark = ImageOps.colorize(
    gray_master,
    black=(20, 10, 5),
    mid=(52, 26, 15),
    white=(235, 220, 205)
)
bmt_cream = ImageOps.colorize(
    gray_master,
    black=(180, 175, 165),
    mid=(250, 245, 236),
    white=(255, 255, 255)
)
mask_bmt = create_mask(380, 480)
ca_phe_kem_bmt = Image.composite(bmt_dark, bmt_cream, mask_bmt)
ca_phe_kem_bmt.putalpha(alpha_master)
ca_phe_kem_bmt.alpha_composite(logo_green)
save_clean(ca_phe_kem_bmt, "drink_coffee_bmt.png")

# 5. MATCHA LATTE (Japanese ceremonial green upper, fresh milk lower)
matcha_top = ImageOps.colorize(
    gray_master,
    black=(24, 62, 18),
    mid=(62, 136, 42),
    white=(228, 250, 218)
)
milk_bot = ImageOps.colorize(
    gray_master,
    black=(195, 192, 185),
    mid=(248, 246, 238),
    white=(255, 255, 255)
)
mask_matcha = create_mask(470, 570)
matcha_latte = Image.composite(milk_bot, matcha_top, mask_matcha)
matcha_latte.putalpha(alpha_master)
matcha_latte.alpha_composite(logo_green)
save_clean(matcha_latte, "drink_matcha.png")

# 6. TRÀ SỮA TRUYỀN THỐNG (Ceylon milk tea with boba tone)
milktea_trad = ImageOps.colorize(
    gray_master,
    black=(105, 60, 35),
    mid=(205, 152, 105),
    white=(255, 248, 238)
)
milktea_trad.putalpha(alpha_master)
milktea_trad.alpha_composite(logo_green)
save_clean(milktea_trad, "drink_milktea_trad.png")

# 7. TRÀ SỮA OOLONG (Roasted amber oolong)
milktea_oolong = ImageOps.colorize(
    gray_master,
    black=(90, 48, 25),
    mid=(188, 132, 86),
    white=(255, 245, 230)
)
milktea_oolong.putalpha(alpha_master)
milktea_oolong.alpha_composite(logo_green)
save_clean(milktea_oolong, "drink_milktea_oolong.png")

# 8. TRÀ SỮA THÁI XANH (Jade green Thai tea)
thai_green = ImageOps.colorize(
    gray_master,
    black=(18, 80, 42),
    mid=(52, 152, 85),
    white=(225, 250, 230)
)
thai_green.putalpha(alpha_master)
thai_green.alpha_composite(logo_green)
save_clean(thai_green, "drink_milktea_thai.png")

# 9. TRÀ SỮA SOCOLA (Rich dark chocolate fudge)
choco_milk = ImageOps.colorize(
    gray_master,
    black=(28, 14, 8),
    mid=(82, 44, 26),
    white=(245, 230, 218)
)
choco_milk.putalpha(alpha_master)
choco_milk.alpha_composite(logo_white)
save_clean(choco_milk, "drink_milktea_choco.png")

# 10. TRÀ ĐÀO CAM SẢ (Golden peach tea)
peach_tea = ImageOps.colorize(
    gray_master,
    black=(135, 50, 12),
    mid=(232, 132, 38),
    white=(255, 240, 210)
)
peach_tea.putalpha(alpha_master)
peach_tea.alpha_composite(logo_green)
save_clean(peach_tea, "drink_peach_tea.png")

# 11. TRÀ VẢI NHIỆT ĐỚI (Rose-tinted lychee tea)
lychee_tea = ImageOps.colorize(
    gray_master,
    black=(125, 34, 38),
    mid=(220, 100, 90),
    white=(255, 238, 235)
)
lychee_tea.putalpha(alpha_master)
lychee_tea.alpha_composite(logo_green)
save_clean(lychee_tea, "drink_lychee_tea.png")

# 12. TRÀ MẬN KIWI (Ruby plum tea)
kiwi_tea = ImageOps.colorize(
    gray_master,
    black=(105, 18, 32),
    mid=(180, 44, 60),
    white=(255, 230, 235)
)
kiwi_tea.putalpha(alpha_master)
kiwi_tea.alpha_composite(logo_green)
save_clean(kiwi_tea, "drink_kiwi_tea.png")

# 13. SOCOLA ĐÁ XAY (Frappe chocolate with whipped cream top)
choco_base = ImageOps.colorize(
    gray_master,
    black=(22, 10, 6),
    mid=(72, 38, 22),
    white=(242, 230, 220)
)
whip_top = ImageOps.colorize(
    gray_master,
    black=(200, 192, 182),
    mid=(252, 248, 242),
    white=(255, 255, 255)
)
mask_frappe = create_mask(260, 360)
frappe = Image.composite(choco_base, whip_top, mask_frappe)
frappe.putalpha(alpha_master)
frappe.alpha_composite(logo_white)
save_clean(frappe, "drink_choco_frappe.png")

print("All 13 photorealistic transparent PNG drinks regenerated with zero artificial artifacts!")
