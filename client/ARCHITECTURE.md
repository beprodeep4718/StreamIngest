# Client Architecture

The client is now organized into a clean, scalable Next.js structure using the App Router.

## Folder Structure

```
app/
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── page.tsx                # Home/landing page (navigation hub)
├── upload/
│   └── page.tsx            # Upload page with live progress
├── dashboard/
│   └── page.tsx            # Analytics dashboard with auto-refresh
├── components/             # Reusable React components
│   ├── Header.tsx          # Navigation header with logo
│   ├── DropZone.tsx        # File drop area component
│   ├── UploadProgress.tsx  # Job progress panel
│   └── AnalyticsDashboard.tsx # Analytics cards & metrics
└── lib/                    # Utilities & types
    ├── types.ts            # TypeScript type definitions
    └── api.ts              # API client functions
```

## Page Routes

- **`/`** – Landing page with navigation to upload and dashboard
- **`/upload`** – CSV file upload with live progress tracking and inline analytics
- **`/dashboard`** – Dedicated analytics dashboard with auto-refresh every 30s

## Components

### Header
Renders the Parsr logo in the top-left with a clickable link back to home.

### DropZone
Reusable drag-drop file input for CSV selection.

### UploadProgress
Displays job ID, progress bars, stats grid, and completion banners.

### AnalyticsDashboard
Shows KPI cards, session status, trends, age distribution, and top domains.

## API Layer (`lib/api.ts`)

Centralized API client with functions:
- `uploadFile(file)` – POST CSV to backend
- `createProgressStream(jobId)` – Open EventSource for job progress
- `fetchAnalytics()` – GET analytics overview

## Type Definitions (`lib/types.ts`)

All shared TypeScript types for:
- Upload responses
- Progress data
- Analytics data (trends, domains, age buckets)
- Component props

## Styling

Global styles in `globals.css` using CSS variables (dark theme):
- Color tokens: `--bg`, `--surface`, `--accent`, `--green`, `--red`, etc.
- Component classes: `.page`, `.hero`, `.panel`, `.landing-grid`, etc.
- Responsive breakpoints at 640px and 860px
- Smooth animations for progress bars and transitions

## Key Improvements

✓ **Separation of concerns** – Each route/component has a single responsibility
✓ **Reusability** – Components can be used across multiple pages
✓ **Type-safe** – Centralized types prevent prop mismatches
✓ **Maintainability** – Clear file organization makes updates easier
✓ **Scalability** – Easy to add new pages, components, and utilities
✓ **Clean imports** – API and types are centralized, not scattered
