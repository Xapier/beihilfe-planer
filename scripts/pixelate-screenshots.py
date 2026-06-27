#!/usr/bin/env python3
"""
Screenshot Capture and Pixelation Script
Captures screenshots from Beihilfe-Planer and pixelates sensitive data
"""

from PIL import Image, ImageFilter, ImageDraw
import os
import sys
from datetime import datetime

SCREENSHOTS_DIR = './docs/screenshots'
BASE_URL = 'http://192.168.188.61'

# Page configurations
PAGES = {
    'dashboard': {
        'url': f'{BASE_URL}/index.html',
        'title': '🏠 Dashboard - Übersicht',
        'description': 'Startseite mit Zusammenfassung von Patienten, Aufwendungen und Kosten'
    },
    'aufwendungen': {
        'url': f'{BASE_URL}/form_aufwendungen_status.html',
        'title': '📋 Aufwendungen & Status Management',
        'description': 'Zentrale Verwaltung aller medizinischen Aufwendungen mit 5-Säulen-Status-System'
    },
    'patienten': {
        'url': f'{BASE_URL}/patients.html',
        'title': '👥 Patienten Verwaltung',
        'description': 'Verwaltung von Patienten/Familienangehörigen mit individuellen Beihilfesätzen'
    },
    'kontakte': {
        'url': f'{BASE_URL}/contacts.html',
        'title': '🏥 Kontakte Verwaltung',
        'description': 'Ärzte, Zahnärzte, Kliniken und Apotheken als Ansprechpartner'
    },
    'berichte': {
        'url': f'{BASE_URL}/reports.html',
        'title': '📊 Berichte & Auswertungen',
        'description': 'Übersichten und Statistiken zu Kosten und Erstattungen'
    }
}

def pixelate_region(image, x1, y1, x2, y2, pixel_size=15):
    """Pixelate a rectangular region of the image"""
    if x1 < 0 or y1 < 0 or x2 > image.width or y2 > image.height:
        return image
    
    # Extract the region
    region = image.crop((x1, y1, x2, y2))
    
    # Downscale and upscale to create pixelation effect
    small = region.resize(
        (max(1, region.width // pixel_size), max(1, region.height // pixel_size)),
        Image.Resampling.LANCZOS
    )
    pixelated = small.resize(
        (region.width, region.height),
        Image.Resampling.NEAREST
    )
    
    # Paste back
    image.paste(pixelated, (x1, y1))
    return image

def pixelate_screenshot(input_file, output_file, page_type='dashboard'):
    """
    Pixelate sensitive regions in screenshot.
    """
    img = Image.open(input_file)
    width, height = img.size
    
    # Define pixelation regions based on page type
    # These are approximate coordinates that should pixelate data tables and sensitive info
    regions_to_pixelate = []
    
    if page_type == 'dashboard':
        # Pixelate numbers and amounts in the statistics boxes
        # Assuming height around 900-1000px
        if height > 400:
            # Statistics boxes area
            regions_to_pixelate.append((400, 150, 700, 220))
            regions_to_pixelate.append((400, 280, 700, 350))
            regions_to_pixelate.append((400, 360, 700, 430))
    
    elif page_type == 'aufwendungen':
        # Pixelate all table content (data is sensitive)
        if height > 600:
            # Main table area (approximate)
            regions_to_pixelate.append((50, 350, width-50, min(height-100, 1200)))
    
    elif page_type == 'patienten':
        # Pixelate patient names and details
        if height > 400:
            # Patient list area
            regions_to_pixelate.append((50, 250, width-50, min(height-50, 800)))
    
    elif page_type == 'kontakte':
        # Pixelate contact names and details
        if height > 400:
            # Contact list area
            regions_to_pixelate.append((50, 250, width-50, min(height-50, 800)))
    
    elif page_type == 'berichte':
        # Pixelate report data and statistics
        if height > 400:
            # Report content area
            regions_to_pixelate.append((50, 200, width-50, min(height-50, 900)))
    
    # Apply pixelation to all regions
    for x1, y1, x2, y2 in regions_to_pixelate:
        img = pixelate_region(img, x1, y1, x2, y2, pixel_size=10)
    
    img.save(output_file, quality=95)
    print(f'✅ Pixelated: {os.path.basename(output_file)} ({width}x{height})')

def generate_readme_section(page_name, page_info, screenshot_path):
    """Generate a section for the README with screenshot"""
    rel_path = os.path.relpath(screenshot_path, '.')
    
    markdown = f"""
### {page_info['title']}

{page_info['description']}

![{page_name} screenshot]({rel_path})

> ℹ️ Die Daten in den Screenshots sind aus Datenschutzgründen verpixelt.

---
"""
    return markdown

def main():
    # Ensure screenshots directory exists
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    
    print('📸 Beihilfe-Planer Documentation Screenshots\n')
    print('=' * 50)
    print()
    
    # Check if raw screenshots exist
    print('🔍 Checking for raw screenshots...\n')
    
    pixelated_files = []
    for page_name, page_info in PAGES.items():
        raw_path = os.path.join(SCREENSHOTS_DIR, f'{page_name}-raw.png')
        output_path = os.path.join(SCREENSHOTS_DIR, f'{page_name}.png')
        
        if os.path.exists(raw_path):
            print(f'📷 Processing: {page_info["title"]}')
            pixelate_screenshot(raw_path, output_path, page_name)
            pixelated_files.append((page_name, page_info, output_path))
        else:
            print(f'⚠️  Not found (raw): {raw_path}')
    
    if pixelated_files:
        print()
        print('=' * 50)
        print('✅ Pixelation complete!\n')
        
        print('Generated markdown for README:\n')
        for page_name, page_info, path in pixelated_files:
            section = generate_readme_section(page_name, page_info, path)
            print(section)
    else:
        print('⚠️  No raw screenshots found. Please capture them first.')
        print()
        print('Usage:')
        print('1. Run capture-screenshots.js to create raw screenshots')
        print('2. Run this script to pixelate them')
        print()
        print('Example:')
        print('  node scripts/capture-screenshots.js')
        print('  python3 scripts/pixelate-screenshots.py')

if __name__ == '__main__':
    main()
