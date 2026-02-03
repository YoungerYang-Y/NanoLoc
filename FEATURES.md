# NanoLoc Features Overview

NanoLoc is a comprehensive localization management platform. Below is a detailed breakdown of its key capabilities.

## 1. Project Management
- **Multi-Project Support**: Manage multiple localization projects simultaneously.
- **Language Configuration**:
  - **Base Language**: Select a source language (e.g., English).
  - **Target Languages**: Choose from a comprehensive list of standard languages (e.g., Chinese, Japanese, Spanish) with auto-formatting (Name + Local Name + Code).
- **AI Settings**: Configure AI providers (OpenAI-compatible) per project or use global defaults.
- **Access Control**: Public registration with secure authentication (Email/Password).

## 2. Localization Workflow
### Term Management
- **CRUD Operations**: Create, Read, Update, and Delete translation keys.
- **Inline Editing**: Double-click to edit values directly in the table.
- **Remarks**: Add context or notes for translators. Supports tooltips for viewing long content.
- **Audit Trail**: Tracks "Last Modified By" for every cell to ensure accountability.

### Translation Actions
- **Single Cell Translation**: Click the "Wand" icon on any cell to translate just that item using AI.
- **Row Translation**: Translate an entire row (all missing target languages) with one click.
- **Column Translation**: Translate a specific language column (all missing items) via the column header.
- **Batch Translation**: A powerful global tool that scans the entire project for missing translations and processes them in batches (20 items/batch) with a background worker.
- **Smart Fill**: "Copy English to All" simplifies filling placeholders or untranslated terms.

### Global Indicators
- **Real-time Status**: A prominent, full-width "Translating..." banner appears at the top of the screen whenever *any* translation operation is in progress, preventing conflicting actions.

## 3. Data Integration
### Import
- **Android Support**: Native support for importing `strings.xml`.
- **Conflict Resolution**:
  - Detects existing keys.
  - Updates values with new content.
  - Automatically archives old values to the "Remarks" field for reference.
  - Reports detailed statistics (Added, Updated, Skipped).

### Export
- **CSV Export**: Generate a standard CSV file for all terms.
  - **Excel Compatible**: Includes UTF-8 BOM to ensure correct character rendering in Excel.
  - **Sanitized**: Filenames are sanitized to prevent file system errors.
  - **Clean Output**: "Remarks" column is excluded for cleaner distribution files.

## 4. User Interface (UI)
- **Modern Dashboard**: Built with Shadcn UI and Tailwind CSS for a premium look and feel.
- **Sticky Columns**: "Actions", "Key", and "Remarks" columns remain visible while scrolling horizontally.
- **Advanced Pagination**: Optimized server-side pagination (default 50 items/page) handling large datasets efficiently.
- **Search**: Real-time filtering by Key, Value, or Remarks.
- **Responsive Header**: Global navigation with user profile and sign-out capabilities.

## 5. Technical Highlights
- **Fast & Scalable**: Powered by Next.js 15 App Router and Prisma.
- **Type Safe**: Full TypeScript integration end-to-end.
- **Robust Error Handling**: Comprehensive error trapping for APIs (Import/Export/Translate).
