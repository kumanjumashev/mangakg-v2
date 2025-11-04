#!/usr/bin/env python3
"""
Generate contributor avatar images with solid colors and white initials.
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Configuration
OUTPUT_DIR = "frontend/src/assets/team"
IMAGE_SIZE = 400  # Size in pixels (width and height)
BACKGROUND_COLORS = [
    "#10b981",  # Green
    "#f59e0b",  # Orange
]

CONTRIBUTORS = [
    {"name": "Alikhan Maratov", "initials": "AM", "filename": "contributor-1.jpg", "color": "#10b981"},
    {"name": "Mehmet Zhyldyzbek", "initials": "MZ", "filename": "contributor-2.jpg", "color": "#f59e0b"},
]


def generate_avatar(name, initials, color, output_path):
    """Generate a circular avatar with initials."""
    # Create a new image with transparent background
    img = Image.new('RGB', (IMAGE_SIZE, IMAGE_SIZE), color=color)
    draw = ImageDraw.Draw(img)

    # Try to use a nice font, fall back to default if not available
    try:
        # Try common system fonts
        font_size = IMAGE_SIZE // 3
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", IMAGE_SIZE // 3)
        except:
            # Fall back to default font
            font = ImageFont.load_default()

    # Calculate text position to center it
    bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    text_x = (IMAGE_SIZE - text_width) // 2
    text_y = (IMAGE_SIZE - text_height) // 2 - bbox[1]

    # Draw the initials in white
    draw.text((text_x, text_y), initials, fill="white", font=font)

    # Save the image
    img.save(output_path, "JPEG", quality=95)
    print(f"✓ Generated {output_path} for {name}")


def main():
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Generating contributor avatars...")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Image size: {IMAGE_SIZE}x{IMAGE_SIZE}px")
    print()

    # Generate avatars for each contributor
    for contributor in CONTRIBUTORS:
        output_path = os.path.join(OUTPUT_DIR, contributor["filename"])
        generate_avatar(
            name=contributor["name"],
            initials=contributor["initials"],
            color=contributor["color"],
            output_path=output_path
        )

    print()
    print(f"✓ Successfully generated {len(CONTRIBUTORS)} avatar images!")


if __name__ == "__main__":
    main()
