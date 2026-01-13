import shutil
import os

assets = [
    ("C:\\Users\\ebzch\\.gemini\\antigravity\\brain\\20366c45-f9b7-47d7-920b-6e18eb035d90\\herb_hero_1767533016437.png", "c:\\Users\\ebzch\\OneDrive\\Desktop\\Coding\\Nee Commerce Project\\frontend\\src\\images\\herb_hero.png"),
    ("C:\\Users\\ebzch\\.gemini\\antigravity\\brain\\20366c45-f9b7-47d7-920b-6e18eb035d90\\slim_tea_1767533039746.png", "c:\\Users\\ebzch\\OneDrive\\Desktop\\Coding\\Nee Commerce Project\\frontend\\src\\images\\slim_tea.png"),
    ("C:\\Users\\ebzch\\.gemini\\antigravity\\brain\\20366c45-f9b7-47d7-920b-6e18eb035d90\\honey_jar_1767533063581.png", "c:\\Users\\ebzch\\OneDrive\\Desktop\\Coding\\Nee Commerce Project\\frontend\\src\\images\\honey.png"),
    ("C:\\Users\\ebzch\\.gemini\\antigravity\\brain\\20366c45-f9b7-47d7-920b-6e18eb035d90\\groceries_hero_1767533083811.png", "c:\\Users\\ebzch\\OneDrive\\Desktop\\Coding\\Nee Commerce Project\\frontend\\src\\images\\groceries_hero.png"),
    ("C:\\Users\\ebzch\\.gemini\\antigravity\\brain\\20366c45-f9b7-47d7-920b-6e18eb035d90\\herb_logo_minimal_1767533102606.png", "c:\\Users\\ebzch\\OneDrive\\Desktop\\Coding\\Nee Commerce Project\\frontend\\src\\images\\herb_logo.png"),
    ("C:\\Users\\ebzch\\.gemini\\antigravity\\brain\\20366c45-f9b7-47d7-920b-6e18eb035d90\\groceries_logo_minimal_1767533115663.png", "c:\\Users\\ebzch\\OneDrive\\Desktop\\Coding\\Nee Commerce Project\\frontend\\src\\images\\groceries_logo.png"),
]

for src, dst in assets:
    try:
        shutil.copy2(src, dst)
        print(f"Copied {src} to {dst}")
    except Exception as e:
        print(f"Failed to copy {src}: {e}")
