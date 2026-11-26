import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 2x supersampling dimensions
W, H = 1000, 1300
OUTPUT_DIR = r"c:\Users\lenovo\OneDrive\Desktop\web_honne\public\images\3d_drinks"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Try finding bold font
FONT_BOLD_PATH = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(FONT_BOLD_PATH):
    FONT_BOLD_PATH = r"C:\Windows\Fonts\arialbd.ttf"

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def blend_color(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_ellipse_filled(draw, cx, cy, rx, ry, color):
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color)

def draw_ice_cube(draw, cx, cy, size, angle_deg=15):
    # 3D isometric ice cube with rounded feel and crystal highlights
    rad = math.radians(angle_deg)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    
    # 6 points of cube outline
    pts = []
    w = size
    h = size * 0.8
    corners = [(-w/2, -h/2), (w/2, -h/2), (w/2, h/2), (-w/2, h/2)]
    rot_corners = [(cx + x*cos_a - y*sin_a, cy + x*sin_a + y*cos_a) for x, y in corners]
    
    # Translucent ice body
    draw.polygon(rot_corners, fill=(255, 255, 255, 110), outline=(255, 255, 255, 180))
    # Inner light reflection
    draw.line([rot_corners[0], rot_corners[1]], fill=(255, 255, 255, 240), width=3)
    draw.line([rot_corners[1], rot_corners[2]], fill=(255, 255, 255, 180), width=2)

