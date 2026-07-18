import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Heuristic to load banned phrases without full TS module resolution in simple node scripts
const BANNED_PHRASES = [
  'urgent', 'emergency', 'immediately', 'life-threatening', 'call an ambulance',
  'diagnose', 'treatment plan', 'prescribe', 'dosage', 'increase dose', 'decrease dose',
  'risk', 'predict', 'probability', 'you are likely',
  'failed', 'non-compliant', 'bad patient', 'lazy', 'guilty', 'shame',
  'glucose level', 'hba1c', 'target range', 'high sugar', 'low sugar'
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const IGNORE_DIRS = ['node_modules', 'dist', 'scripts', '.git', 'test', 'e2e'];
const IGNORE_FILES = ['copyGuardRules.ts', 'copy-scan.ts'];

let violations = 0;

function scanDir(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDir(fullPath);
      }
    } else if (/\.(ts|tsx|html)$/.test(file) && !IGNORE_FILES.includes(file)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Simple heuristic: ignore comments or imports
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('import')) return;

        BANNED_PHRASES.forEach(phrase => {
          const regex = new RegExp(`\\b${phrase}\\b`, 'i');
          if (regex.test(line)) {
            console.error(`❌ Violation: "${phrase}" found at ${fullPath}:${index + 1}`);
            violations++;
          }
        });
      });
    }
  }
}

console.log('🔍 Starting Copy Scan...');
scanDir(ROOT_DIR);

if (violations > 0) {
  console.error(`\nFound ${violations} safety violations. Build failed.`);
  // Fix: Cast process to any to access exit() when types are not correctly defined in the environment
  (process as any).exit(1);
} else {
  console.log('✅ Copy Scan passed.');
}