import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const prohibitedPatterns = [
  /\bdhcm\b/i,
  /dubai holding/i
];

function checkDirectory(dir: string, fileExtensions: string[]): { file: string; match: string }[] {
  const violations: { file: string; match: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        violations.push(...checkDirectory(fullPath, fileExtensions));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (fileExtensions.includes(ext) && !entry.name.includes('branding.test.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const pattern of prohibitedPatterns) {
          if (pattern.test(content)) {
            violations.push({ file: fullPath, match: pattern.toString() });
          }
        }
      }
    }
  }

  return violations;
}

describe('Anti-Legacy Branding Policy', () => {
  it('should not contain legacy DHCM or Dubai Holding branding in active frontend source files', () => {
    const srcDir = path.resolve(__dirname, '../');
    const violations = checkDirectory(srcDir, ['.ts', '.tsx', '.css']);
    expect(violations).toEqual([]);
  });

  it('should not contain legacy DHCM or Dubai Holding branding in index.html', () => {
    const indexPath = path.resolve(__dirname, '../../index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    for (const pattern of prohibitedPatterns) {
      expect(pattern.test(content)).toBe(false);
    }
  });
});
