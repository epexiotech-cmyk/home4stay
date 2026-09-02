const fs = require('fs');
let content = fs.readFileSync('src/app/(portal)/admin/database/page.tsx', 'utf8');

// Add useAuth import if not present
if (!content.includes('useAuth')) {
    content = content.replace(
        'import { useRouter } from " next/navigation\;',
