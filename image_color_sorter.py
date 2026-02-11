import os
from PIL import Image
import colorsys

# 1. Setup path
folder_path = 'gallery/' # Change this to your folder path
files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'))]

image_data = []

for filename in files:
    img_path = os.path.join(folder_path, filename)
    try:
        with Image.open(img_path) as img:
            # Resize to 1x1 to get the absolute average color of all pixels
            img = img.convert('RGB').resize((1, 1))
            r, g, b = img.getpixel((0, 0))
            
            # Convert RGB (0-255) to HSV (0.0-1.0)
            # Hue is the "type" of color (0=Red, 0.33=Green, 0.66=Blue)
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            image_data.append({'name': filename, 'hue': h, 'path': img_path})
    except Exception as e:
        print(f"Skipping {filename}: {e}")

# 2. Sort by Hue
image_data.sort(key=lambda x: x['hue'])

# 3. Rename files sequentially
for i, data in enumerate(image_data):
    new_name = f"image_{i:04d}.jpg"
    new_path = os.path.join(folder_path, new_name)
    os.rename(data['path'], new_path)
    print(f"Renamed {data['name']} -> {new_name}")