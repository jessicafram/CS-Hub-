import re
from pathlib import Path
files = ['index.html', 'hub.html', 'dashboard.html', 'biblioteca.html', 'comunidade.html']
pattern = re.compile(r'<(h[1-6]|p|span|a|button|li|div|strong|em|label|small|option|legend|caption)[^>]*>([^<\n]+)</', re.IGNORECASE)
for f in files:
    path = Path(f)
    print(f'--- {f} ---')
    if not path.exists():
        print('MISSING')
        continue
    content = path.read_text(encoding='utf-8')
    for i, line in enumerate(content.splitlines(), start=1):
        if 'data-i18n' in line:
            continue
        for m in pattern.finditer(line):
            text = m.group(2).strip()
            if text and not text.isspace():
                print(f'{i}: {m.group(0)}')
    print()