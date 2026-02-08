import shutil
import os

src = r"C:\Users\ebzch\.gemini\antigravity\brain\6c737bff-6028-47eb-9b4f-85ef83ab43cc\nee_commerce_favicon_1769939006403.png"
dst = r"c:\Users\ebzch\OneDrive\Desktop\Coding\Nee Commerce Project\frontend\public\favicon.png"

try:
    # Ensure directory exists
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f"✅ Successfully copied {src} to {dst}")
    
    # Also copy to a backup location just in case /favicon.png has issues
    dst_img = r"c:\Users\ebzch\OneDrive\Desktop\Coding\Nee Commerce Project\frontend\src\images\logo.png"
    shutil.copy2(src, dst_img)
    print(f"✅ Successfully copied {src} to {dst_img}")
    
except Exception as e:
    print(f"❌ Failed to copy: {e}")
