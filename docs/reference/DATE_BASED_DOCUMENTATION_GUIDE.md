---
title: 'Date-Based Documentation Access Guide'
description: 'Complete guide for finding and organizing documentation by date'
created: '2025-01-07'
modified: '2025-01-07'
version: '1.0'
type: 'reference-guide'
audience: 'all-users'
status: 'active'
---

# 📅 Date-Based Documentation Access Guide

This guide provides comprehensive methods for finding, organizing, and accessing documentation based on creation dates, modification dates, and time periods.

## 🎯 Quick Access Methods

### **1. Chronological Index** (Recommended)

- **[📅 Chronological Index](../CHRONOLOGICAL_INDEX.md)** - Auto-generated date-based navigation
- **Updated**: Automatically via script
- **Coverage**: All documentation files
- **Sorting**: By modification date (newest first)

### **2. Git-Based Date Search**

```bash
# Find files modified in last 7 days
git log --since="7 days ago" --name-only --pretty=format: docs/ | sort | uniq

# Find files created yesterday
git log --since="yesterday" --until="today" --diff-filter=A --name-only docs/

# Find files modified in specific date range
git log --since="2025-01-01" --until="2025-01-07" --name-only docs/

# Show creation date for specific file
git log --diff-filter=A --format="%ai %s" -- docs/README.md | tail -1

# Show last modification date for specific file
git log -1 --format="%ai %s" -- docs/README.md
```

### **3. File System Date Search**

```bash
# Find files modified in last 7 days (Linux/Mac)
find docs/ -name "*.md" -mtime -7

# Find files modified today (Linux/Mac)
find docs/ -name "*.md" -mtime 0

# Find files by modification date (Windows PowerShell)
Get-ChildItem docs/ -Recurse -Filter "*.md" | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-7)}
```

## 📊 Date-Based Organization Methods

### **Method 1: YAML Front Matter** (Industry Standard)

Each documentation file includes metadata in YAML front matter:

```yaml
---
title: 'Document Title'
description: 'Brief description'
created: '2025-01-07'
modified: '2025-01-07'
version: '1.0'
type: 'user-guide'
audience: 'administrators'
status: 'active'
---
```

**Benefits:**

- ✅ Explicit date tracking
- ✅ Additional metadata (version, type, audience)
- ✅ Compatible with static site generators
- ✅ Machine-readable for automation

### **Method 2: Git History Tracking** (Automatic)

Leverages Git's built-in version control:

```bash
# Creation date (first commit)
git log --diff-filter=A --format="%ai" -- docs/README.md | tail -1

# Last modification date
git log -1 --format="%ai" -- docs/README.md

# All modification dates
git log --format="%ai %s" -- docs/README.md
```

**Benefits:**

- ✅ Automatic tracking
- ✅ Complete history
- ✅ No manual maintenance
- ✅ Includes commit messages

### **Method 3: File System Timestamps** (Fallback)

Uses operating system file metadata:

```bash
# Linux/Mac: Show file timestamps
stat docs/README.md

# Windows: Show file timestamps
Get-ItemProperty docs/README.md | Select-Object CreationTime, LastWriteTime
```

**Benefits:**

- ✅ Always available
- ✅ No setup required
- ❌ Can be unreliable (file copies, moves)

## 🔍 Search Strategies by Use Case

### **"Show me documents created yesterday"**

```bash
# Method 1: Git-based (most reliable)
git log --since="yesterday" --until="today" --diff-filter=A --name-only docs/

# Method 2: File system (fallback)
find docs/ -name "*.md" -newerct "yesterday"
```

### **"Show me documents modified in the last week"**

```bash
# Method 1: Git-based
git log --since="1 week ago" --name-only --pretty=format: docs/ | sort | uniq

# Method 2: Chronological Index
# Check "Last 7 Days" section in docs/CHRONOLOGICAL_INDEX.md
```

### **"Show me all documents from January 2025"**

```bash
# Method 1: Git-based
git log --since="2025-01-01" --until="2025-02-01" --name-only docs/

# Method 2: YAML front matter search
grep -r "created.*2025-01" docs/ --include="*.md"
```

### **"Show me the newest documentation"**

