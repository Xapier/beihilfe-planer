#!/usr/bin/env python3
"""
Simple screenshot capture and pixelation script.
Uses ImageMagick to capture via screenshot and then pixelate.
"""

import subprocess
import os
import time
from pathlib import Path

SCREENSHOTS_DIR = Path('./docs/screenshots')
BASE_URL = 'http://192.168.188.61'

PAGES = {
    'dashboard': f'{BASE_URL}/index.html',
    'aufwendungen': f'{BASE_URL}/form_aufwendungen_status.html', 
    'patienten': f'{BASE_URL}/patients.html',
    'kontakte': f'{BASE_URL}/contacts.html',
    'berichte': f'{BASE_URL}/reports.html'
}

def open_in_browser_and_capture(url, output_path, page_name):
    """Open URL in Safari and capture screenshot"""
    print(f'📷 Capturing: {page_name}')
    
    # Use macOS open command to open in Safari
    open_cmd = f'open "{url}"'
    subprocess.run(open_cmd, shell=True)
    
    # Wait for page to load
    time.sleep(3)
    
    # Use screencapture command to capture the active window
    capture_cmd = f'screencapture -x "{output_path}"'
    result = subprocess.run(capture_cmd, shell=True, capture_output=True)
    
    if result.returncode == 0:
        print(f'   ✅ Screenshot saved to {output_path}')
        return True
    else:
        print(f'   ❌ Error: {result.stderr.decode()}')
        return False

def pixelate_with_magick(input_file, output_file):
    """Pixelate image using ImageMagick"""
    print(f'🎨 Pixelating: {input_file}')
    
    # ImageMagick command to pixelate: scale down then scale back up
    cmd = f'/opt/homebrew/bin/convert "{input_file}" -sample 10% -sample 1000% "{output_file}"'
    result = subprocess.run(cmd, shell=True, capture_output=True)
    
    if result.returncode == 0:
        print(f'   ✅ Pixelated: {output_file}')
        return True
    else:
        print(f'   ❌ Error: {result.stderr.decode()}')
        return False

def main():
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    
    print('📸 Screenshot & Pixelation Utility\n')
    print('Manual approach for macOS:')
    print('1. Navigate to each URL in your browser')
    print('2. Take a full-page screenshot')
    print('3. Save as PNG in docs/screenshots/\n')
    print('Example filenames:')
    for page_name in PAGES:
        print(f'  - {page_name}-raw.png')
    print()
    
    # Check if raw screenshots exist
    missing = []
    for page_name in PAGES:
        raw_path = SCREENSHOTS_DIR / f'{page_name}-raw.png'
        if not raw_path.exists():
            missing.append(page_name)
    
    if missing:
        print(f'⚠️  Missing raw screenshots for: {", ".join(missing)}')
        print()
        print('Create them by:')
        print('1. Opening the URL in your browser (Chrome/Safari/Firefox)')
        print('2. Taking a full-page screenshot')
        print('3. Saving to docs/screenshots/{page-name}-raw.png')
        return
    
    print('✅ All raw screenshots found!')
    print()
    
    # Pixelate all screenshots
    print('Starting pixelation...\n')
    success_count = 0
    
    for page_name in PAGES:
        raw_path = SCREENSHOTS_DIR / f'{page_name}-raw.png'
        output_path = SCREENSHOTS_DIR / f'{page_name}.png'
        
        if raw_path.exists():
            if pixelate_with_magick(str(raw_path), str(output_path)):
                success_count += 1
        print()
    
    print(f'✅ Pixelation complete! {success_count} screenshots processed.')

if __name__ == '__main__':
    main()
