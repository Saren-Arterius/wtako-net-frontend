#!/usr/bin/env python3
"""
Extract all translatable strings from config.json and create config-translation.json.
Skips fields that already have a corresponding *_ZH field (e.g., skip 'motd' if 'motdZH' exists).
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, "..")
CONFIG_PATH = os.path.join(PROJECT_ROOT, "public", "config.json")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "public", "config-translation.json")

# Fields that have Chinese translation counterparts
TRANSLATABLE_FIELDS = {"motd", "description"}

# Suffix for translated versions
TRANSLATED_SUFFIX = "ZH"


def extract_strings(obj, path: str, result: dict):
    """Recursively extract translatable strings from nested JSON structures."""
    if isinstance(obj, dict):
        # First, try to extract translatable string fields at this level
        for key in TRANSLATABLE_FIELDS:
            if key not in obj:
                continue

            # Skip if already translated (e.g., skip 'motd' if 'motdZH' exists)
            translated_key = f"{key}{TRANSLATED_SUFFIX}"
            if translated_key in obj:
                continue

            value = obj[key]
            # Build the path
            if path:
                current_path = f"{path}.{key}"
            else:
                current_path = key

            if isinstance(value, str) and value.strip():
                if current_path not in result:
                    result[current_path] = {"en": value, "zhTW": ""}

        # Recurse into all dict values to find nested translatable fields
        for key, value in obj.items():
            if isinstance(value, dict):
                child_path = f"{path}.{key}" if path else key
                extract_strings(value, child_path, result)
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    child_path = f"{path}[{i}]" if path else f"{key}[{i}]"
                    extract_strings(item, child_path, result)

    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            child_path = f"{path}[{i}]"
            extract_strings(item, child_path, result)


def main():
    # Load config.json
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    # Load existing translations (if any) to preserve user work
    translations = {}
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            translations = json.load(f)

    # Extract new translatable strings
    extract_strings(config, "", translations)

    # Sort by key path for consistent output
    sorted_translations = dict(sorted(translations.items()))

    # Write to config-translation.json
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_translations, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Extracted {len(sorted_translations)} translatable strings to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
