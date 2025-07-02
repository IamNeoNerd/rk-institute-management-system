#!/usr/bin/env node

/**
 * Chronological Documentation Index Generator
 *
 * This script automatically generates a chronological index of all documentation
 * based on Git history, file system timestamps, and YAML front matter.
 *
 * Usage:
 *   node scripts/generate-chronological-index.js
 *   npm run docs:chronological
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ChronologicalIndexGenerator {
  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs');
    this.outputFile = path.join(this.docsDir, 'CHRONOLOGICAL_INDEX.md');
    this.documents = [];
  }

  /**
   * Get Git creation date for a file
   */
  getGitCreationDate(filePath) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      const result = execSync(
        `git log --diff-filter=A --format="%ai" -- "${relativePath}" | tail -1`,
        { encoding: 'utf8' }
      ).trim();
      return result ? new Date(result) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Git last modification date for a file
   */
  getGitModificationDate(filePath) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      const result = execSync(
        `git log -1 --format="%ai" -- "${relativePath}"`,
        { encoding: 'utf8' }
      ).trim();
      return result ? new Date(result) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get file system dates
   */
  getFileSystemDates(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        created: stats.birthtime || stats.ctime,
        modified: stats.mtime
      };
    } catch (error) {
      return { created: null, modified: null };
    }
  }

  /**
   * Parse YAML front matter from markdown file
   */
  parseYamlFrontMatter(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (yamlMatch) {
        const yamlContent = yamlMatch[1];
        const metadata = {};

        yamlContent.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
          }
        });

        return metadata;
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }
    return {};
  }

  /**
   * Get document title from markdown file
   */
  getDocumentTitle(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Remove YAML front matter
      const contentWithoutYaml = content.replace(/^---\n[\s\S]*?\n---\n/, '');

      // Find first H1 heading
      const titleMatch = contentWithoutYaml.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        return titleMatch[1].trim();
      }

      // Fallback to filename
      return path
        .basename(filePath, '.md')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      return path.basename(filePath, '.md');
    }
  }

  /**
   * Categorize document by path
   */
  categorizeDocument(filePath) {
    const relativePath = path.relative(this.docsDir, filePath);
    const pathParts = relativePath.split(path.sep);

    if (pathParts.includes('user-guides')) return 'User Guide';
    if (pathParts.includes('api')) return 'API Documentation';
    if (pathParts.includes('development')) return 'Development Guide';
    if (pathParts.includes('deployment')) return 'Deployment Guide';
    if (pathParts.includes('project-management')) return 'Project Management';
    if (pathParts.includes('getting-started')) return 'Getting Started';
    if (pathParts.includes('reference')) return 'Reference';
    if (pathParts.includes('archive')) return 'Archive';

    return 'General Documentation';
  }

  /**
   * Scan all markdown files in docs directory
   */
  scanDocuments() {
    const scanDir = dir => {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.md')) {
          const gitCreated = this.getGitCreationDate(fullPath);
          const gitModified = this.getGitModificationDate(fullPath);
          const fsData = this.getFileSystemDates(fullPath);
          const yamlData = this.parseYamlFrontMatter(fullPath);

          // Determine best creation and modification dates
          const createdDate = gitCreated || fsData.created;
          const modifiedDate = gitModified || fsData.modified;

          const document = {
            path: fullPath,
            relativePath: path.relative(this.docsDir, fullPath),
            title: this.getDocumentTitle(fullPath),
            category: this.categorizeDocument(fullPath),
            createdDate,
            modifiedDate,
            yamlData,
            size: stat.size
          };

          this.documents.push(document);
        }
      });
    };

    scanDir(this.docsDir);
  }

  /**
   * Generate chronological index markdown
   */
  generateIndex() {
    // Sort documents by modification date (newest first)
    const sortedDocs = this.documents.sort((a, b) => {
      const dateA = a.modifiedDate || a.createdDate || new Date(0);
      const dateB = b.modifiedDate || b.createdDate || new Date(0);
      return dateB - dateA;
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const formatDate = date => {
      if (!date) return 'Unknown';
      return date.toISOString().split('T')[0];
    };

    const generateDocumentTable = (docs, title) => {
      if (docs.length === 0)
        return `### ${title}\n\n*No documents found in this time period.*\n\n`;

      let table = `### ${title}\n\n`;
      table += '| Date | Document | Category | Size |\n';
      table += '|------|----------|----------|------|\n';

      docs.forEach(doc => {
        const date = formatDate(doc.modifiedDate || doc.createdDate);
        const link = `[${doc.title}](${doc.relativePath})`;
        const size = `${Math.round(doc.size / 1024)}KB`;
        table += `| ${date} | ${link} | ${doc.category} | ${size} |\n`;
      });

      return table + '\n';
    };

    // Filter documents by time periods
    const last7Days = sortedDocs.filter(doc => {
      const date = doc.modifiedDate || doc.createdDate;
      return date && date >= sevenDaysAgo;
    });

    const last30Days = sortedDocs.filter(doc => {
      const date = doc.modifiedDate || doc.createdDate;
      return date && date >= thirtyDaysAgo;
    });

    const last90Days = sortedDocs.filter(doc => {
      const date = doc.modifiedDate || doc.createdDate;
      return date && date >= ninetyDaysAgo;
    });

    // Group by category
    const byCategory = {};
    sortedDocs.forEach(doc => {
      if (!byCategory[doc.category]) {
        byCategory[doc.category] = [];
      }
      byCategory[doc.category].push(doc);
    });

    // Generate markdown content
    let content = `# 📅 Chronological Documentation Index

*Auto-generated on ${formatDate(now)}*

This index provides **date-based access** to all documentation, automatically updated based on Git history and file system data.

## 🔍 Quick Access by Time Period

${generateDocumentTable(last7Days, '📅 Last 7 Days')}
${generateDocumentTable(last30Days, '📅 Last 30 Days')}
${generateDocumentTable(last90Days, '📅 Last 90 Days')}

## 📂 Documents by Category

`;

    // Add category sections
    Object.keys(byCategory)
      .sort()
      .forEach(category => {
        content += generateDocumentTable(
          byCategory[category],
          `${category} Documents`
        );
      });

    content += `## 🔧 Maintenance Information

- **Total Documents**: ${this.documents.length}
- **Last Generated**: ${formatDate(now)}
- **Generator**: \`scripts/generate-chronological-index.js\`

### Regenerate This Index

\`\`\`bash
# Regenerate chronological index
node scripts/generate-chronological-index.js

# Or use npm script
npm run docs:chronological
\`\`\`

### Git Commands for Date-Based Search

\`\`\`bash
# Files modified in last 7 days
git log --since="7 days ago" --name-only --pretty=format: docs/ | sort | uniq

# Files created between specific dates
git log --since="2025-01-01" --until="2025-01-07" --diff-filter=A --name-only docs/

# Last modification date for specific file
git log -1 --format="%ai" -- docs/README.md
\`\`\`

---

**💡 This index is automatically generated. To update, run the generator script.**
`;

    return content;
  }

  /**
   * Write the generated index to file
   */
  writeIndex() {
    const content = this.generateIndex();
    fs.writeFileSync(this.outputFile, content, 'utf8');
    console.log(`✅ Chronological index generated: ${this.outputFile}`);
    console.log(`📊 Indexed ${this.documents.length} documents`);
  }

  /**
   * Main execution method
   */
  run() {
    console.log('🔍 Scanning documentation files...');
    this.scanDocuments();

    console.log('📅 Generating chronological index...');
    this.writeIndex();

    console.log('✨ Done!');
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new ChronologicalIndexGenerator();
  generator.run();
}

module.exports = ChronologicalIndexGenerator;
