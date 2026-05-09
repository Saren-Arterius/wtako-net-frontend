#!/usr/bin/env python3
"""
Script to read all art images from config.json, extract dimensions, and generate thumbnails.
Uses ImageMagick convert to resize images to max 768px and save as .avif.
"""

import json
import os
import argparse
import subprocess
from PIL import Image

def get_image_dimensions(image_path):
    """Get width and height of an image file."""
    try:
        with Image.open(image_path) as img:
            return {"width": img.width, "height": img.height}
    except Exception as e:
        return {"width": None, "height": None, "error": str(e)}

def generate_thumbnail(image_path, thumb_path, max_size=768, quality=80):
    """Generate a thumbnail using ImageMagick convert command."""
    try:
        # -resize 768x768 ensures the image fits within 768x768 while maintaining aspect ratio
        # -quality sets the output quality
        cmd = [
            "convert",
            image_path,
            "-resize", f"{max_size}x{max_size}>",
            "-quality", str(quality),
            thumb_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"  Error generating thumbnail: {e.stderr.decode()}")
        return False
    except FileNotFoundError:
        print("  Error: ImageMagick 'convert' not found. Install it first.")
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--update-config", action="store_true", help="Update config.json in place with dimensions")
    parser.add_argument("--generate-thumbs", action="store_true", help="Generate .avif thumbnails using ImageMagick")
    args = parser.parse_args()

    # Get the project root directory (parent of scripts folder)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    public_dir = os.path.join(project_root, "public")

    config_path = os.path.join(public_dir, "config.json")

    with open(config_path, "r") as f:
        config = json.load(f)

    # Process each art item
    for art in config.get("art", []):
        # imageUrl starts with / so join will work correctly
        image_path = os.path.join(public_dir, art["imageUrl"].lstrip("/"))
        dims = get_image_dimensions(image_path)

        art["width"] = dims.get("width")
        art["height"] = dims.get("height")
        print(f"{art['title']}: {dims.get('width')}x{dims.get('height')}")

        if args.generate_thumbs:
            thumb_path = image_path + ".avif"
            print(f"  Generating thumbnail: {thumb_path}")
            if generate_thumbnail(image_path, thumb_path):
                art["thumbImageUrl"] = art["imageUrl"] + ".avif"
                print(f"  Thumbnail created successfully")
            else:
                print(f"  Thumbnail generation failed")

    if args.update_config:
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print(f"\nUpdated {config_path} with dimensions")
        if args.generate_thumbs:
            print("Added thumbImageUrl fields for generated thumbnails")
    else:
        print("\n--- JSON Output ---\n")
        print(json.dumps(config.get("art", []), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