```bash
# Method 1: Git-based (most recent commits)
git log --name-only --pretty=format: docs/ | head -20

# Method 2: Chronological Index
# Check top of docs/CHRONOLOGICAL_INDEX.md
```

## 🛠️ Automation Tools

### **Chronological Index Generator**

Automatically creates date-based indexes:

```bash
# Generate chronological index
npm run docs:chronological

# Or run directly
node scripts/generate-chronological-index.js
```

**Features:**

- Scans all documentation files
- Extracts dates from Git, YAML, and file system
- Generates sortable tables
- Groups by time periods and categories
- Auto-updates with current data

### **Date Metadata Validator**

Ensures consistent date tracking:

```bash
# Check for missing YAML front matter
grep -L "^---" docs/**/*.md

# Validate date formats
grep -r "created:" docs/ --include="*.md" | grep -v "202[0-9]-[0-1][0-9]-[0-3][0-9]"
```

## 📋 Best Practices

### **For Document Authors**

1. **Always add YAML front matter** with creation date
2. **Update modified date** when making significant changes
3. **Use consistent date format**: `YYYY-MM-DD`
4. **Include descriptive commit messages** for Git history

### **For Documentation Maintainers**

1. **Run chronological index generator** monthly
2. **Validate date metadata** during reviews
3. **Archive outdated documents** to maintain relevance
4. **Use Git tags** for major documentation releases

### **For Documentation Users**

1. **Start with chronological index** for date-based searches
2. **Use Git commands** for detailed history
3. **Check YAML metadata** for document context
4. **Bookmark frequently accessed time periods**

## 🔧 Implementation Examples

### **Adding Date Metadata to New Documents**

```markdown
---
title: 'New Feature Guide'
description: 'Guide for using the new feature'
created: '2025-01-07'
modified: '2025-01-07'
version: '1.0'
type: 'user-guide'
audience: 'end-users'
status: 'active'
---

# New Feature Guide

Content goes here...
```

### **Updating Existing Documents**

```markdown
---
title: 'Updated Feature Guide'
description: 'Guide for using the updated feature'
created: '2024-12-15'
modified: '2025-01-07' # Updated this date
version: '1.1' # Incremented version
type: 'user-guide'
audience: 'end-users'
status: 'active'
---
```

### **Archiving Old Documents**

```markdown
---
title: 'Legacy Feature Guide'
description: 'Guide for deprecated feature'
created: '2024-06-15'
modified: '2024-12-01'
version: '1.0'
type: 'user-guide'
audience: 'end-users'
status: 'deprecated' # Changed status
archived: '2025-01-07' # Added archive date
---
```

## 📊 Date-Based Reporting

### **Monthly Documentation Report**

```bash
# Documents created this month
git log --since="1 month ago" --diff-filter=A --name-only docs/ | wc -l

# Documents modified this month
git log --since="1 month ago" --name-only docs/ | sort | uniq | wc -l

# Most active documentation areas
git log --since="1 month ago" --name-only docs/ | cut -d'/' -f2 | sort | uniq -c | sort -nr
```

### **Quarterly Documentation Audit**

```bash
# Generate comprehensive chronological index
npm run docs:chronological

# Find documents not modified in 6 months
git log --name-only --since="6 months ago" docs/ | sort | uniq > recent.txt
find docs/ -name "*.md" | grep -v -f recent.txt
```

## 🚀 Advanced Features

### **Integration with Static Site Generators**

- **Jekyll**: Automatic date parsing from YAML front matter
- **Hugo**: Built-in date-based organization and filtering
- **Gatsby**: GraphQL queries for date-based content

### **API for Date-Based Access**

```javascript
// Example: Get documents by date range
const getDocumentsByDateRange = (startDate, endDate) => {
  return documents.filter(doc => {
    const docDate = new Date(doc.modified || doc.created);
    return docDate >= startDate && docDate <= endDate;
  });
};
```

---

**💡 This guide provides multiple methods for date-based documentation access. Choose the method that best fits your workflow and technical requirements.**

**🔄 Last Updated**: January 7, 2025  
**📊 Methods Covered**: 3 primary methods + automation tools  
**🎯 Use Cases**: 10+ common scenarios with examples
