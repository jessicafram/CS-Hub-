import re
import os
from pathlib import Path

def generate_key(file_path, text):
    # Generate a unique key based on file path and text
    relative_path = os.path.relpath(file_path, 'materiais')
    key_base = relative_path.replace('/', '_').replace('\\', '_').replace('.html', '').replace('-', '_')
    text_slug = re.sub(r'[^a-zA-Z0-9]', '_', text[:50]).strip('_').lower()
    return f"materials_{key_base}_{text_slug}"

def add_i18n_to_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = re.compile(r'(<(h[1-6]|p|span|a|button|li|div|strong|em|label|small|option|legend|caption)[^>]*)>([^<\n]+)</', re.IGNORECASE)
    
    translations = {}
    
    def replace_match(match):
        tag_start = match.group(1)
        text = match.group(3).strip()
        if not text or text.isspace() or 'data-i18n' in tag_start:
            return match.group(0)
        key = generate_key(file_path, text)
        translations[key] = text
        return f'{tag_start} data-i18n="{key}">{text}</'
    
    new_content = pattern.sub(replace_match, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return translations

def main():
    materials_path = Path('materiais')
    all_translations = {}
    
    for html_file in materials_path.rglob('*.html'):
        if 'index.html' in str(html_file):  # Skip index files as they already have i18n
            continue
        print(f"Processing {html_file}")
        translations = add_i18n_to_file(html_file)
        all_translations.update(translations)
    
    # Add to translations.js
    translations_js_path = Path('js/translations.js')
    with open(translations_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the pt-br materials section
    pt_br_pattern = re.compile(r'(materials_backend_hero_description: "[^"]*",\n)', re.MULTILINE)
    match = pt_br_pattern.search(content)
    if match:
        insert_point = match.end()
        new_translations = ',\n'.join(f'        {key}: "{value}"' for key, value in all_translations.items())
        new_content = content[:insert_point] + new_translations + ',\n' + content[insert_point:]
        
        with open(translations_js_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
    
    print("Done!")

if __name__ == "__main__":
    main()