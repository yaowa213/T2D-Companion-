import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const checklist = [
  { name: 'Auth Guarding', file: 'app/Router.tsx', contains: 'RequireAuth' },
  { name: 'Legal Gate Enforcement', file: 'app/Router.tsx', contains: 'RequireLegal' },
  { name: 'Onboarding Enforcement', file: 'app/Router.tsx', contains: 'RequireOnboarding' },
  { name: 'Offline Banner Presence', file: 'components/Layout.tsx', contains: 'OfflineBanner' },
  { name: 'POPIA Export Button', file: 'features/settings/SettingsPage.tsx', contains: 'handleExportData' },
  { name: 'POPIA Delete Button', file: 'features/settings/SettingsPage.tsx', contains: 'handleDeleteAccount' },
  { name: 'Outbox Sync Engine', file: 'App.tsx', contains: 'syncEngine.startSyncLoop' }
];

let failed = false;

console.log('🚀 Running Go/No-Go Checklist...\n');

checklist.forEach(item => {
  try {
    const content = fs.readFileSync(path.join(ROOT, item.file), 'utf-8');
    if (content.includes(item.contains)) {
      console.log(`✅ [PASS] ${item.name}`);
    } else {
      console.error(`❌ [FAIL] ${item.name}: Missing ${item.contains} in ${item.file}`);
      failed = true;
    }
  } catch (e) {
    console.error(`❌ [ERROR] ${item.name}: Could not read ${item.file}`);
    failed = true;
  }
});

if (failed) {
  console.error('\n🛑 Release checklist failed. Do not deploy.');
  // Fix: Cast process to any to access exit() when types are not correctly defined in the environment
  (process as any).exit(1);
} else {
  console.log('\n🌟 All checks passed. Ready for deployment.');
}