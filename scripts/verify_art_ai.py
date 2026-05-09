#!/usr/bin/env python3
"""Verify that all files in public/art/ai are listed in public/config.json"""

import json
import os
from pathlib import Path

CONFIG_PATH = Path("public/config.json")
ART_AI_DIR = Path("public/art/ai")

def main():
    with open(CONFIG_PATH) as f:
        config = json.load(f)

    # Get all files from disk (excluding hidden/comment files)
    disk_files = set()
    for file in ART_AI_DIR.rglob("*"):
        if file.is_file() and not ".comments" in str(file):
            disk_files.add(file.name)

    # Get all referenced files from config
    config_files = set()
    for art in config.get("art", []):
        for key in ["imageUrl", "thumbImageUrl", "extraVideoUrl", "coverUrl"]:
            url = art.get(key, "")
            if url.startswith("/art/ai/"):
                filename = url.split("/")[-1]
                config_files.add(filename)

    print(f"Files on disk:     {len(disk_files)}")
    print(f"Files in config:   {len(config_files)}")
    print()

    missing = disk_files - config_files
    if missing:
        print("Missing in config:")
        for f in sorted(missing):
            print(f"  - {f}")
    else:
        print("All files on disk are listed in config.")

if __name__ == "__main__":
    main()
