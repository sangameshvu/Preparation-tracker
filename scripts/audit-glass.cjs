const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// Whitelisted files that are allowed to define or use raw backdrop-filter / backdrop-blur
const WHITELIST = new Set([
  path.normalize(path.join(SRC_DIR, 'styles', 'glass.css')),
  path.normalize(path.join(SRC_DIR, 'components', 'ui', 'dialog.tsx')),
  path.normalize(path.join(SRC_DIR, 'components', 'ui', 'SlideOver.tsx')),
  path.normalize(path.join(SRC_DIR, 'components', 'ui', 'CommandPalette.tsx')),
  path.normalize(path.join(SRC_DIR, 'context', 'StudyTimerContext.tsx'))
]);

const FORBIDDEN_PATTERNS = [
  /backdrop-filter\s*:/i,
  /-webkit-backdrop-filter\s*:/i,
  /\bbackdrop-blur(?:-\w+)?\b/
];

let violations = [];
let totalFilesScanned = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) {
      totalFilesScanned++;
      const normPath = path.normalize(fullPath);
      if (WHITELIST.has(normPath)) {
        continue;
      }
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(path.join(__dirname, '..'), fullPath),
              line: idx + 1,
              matched: line.trim()
            });
            break;
          }
        }
      });
    }
  }
}

console.log('🔍 Starting Liquid Glass Design System Audit...');
scanDir(SRC_DIR);

if (violations.length > 0) {
  console.error(`\n❌ Glass Audit FAILED: Found ${violations.length} unauthorized backdrop-filter / backdrop-blur occurrence(s) outside glass.css and whitelisted UI primitives:\n`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}:${v.line} -> "${v.matched}"`);
  });
  console.error('\nHard Rule: Components must use .glass-thin, .glass-regular, .glass-thick, or .glass-tint classes from src/styles/glass.css.\n');
  process.exit(1);
} else {
  console.log(`\n✓ Glass Audit PASSED: Scanned ${totalFilesScanned} files. All backdrop-filter declarations are strictly governed by src/styles/glass.css and approved primitives.\n`);
  process.exit(0);
}
