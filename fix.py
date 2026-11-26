with open(r'src/presentation/routes/api.router.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
text = re.sub(r'await db\.prepare\(\s*UPDATE users SET', 'await db.prepare(\\n            UPDATE users SET', text)
text = re.sub(r'WHERE id = \?\s*\)\.bind\(', 'WHERE id = ?\\n          ).bind(', text)

with open(r'src/presentation/routes/api.router.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')
