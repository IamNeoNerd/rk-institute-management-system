const fs = require('fs');
const path = require('path');
const glob = require('glob');

class VitestMigrator {
  constructor() {
    this.migrationLog = [];
    this.errorLog = [];
  }

  migrateTestFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Remove Jest environment docblock
      content = content.replace(/\/\*\*\s*\n\s*\*\s*@jest-environment\s+\w+\s*\n\s*\*\/\s*\n/g, '');

      // Update imports - handle multiple patterns
      content = content.replace(
        /import\s+{([^}]+)}\s+from\s+['"]@jest\/globals['"]/g,
        'import { $1, vi } from \'vitest\''
      );

      // Add vi import if jest functions are used but not imported
      if (content.includes('jest.') && !content.includes('import { vi }') && !content.includes('from \'vitest\'')) {
        const firstImport = content.indexOf('import');
        if (firstImport !== -1) {
          content = content.slice(0, firstImport) + 
            'import { vi } from \'vitest\';\n' + 
            content.slice(firstImport);
        }
      }

      // Update Jest globals to Vitest
      content = content.replace(/jest\.mock\(/g, 'vi.mock(');
      content = content.replace(/jest\.fn\(/g, 'vi.fn(');
      content = content.replace(/jest\.spyOn\(/g, 'vi.spyOn(');
      content = content.replace(/jest\.clearAllMocks\(/g, 'vi.clearAllMocks(');
      content = content.replace(/jest\.resetAllMocks\(/g, 'vi.resetAllMocks(');
      content = content.replace(/jest\.restoreAllMocks\(/g, 'vi.restoreAllMocks(');

      // Update timer mocks
      content = content.replace(/jest\.useFakeTimers\(/g, 'vi.useFakeTimers(');
      content = content.replace(/jest\.useRealTimers\(/g, 'vi.useRealTimers(');
      content = content.replace(/jest\.advanceTimersByTime\(/g, 'vi.advanceTimersByTime(');
      content = content.replace(/jest\.runAllTimers\(/g, 'vi.runAllTimers(');

      // Update module mocks
      content = content.replace(/jest\.requireActual\(/g, 'await vi.importActual(');

      // Update mock implementations for Vitest compatibility
      content = content.replace(
        /\.mockImplementation\(\(\) => \{([^}]+)\}\)/g,
        '.mockImplementation(() => ({ $1 }))'
      );

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.migrationLog.push(`✅ Migrated: ${filePath}`);
        console.log(`✅ Migrated: ${filePath}`);
      } else {
        this.migrationLog.push(`ℹ️  No changes needed: ${filePath}`);
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }

    } catch (error) {
      this.errorLog.push(`❌ Error migrating ${filePath}: ${error.message}`);
      console.error(`❌ Error migrating ${filePath}:`, error.message);
    }
  }

  async migrateAllTests() {
    console.log('🚀 Starting Vitest migration...\n');

    // Find all test files
    const testFiles = glob.sync('__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}');
    
    console.log(`Found ${testFiles.length} test files to migrate:\n`);

    // Migrate each file
    testFiles.forEach(file => this.migrateTestFile(file));

    // Generate migration report
    this.generateReport();
  }

  generateReport() {
    const reportPath = 'migration-backup/migration-report.md';
    const report = `# Vitest Migration Report

## Summary
- **Total files processed**: ${this.migrationLog.length}
- **Successful migrations**: ${this.migrationLog.filter(log => log.includes('✅')).length}
- **Files with no changes**: ${this.migrationLog.filter(log => log.includes('ℹ️')).length}
- **Errors**: ${this.errorLog.length}

## Migration Log
${this.migrationLog.join('\n')}

## Errors
${this.errorLog.join('\n')}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📊 Migration report saved to: ${reportPath}`);
  }
}

// Run migration
const migrator = new VitestMigrator();
migrator.migrateAllTests();
