const fs = require('fs');
const path = require('path');

const glob = require('glob');

class DynamicImportFixer {
  constructor() {
    this.fixLog = [];
    this.errorLog = [];
  }

  fixTestFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Pattern 1: Simple dynamic require in test functions
      // require('@/lib/config/FeatureFlags') -> await vi.importActual('@/lib/config/FeatureFlags')
      content = content.replace(
        /const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"](@\/[^'"]+)['"]\);?/g,
        "const { $1 } = await vi.importActual('$2');"
      );

      // Pattern 2: Simple variable assignment
      // const module = require('@/lib/...') -> const module = await vi.importActual('@/lib/...')
      content = content.replace(
        /const\s+(\w+)\s*=\s*require\(['"](@\/[^'"]+)['"]\);?/g,
        "const $1 = await vi.importActual('$2');"
      );

      // Pattern 3: Direct require calls in expect statements
      // expect(() => { require('@/lib/...') }) -> expect(async () => { await import('@/lib/...') })
      content = content.replace(
        /expect\(\(\)\s*=>\s*{\s*require\(['"](@\/[^'"]+)['"]\);?\s*}\)/g,
        "expect(async () => { await import('$1'); })"
      );

      // Pattern 4: Convert test functions to async when they use dynamic imports
      content = content.replace(
        /(test|it)\(['"]([^'"]+)['"],\s*\(\)\s*=>\s*{/g,
        (match, testType, testName) => {
          // Check if this test block contains await vi.importActual
          const testBlockStart = content.indexOf(match);
          const testBlockEnd = this.findMatchingBrace(
            content,
            testBlockStart + match.length - 1
          );
          const testBlock = content.substring(testBlockStart, testBlockEnd);

          if (
            testBlock.includes('await vi.importActual') ||
            testBlock.includes('await import')
          ) {
            return `${testType}('${testName}', async () => {`;
          }
          return match;
        }
      );

      // Pattern 5: Add vi import if not present and we're using vi.importActual
      if (
        content.includes('vi.importActual') &&
        !content.includes('import { vi }') &&
        !content.includes("from 'vitest'")
      ) {
        // Find the first import statement
        const firstImportMatch = content.match(/^import\s+.*$/m);
        if (firstImportMatch) {
          const firstImportIndex = content.indexOf(firstImportMatch[0]);
          content =
            content.slice(0, firstImportIndex) +
            "import { vi } from 'vitest';\n" +
            content.slice(firstImportIndex);
        }
      }

      // Pattern 6: Fix environment variable testing pattern
      content = content.replace(
        /(process\.env\.\w+\s*=\s*['"][^'"]*['"];?\s*vi\.resetModules\(\);?\s*)const\s+{\s*([^}]+)\s*}\s*=\s*await\s+vi\.importActual\(['"](@\/[^'"]+)['"]\);/g,
        "$1delete require.cache[require.resolve('$3')];\n      const { $2 } = await vi.importActual('$3');"
      );

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixLog.push(`✅ Fixed dynamic imports: ${filePath}`);
        console.log(`✅ Fixed dynamic imports: ${filePath}`);
      } else {
        this.fixLog.push(`ℹ️  No dynamic import issues found: ${filePath}`);
        console.log(`ℹ️  No dynamic import issues found: ${filePath}`);
      }
    } catch (error) {
      this.errorLog.push(`❌ Error fixing ${filePath}: ${error.message}`);
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  findMatchingBrace(content, startIndex) {
    let braceCount = 1;
    let index = startIndex + 1;

    while (index < content.length && braceCount > 0) {
      if (content[index] === '{') {
        braceCount++;
      } else if (content[index] === '}') {
        braceCount--;
      }
      index++;
    }

    return index;
  }

  async fixAllTests() {
    console.log('🔧 Starting dynamic import fixes...\n');

    // Find all test files that likely have dynamic import issues
    const testFiles = glob.sync('__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}');

    console.log(`Found ${testFiles.length} test files to analyze:\n`);

    // Fix each file
    testFiles.forEach(file => this.fixTestFile(file));

    // Generate fix report
    this.generateReport();
  }

  generateReport() {
    const reportPath = 'migration-backup/dynamic-import-fixes-report.md';
    const report = `# Dynamic Import Fixes Report

## Summary
- **Total files processed**: ${this.fixLog.length}
- **Files with fixes applied**: ${this.fixLog.filter(log => log.includes('✅')).length}
- **Files with no issues**: ${this.fixLog.filter(log => log.includes('ℹ️')).length}
- **Errors**: ${this.errorLog.length}

## Fix Log
${this.fixLog.join('\n')}

## Errors
${this.errorLog.join('\n')}

## Next Steps
1. Run tests to verify fixes: \`npm test -- --run\`
2. Manually review any remaining failures
3. Update test patterns as needed

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📊 Fix report saved to: ${reportPath}`);
  }
}

// Run the fixer
const fixer = new DynamicImportFixer();
fixer.fixAllTests();
