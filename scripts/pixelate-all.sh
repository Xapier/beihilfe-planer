#!/bin/bash
# Screenshot Pixelation Script
# Pixelates all raw screenshots in docs/screenshots/

SCREENSHOTS_DIR="./docs/screenshots"
PIXEL_SIZE="${1:-10}"  # Default: 10% size for pixelation

if [ ! -d "$SCREENSHOTS_DIR" ]; then
    echo "❌ Directory not found: $SCREENSHOTS_DIR"
    exit 1
fi

echo "📸 Screenshot Pixelation Script"
echo "================================"
echo ""
echo "Pixel size: $PIXEL_SIZE%"
echo ""

# Check if convert is available
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick 'convert' command not found"
    echo "   Install with: brew install imagemagick"
    exit 1
fi

# Count raw files
RAW_COUNT=$(find "$SCREENSHOTS_DIR" -name "*-raw.png" | wc -l)

if [ "$RAW_COUNT" -eq 0 ]; then
    echo "⚠️  No raw screenshots found (*-raw.png)"
    echo ""
    echo "Create them by:"
    echo "1. Opening each page in your browser"
    echo "2. Taking a full-page screenshot"
    echo "3. Saving to $SCREENSHOTS_DIR/{page-name}-raw.png"
    echo ""
    echo "Example filenames:"
    echo "  - dashboard-raw.png"
    echo "  - aufwendungen-raw.png"
    echo "  - patienten-raw.png"
    echo "  - kontakte-raw.png"
    echo "  - berichte-raw.png"
    exit 0
fi

echo "🔍 Found $RAW_COUNT raw screenshot(s)"
echo ""
echo "🎨 Starting pixelation..."
echo ""

SUCCESS=0
FAILED=0

# Pixelate each raw screenshot
for raw_file in "$SCREENSHOTS_DIR"/*-raw.png; do
    if [ -f "$raw_file" ]; then
        basename=$(basename "$raw_file" -raw.png)
        output_file="$SCREENSHOTS_DIR/$basename.png"
        
        echo "📷 Processing: $basename"
        
        # Pixelate: downscale then upscale
        # Example: 10% means downsample to 10% size, then upsample back
        if convert "$raw_file" -sample "${PIXEL_SIZE}%" -sample "$((100 / $PIXEL_SIZE))00%" "$output_file"; then
            echo "   ✅ $output_file"
            SUCCESS=$((SUCCESS + 1))
        else
            echo "   ❌ Error processing $raw_file"
            FAILED=$((FAILED + 1))
        fi
    fi
done

echo ""
echo "================================"
echo "✅ Pixelation complete!"
echo "   Success: $SUCCESS"
echo "   Failed: $FAILED"
echo ""
echo "Pixelated files:"
ls -lh "$SCREENSHOTS_DIR"/*.png 2>/dev/null | grep -v raw || echo "   (no pixelated files yet)"
