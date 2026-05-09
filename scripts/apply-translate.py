#!/usr/bin/env python3
"""
Apply translations from config-translation.json to config.json.
Inserts/updates *_ZH fields (motdZH, descriptionZH, titleZH) with the translated values.
"""

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, "..")
CONFIG_PATH = os.path.join(PROJECT_ROOT, "public", "config.json")
TRANSLATION_PATH = os.path.join(PROJECT_ROOT, "public", "config-translation.json")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "public", "config.json")


def parse_path(path: str):
    """
    Parse a path string into a list of keys/indices.
    e.g., 'servers[0].description' -> [('servers', 'key'), (0, 'idx')]
    """
    parts = []
    # Match either key or [index]
    pattern = r'([a-zA-Z_]\w*)|\[(\d+)\]'
    for match in re.finditer(pattern, path):
        if match.group(1):
            # It's a key
            parts.append(match.group(1))
        elif match.group(2):
            # It's an index
            parts.append(int(match.group(2)))
    return parts


def set_nested_value(obj, path: str, value: str):
    """Set a value in a nested dict/list structure using path notation like 'servers[0].descriptionZH'."""
    parts = parse_path(path)

    # Navigate to the parent (all but last part)
    target = obj
    for key in parts[:-1]:
        if isinstance(key, int):
            target = target[key]
        else:
            target = target[key]

    # Set the final value using the last part's key name
    last_key = parts[-1]
    target[last_key] = value


def main():
    # Load config.json
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    # Load translations
    with open(TRANSLATION_PATH, "r", encoding="utf-8") as f:
        translations = json.load(f)

    applied_count = 0
    for path, translation_data in translations.items():
        zh_value = translation_data.get("zhTW", "")
        if not zh_value:
            # Skip empty translations
            continue

        # Extract the base field to determine the ZH field name
        # Format: siteOwner.motd -> set siteOwner.motdZH
        # Format: music[6].description -> set music[6].descriptionZH
        zh_path = path + "ZH"
        set_nested_value(config, zh_path, zh_value)
        applied_count += 1
        print(f"Applied: {path} -> {zh_path}")

    # Write back to config.json
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nApplied {applied_count} translations to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