def draw_boba_pearl(draw, cx, cy, r):
    # Sphere with radial gradient and highlight
    for ir in range(r, 0, -1):
        ratio = ir / r
        # Dark brown to dark amber
        val = int(25 + 30 * (1 - ratio))
        draw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=(val + 10, val, val - 5, 240))
    # Specular glint
    draw.ellipse([cx - r//3, cy - r//2, cx - r//5, cy - r//3], fill=(255, 255, 255, 220))

def render_cup(config):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Cup geometry in 1000x1300 space
    cx = W // 2
    top_y = 280
    bot_y = 1040
    cup_h = bot_y - top_y
    top_rx = 280
    top_ry = 55
    bot_rx = 200
    bot_ry = 38

    # 1. Ground Shadow
    shadow_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_img)
    s_draw.ellipse([cx - bot_rx - 80, bot_y - 20, cx + bot_rx + 80, bot_y + 90], fill=(15, 25, 20, 140))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(30))
    img.alpha_composite(shadow_img)

    # 2. Straw (drawn behind or in front)
    # Angled modern straw
    straw_color = config.get("straw_color", (26, 74, 46, 255)) # Dark green default
    straw_top = (cx + 120, top_y - 200)
    straw_mid = (cx + 40, top_y + 20)
    straw_bot = (cx - 30, bot_y - 150)
    draw.line([straw_top, straw_mid, straw_bot], fill=straw_color, width=28)
    draw.line([(straw_top[0]-4, straw_top[1]), (straw_mid[0]-4, straw_mid[1]), (straw_bot[0]-4, straw_bot[1])],
              fill=(255, 255, 255, 120), width=6) # Straw highlight

    # 3. Cup Interior Mask / Liquid Filling
    liquid_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    l_draw = ImageDraw.Draw(liquid_img)

    # Scanlines for liquid
    for y in range(top_y, bot_y + 1):
        t = (y - top_y) / cup_h  # 0 at top, 1 at bottom
        rx = top_rx + (bot_rx - top_rx) * t
        ry = top_ry + (bot_ry - top_ry) * t
        x_left = cx - rx
        x_right = cx + rx

        # Color evaluation based on drink configuration
        drink_type = config["type"]
        
        if drink_type == "salt_coffee":
            # 0 to 0.32: thick white salted cream foam with cocoa dust
            # 0.32 to 1.0: dark robusta coffee
            if t < 0.30:
                base_c = (248, 246, 240)
            elif t < 0.35:
                # blended boundary
                ratio = (t - 0.30) / 0.05
                base_c = blend_color((245, 240, 230), (45, 25, 15), ratio)
            else:
                base_c = blend_color((40, 22, 14), (25, 12, 8), (t - 0.35) / 0.65)

        elif drink_type == "matcha_latte":
            # 0 to 0.45: bright ceremonial matcha green
            # 0.45 to 0.55: blended green-milk swirl
            # 0.55 to 1.0: creamy milk
            if t < 0.42:
                base_c = blend_color((58, 122, 45), (42, 92, 32), t / 0.42)
            elif t < 0.52:
                ratio = (t - 0.42) / 0.10
                base_c = blend_color((52, 108, 38), (245, 245, 238), ratio)
            else:
                base_c = blend_color((245, 245, 240), (235, 232, 220), (t - 0.52) / 0.48)

        elif drink_type == "black_coffee":
            # Deep black coffee with slight amber glow at top
            base_c = blend_color((35, 18, 10), (18, 9, 5), t)

        elif drink_type == "milk_coffee":
            # Vietnamese cà phê sữa đá: creamy golden brown
            base_c = blend_color((135, 82, 48), (75, 42, 24), t)

        elif drink_type == "cream_coffee":
            # Ban Me cream coffee: top cream 25%, bottom coffee 75%
            if t < 0.26:
                base_c = (252, 248, 238)
            elif t < 0.32:
                base_c = blend_color((250, 245, 230), (55, 30, 18), (t - 0.26) / 0.06)
            else:
                base_c = blend_color((55, 30, 18), (32, 16, 10), (t - 0.32) / 0.68)

        elif drink_type == "boba_milktea":
            # Traditional milk tea
            base_c = blend_color((210, 160, 115), (175, 120, 80), t)

        elif drink_type == "oolong_milktea":
            # Roasted amber oolong
            base_c = blend_color((195, 140, 95), (160, 105, 65), t)

        elif drink_type == "thai_green":
            # Vivid jade green
            base_c = blend_color((45, 140, 80), (30, 100, 55), t)

        elif drink_type == "choco_milktea":
            # Deep rich chocolate
            base_c = blend_color((85, 45, 25), (48, 24, 12), t)

        elif drink_type == "peach_tea":
            # Golden peach orange
            base_c = blend_color((238, 150, 55), (210, 110, 30), t)

        elif drink_type == "lychee_tea":
            # Rose-blush tropical tea
            base_c = blend_color((235, 120, 105), (195, 75, 65), t)

        elif drink_type == "kiwi_tea":
            # Ruby plum & kiwi green
            if t < 0.5:
                base_c = blend_color((165, 45, 55), (195, 65, 75), t / 0.5)
            else:
                base_c = blend_color((195, 65, 75), (85, 145, 55), (t - 0.5) / 0.5)

        elif drink_type == "choco_frappe":
            # Blended chocolate with cream
            if t < 0.22:
                base_c = (255, 250, 245)
            else:
                base_c = blend_color((80, 42, 22), (50, 25, 12), (t - 0.22) / 0.78)
        else:
            base_c = (120, 80, 50)

        # Cylindrical 3D lighting shading across horizontal slice
        row_width = int(x_right - x_left)
        if row_width > 0:
            for xi in range(int(x_left), int(x_right)):
                norm_x = (xi - cx) / rx  # -1 at left, +1 at right
                
                # Diffuse cylinder curve
                cos_factor = math.sqrt(max(0.0, 1.0 - norm_x * norm_x))
                
                # Specular left highlight (glossy plastic)
                spec1 = math.exp(-((norm_x + 0.35) ** 2) / 0.04)
                # Soft right bounce light
                spec2 = math.exp(-((norm_x - 0.75) ** 2) / 0.08)

                # Shaded color
                shade = 0.55 + 0.45 * cos_factor
                r = int(min(255, base_c[0] * shade + 90 * spec1 + 40 * spec2))
                g = int(min(255, base_c[1] * shade + 90 * spec1 + 40 * spec2))
                b = int(min(255, base_c[2] * shade + 90 * spec1 + 40 * spec2))

                # Edge darkening
                edge_factor = 1.0 - (abs(norm_x) ** 6) * 0.4
                r = int(r * edge_factor)
                g = int(g * edge_factor)
                b = int(b * edge_factor)

                l_draw.point((xi, y), fill=(r, g, b, 255))

    # Add ice cubes or boba inside liquid
    if "boba" in config.get("toppings", []):
        for bi in range(35):
            bx = cx + random.randint(-int(bot_rx*0.8), int(bot_rx*0.8))
            by = bot_y - random.randint(15, 130)
            draw_boba_pearl(l_draw, bx, by, random.randint(14, 20))

    if config.get("has_ice", True):
        # Ice cubes floating
        ice_coords = [
            (cx - 70, top_y + 110, 55, 20),
            (cx + 80, top_y + 130, 60, -15),
            (cx - 30, top_y + 210, 65, 10),
            (cx + 60, top_y + 290, 50, -25),
            (cx - 80, top_y + 360, 58, 30),
            (cx + 40, top_y + 440, 52, -10),
        ]
        for ix, iy, isz, iang in ice_coords:
            draw_ice_cube(l_draw, ix, iy, isz, iang)

    # Fruit slices for fruit teas
    if "orange_slice" in config.get("toppings", []):
        # Orange slice peeking out
        ox, oy = cx + 70, top_y + 100
        l_draw.ellipse([ox - 50, oy - 25, ox + 50, oy + 25], fill=(245, 140, 20, 240), outline=(255, 200, 50, 255), width=4)
        l_draw.ellipse([ox - 40, oy - 18, ox + 40, oy + 18], fill=(240, 110, 10, 220))
        # Mint leaf
        l_draw.ellipse([cx - 40, top_y + 40, cx, top_y + 75], fill=(40, 160, 60, 245))

    # Cocoa powder on salt coffee / frappe
    if "cocoa_dust" in config.get("toppings", []):
        for _ in range(80):
            dx = cx + random.randint(-int(top_rx*0.65), int(top_rx*0.65))
            dy = top_y + random.randint(15, 60)
            l_draw.ellipse([dx-3, dy-2, dx+3, dy+2], fill=(60, 30, 15, 230))

    img.alpha_composite(liquid_img)

    # 4. Translucent Cup Plastic Reflections & Highlights
    glass_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glass_img)

    # Vertical gloss strips
    spec_x1 = int(cx - top_rx * 0.45)
    spec_x2 = int(cx - bot_rx * 0.45)
    g_draw.line([(spec_x1, top_y + 20), (spec_x2, bot_y - 20)], fill=(255, 255, 255, 110), width=18)
    g_draw.line([(spec_x1 + 10, top_y + 20), (spec_x2 + 8, bot_y - 20)], fill=(255, 255, 255, 60), width=32)

    # Right edge specular line
    g_draw.line([(cx + top_rx - 15, top_y + 20), (cx + bot_rx - 10, bot_y - 20)], fill=(255, 255, 255, 90), width=8)

    # Condensation water droplets
    random.seed(42 + hash(config["type"]))
    for _ in range(25):
        drop_t = random.uniform(0.15, 0.90)
        curr_rx = top_rx + (bot_rx - top_rx) * drop_t
        drop_x = cx + random.uniform(-curr_rx * 0.85, curr_rx * 0.85)
        drop_y = top_y + cup_h * drop_t
        drop_r = random.randint(3, 7)
        # Droplet body & shadow
        g_draw.ellipse([drop_x - drop_r, drop_y - drop_r*1.4, drop_x + drop_r, drop_y + drop_r*1.4], fill=(255, 255, 255, 130))
        g_draw.point((drop_x - 1, drop_y - 2), fill=(255, 255, 255, 255))

    img.alpha_composite(glass_img)

    # 5. Cup Bottom & Top Rims (Plastic curves)
    rim_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(rim_img)

    # Bottom curved rim
    r_draw.ellipse([cx - bot_rx, bot_y - bot_ry, cx + bot_rx, bot_y + bot_ry], outline=(255, 255, 255, 160), width=6)
    r_draw.arc([cx - bot_rx + 4, bot_y - bot_ry + 2, cx + bot_rx - 4, bot_y + bot_ry - 2], 0, 180, fill=(20, 20, 20, 80), width=5)

    # Top Rim Lip & Lid
    r_draw.ellipse([cx - top_rx - 10, top_y - top_ry - 10, cx + top_rx + 10, top_y + top_ry + 10], outline=(255, 255, 255, 220), width=8)
    r_draw.ellipse([cx - top_rx - 8, top_y - top_ry - 8, cx + top_rx + 8, top_y + top_ry + 8], fill=(255, 255, 255, 45))

    # Clear Dome or Flat Lid
    lid_y = top_y - top_ry - 35
    r_draw.arc([cx - top_rx - 12, lid_y - 60, cx + top_rx + 12, top_y + top_ry], 180, 360, fill=(255, 255, 255, 190), width=6)
    r_draw.arc([cx - top_rx, lid_y - 50, cx + top_rx, top_y + top_ry - 15], 190, 350, fill=(255, 255, 255, 90), width=4)

    img.alpha_composite(rim_img)

    # 6. BRAND LOGO "HONNE COFFEE & TEA" ON THE CUP
    # Render crisp label
    label_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    label_draw = ImageDraw.Draw(label_img)

    logo_y = top_y + int(cup_h * 0.48)
    label_w = 340
    label_h = 200

    # Minimalist translucent white or green cafe label badge with soft glow
    bg_box = [cx - label_w//2, logo_y - label_h//2, cx + label_w//2, logo_y + label_h//2]
    label_draw.rounded_rectangle(bg_box, radius=32, fill=(255, 255, 255, 235), outline=(230, 235, 230, 255), width=3)
    # Subtle inner border
    inner_box = [bg_box[0] + 6, bg_box[1] + 6, bg_box[2] - 6, bg_box[3] - 6]
    label_draw.rounded_rectangle(inner_box, radius=26, outline=(22, 60, 38, 70), width=2)

    # Brand Emblem (Green Leaf Icon)
    emblem_y = logo_y - 55
    label_draw.ellipse([cx - 20, emblem_y - 18, cx + 20, emblem_y + 18], fill=(22, 70, 42, 255))
    label_draw.ellipse([cx - 14, emblem_y - 12, cx + 14, emblem_y + 12], fill=(245, 248, 245, 255))
    # Leaf vein
    label_draw.line([(cx, emblem_y - 10), (cx, emblem_y + 10)], fill=(22, 70, 42, 255), width=2)

    # "HONNE" Text
    try:
        font_honne = ImageFont.truetype(FONT_BOLD_PATH, 58)
        font_sub = ImageFont.truetype(FONT_BOLD_PATH, 16)
    except Exception:
        font_honne = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    honne_bbox = label_draw.textbbox((0, 0), "HONNE", font=font_honne)
    h_w = honne_bbox[2] - honne_bbox[0]
    h_h = honne_bbox[3] - honne_bbox[1]
    label_draw.text((cx - h_w // 2, logo_y - 20), "HONNE", font=font_honne, fill=(18, 55, 33, 255))

    sub_text = "COFFEE  &  TEA"
    sub_bbox = label_draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = sub_bbox[2] - sub_bbox[0]
    label_draw.text((cx - s_w // 2, logo_y + 45), sub_text, font=font_sub, fill=(45, 105, 65, 255))

    # Specular gloss passing over label
    label_draw.line([(cx - 70, bg_box[1]), (cx - 50, bg_box[3])], fill=(255, 255, 255, 140), width=16)

    img.alpha_composite(label_img)

    # Downsample with high-quality LANCZOS for razor-sharp antialiased rendering
    final_img = img.resize((500, 650), Image.Resampling.LANCZOS)
    return final_img

# Drink configurations for all menu items
DRINKS = [
    {
        "filename": "drink_coffee_muoi.png",
        "type": "salt_coffee",
        "has_ice": True,
        "toppings": ["cocoa_dust"],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_coffee_bmt.png",
        "type": "cream_coffee",
        "has_ice": True,
        "toppings": [],
        "straw_color": (35, 25, 20, 255)
    },
    {
        "filename": "drink_coffee_black.png",
        "type": "black_coffee",
        "has_ice": True,
        "toppings": [],
        "straw_color": (20, 20, 20, 255)
    },
    {
        "filename": "drink_coffee_milk.png",
        "type": "milk_coffee",
        "has_ice": True,
        "toppings": [],
        "straw_color": (35, 25, 20, 255)
    },
    {
        "filename": "drink_milktea_trad.png",
        "type": "boba_milktea",
        "has_ice": True,
        "toppings": ["boba"],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_milktea_oolong.png",
        "type": "oolong_milktea",
        "has_ice": True,
        "toppings": [],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_milktea_thai.png",
        "type": "thai_green",
        "has_ice": True,
        "toppings": [],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_milktea_choco.png",
        "type": "choco_milktea",
        "has_ice": True,
        "toppings": [],
        "straw_color": (40, 20, 10, 255)
    },
    {
        "filename": "drink_matcha.png",
        "type": "matcha_latte",
        "has_ice": True,
        "toppings": [],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_peach_tea.png",
        "type": "peach_tea",
        "has_ice": True,
        "toppings": ["orange_slice"],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_lychee_tea.png",
        "type": "lychee_tea",
        "has_ice": True,
        "toppings": [],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_kiwi_tea.png",
        "type": "kiwi_tea",
        "has_ice": True,
        "toppings": [],
        "straw_color": (26, 74, 46, 255)
    },
    {
        "filename": "drink_choco_frappe.png",
        "type": "choco_frappe",
        "has_ice": True,
        "toppings": ["cocoa_dust"],
        "straw_color": (35, 20, 15, 255)
    }
]

print(f"Starting 3D render of {len(DRINKS)} drink cups...")
for d in DRINKS:
    cup_image = render_cup(d)
    path = os.path.join(OUTPUT_DIR, d["filename"])
    cup_image.save(path, "PNG")
    print(f"Generated: {d['filename']}")

print("All 13 3D realistic drink cups successfully rendered!")
