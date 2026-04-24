# TableContainer.tsx - Code Review & Documentation

## Component Overview

**Purpose:** Flexible, reusable data table component supporting both server-side and client-side pagination, filtering, and sorting.

**Framework:** Built on [TanStack React Table v8](https://tanstack.com/table/v8)

**File:** `src/Components/Common/TableContainer.tsx`

---

## Architecture

### Component Structure

```
TableContainer (Main Component)
├── DebouncedInput (Nested Component)
│   └── Handles 500ms debounced search input
├── React Table (useReactTable hook)
│   ├── Core row model
│   ├── Filtering row model
│   ├── Pagination row model
│   └── Sorting row model
└── UI (Reactstrap components)
    ├── Search box
    ├── Table (thead, tbody)
    └── Pagination controls
```

---

## Key Features

### 1. **DebouncedInput Component** (Lines 21-55)

**Purpose:** Search input with 500ms debounce to reduce API calls

```typescript
const DebouncedInput = ({
  value: initialValue,           // Prop from parent
  onChange,                       // Callback after debounce
  debounce = 500,                // Debounce delay (ms)
  ...props
}) => {
  const [value, setValue] = useState(initialValue);
  const firstRun = useRef(true);

  // Sync local value with prop
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Call onChange after debounce
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;  // Skip first render
    }

    const timeout = setTimeout(() => {
      onChange(String(value));
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
};
```

**How it works:**
1. User types "VCL" → `value` state becomes "VCL"
2. Input shows "VCL" immediately (local state)
3. After 500ms of no typing → `onChange("VCL")` called
4. Parent updates `globalFilter`
5. Parent re-renders and passes `value="VCL"` prop
6. Input remains "VCL"

**Why it matters:** Prevents API calls on every keystroke

---

### 2. **Props Interface** (Lines 60-81)

```typescript
interface TableContainerProps<T> {
  // Core
  columns: ColumnDef<T, any>[];      // TanStack column definitions
  data: T[];                          // Row data

  // Server-side pagination
  isServerSidePagination?: boolean;   // Enable/disable server mode
  onServerChange?: (query) => void;   // Callback for changes

  // Server state props
  serverSideTotalRecords?: number;    // From server
  serverSideCurrentPage?: number;     // From server
  serverSidePageSize?: number;        // From server
  serverSideTotalPages?: number;      // From server
  serverSideSearchTerm?: string;      // From parent (NEW)

  // Features
  isGlobalFilter?: boolean;           // Show search box
  isPagination?: boolean;             // Show pagination
  isCustomPageSize?: boolean;         // Show page size dropdown

  // Add button
  buttonName?: string;                // Button text
  buttonClass?: string;               // Button CSS class
  isAddButton?: boolean;              // Show button
  handleUserClick?: () => void;       // Button click handler
}
```

---

### 3. **State Management** (Lines 107-123)

```typescript
// Local UI state (in TableContainer)
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [globalFilter, setGlobalFilter] = useState("");       // Search term
const [sorting, setSorting] = useState<SortingState>([]);

// Local page tracking
const [localPage, setLocalPage] = useState(serverSideCurrentPage);

// Sync page with prop (from Redux)
useEffect(() => {
  setLocalPage(serverSideCurrentPage);
}, [serverSideCurrentPage]);

// Sync search with prop (NEW FIX)
useEffect(() => {
  setGlobalFilter(serverSideSearchTerm);
}, [serverSideSearchTerm]);
```

**Why separate `localPage`?**
- `localPage` updates immediately when user clicks pagination → shows active CSS instantly
- `serverSideCurrentPage` comes from Redux API response (can be delayed)
- `localPage` syncs with `serverSideCurrentPage` when prop updates
- Provides optimal UX (instant visual feedback + eventual data consistency)

---

### 4. **Query Builder** (Lines 137-144)

```typescript
const buildQuery = (override: any = {}) => ({
  page: localPage,                    // Current page
  pageSize: serverSidePageSize,       // Items per page
  search: globalFilter,               // Search term
  filters: columnFilters,             // Column filters
  sorting,                            // Sort order
  ...override                         // Override specific fields
});
```

**Used in:**
- Pagination button clicks: `buildQuery({ page: 3 })`
- Page size change: `buildQuery({ page: 1, pageSize: 50 })`
- Search: `buildQuery({ search: "VCL", page: 1 })`

**Why spread override last?** Ensures new values override defaults

---

### 5. **React Table Configuration** (Lines 149-188)

```typescript
const table = useReactTable({
  columns,
  data,

  state: {
    columnFilters,
    globalFilter,
    sorting,
    // For server-side: use localPage
    ...(isServerSidePagination && {
      pagination: {
        pageIndex: localPage - 1,  // Convert 1-based to 0-based
        pageSize: serverSidePageSize,
      },
    }),
  },

  // Manual modes for server-side
  manualPagination: isServerSidePagination,
  manualFiltering: isServerSidePagination,
  manualSorting: isServerSidePagination,

  // Total pages for server-side
  pageCount: isServerSidePagination ? serverSideTotalPages : undefined,

  // Handlers
  onColumnFiltersChange: (filters) => {
    setColumnFilters(filters);
    if (isServerSidePagination) {
      setLocalPage(1);  // Reset to page 1 when filtering
      onServerChange?.(buildQuery({ filters, page: 1 }));
    }
  },

  onGlobalFilterChange: setGlobalFilter,

  onSortingChange: (sort) => {
    setSorting(sort);
    if (isServerSidePagination) {
      setLocalPage(1);  // Reset to page 1 when sorting
      onServerChange?.(buildQuery({ sorting: sort, page: 1 }));
    }
  },

  // For client-side only
  globalFilterFn: isServerSidePagination ? undefined : fuzzyFilter,

  // Row models
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: isServerSidePagination ? undefined : getFilteredRowModel(),
  getPaginationRowModel: isServerSidePagination ? undefined : getPaginationRowModel(),
  getSortedRowModel: isServerSidePagination ? undefined : getSortedRowModel(),
});
```

**Key Concepts:**

1. **Manual Modes:** When server-side is true, TanStack doesn't do filtering/sorting/pagination - parent component does it
2. **pageIndex vs localPage:** TanStack uses 0-based `pageIndex`, we use 1-based `localPage`
3. **globalFilterFn:** Only used for client-side fuzzy search

---

### 6. **Pagination Controls** (Lines 341-410)

#### Previous Button (Lines 343-360)

```typescript
<button
  disabled={isServerSidePagination ? localPage === 1 : !getCanPreviousPage()}
  onClick={() => {
    if (isServerSidePagination) {
      const prev = localPage - 1;
      setLocalPage(prev);                    // Update immediately
      onServerChange?.(buildQuery({ page: prev }));  // Call parent
    } else {
      previousPage();  // React Table handles it
    }
  }}
>
  {"<<"}
</button>
```

**Flow:**
1. `setLocalPage(prev)` → Instant visual update
2. `onServerChange` → Parent fetches data
3. Parent passes `serverSideCurrentPage={prev}` prop
4. TableContainer syncs `localPage=prev` (via useEffect)

#### Page Numbers (Lines 362-385)

```typescript
{getVisiblePages().map(page => {
  const current = isServerSidePagination ? localPage : pageIndex + 1;

  return (
    <li className={`page-item ${current === page ? "active" : ""}`}>
      <button onClick={() => {
        if (isServerSidePagination) {
          setLocalPage(page);
          onServerChange?.(buildQuery({ page }));
        } else {
          setPageIndex(page - 1);
        }
      }}>
        {page}
      </button>
    </li>
  );
})}
```

**Active Class Logic:**
- Uses `localPage` for comparison
- Shows `active` when `localPage === page`
- Instant feedback for user clicks

#### Next Button (Lines 387-404)

```typescript
<button
  disabled={isServerSidePagination ? localPage === serverSideTotalPages : !getCanNextPage()}
  onClick={() => {
    if (isServerSidePagination) {
      const next = localPage + 1;
      setLocalPage(next);
      onServerChange?.(buildQuery({ page: next }));
    } else {
      nextPage();
    }
  }}
>
  {">>"}
</button>
```

---

## Data Flow Analysis

### Server-Side Pagination (High-Level)

```
┌─────────────────────────────────────────────────────────┐
│             Parent Component (ClinicExample)             │
│  State: pageNumber, pageSize, searchTerm, Redux state   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Passes props
                    ↓
┌─────────────────────────────────────────────────────────┐
│          TableContainer (This Component)                 │
│  State: globalFilter, localPage, columnFilters, sorting │
│                                                          │
│  User clicks page 2                                     │
│  ├─ setLocalPage(2) ← Updates immediately              │
│  └─ onServerChange({ page: 2, ... })                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Callback
                    ↓
┌─────────────────────────────────────────────────────────┐
│  Parent: handleServerChange                             │
│  ├─ setPageNumber(2) ← Updates local state              │
│  └─ Triggers useEffect                                  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ useEffect detects change
                    ↓
┌─────────────────────────────────────────────────────────┐
│  dispatch(fetchClinics({ pageNumber: 2 }))            │
│  └─ API call: /api/clinic?pagenumber=2                 │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ API returns data
                    ↓
┌─────────────────────────────────────────────────────────┐
│  Redux updates: currentPage = 2                         │
│  └─ dispatch(setPagination({currentPage: 2, ...}))     │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Props change
                    ↓
┌─────────────────────────────────────────────────────────┐
│  TableContainer receives: serverSideCurrentPage={2}     │
│  └─ useEffect([serverSideCurrentPage]) triggers        │
│      └─ setLocalPage(2) (already 2, no-op)            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Re-render
                    ↓
┌─────────────────────────────────────────────────────────┐
│  Table shows page 2 data                                │
│  Active CSS on page 2 button ✓                          │
└─────────────────────────────────────────────────────────┘
```

### Client-Side Pagination (High-Level)

```
User clicks page 2
    ↓
TableContainer.onClick
    ├─ setPageIndex(1) ← 0-based index
    └─ React Table recalculates rows
    ↓
getPaginationRowModel() runs
    ├─ Filters data[10:20] for page 2
    └─ Returns 10 items
    ↓
Table re-renders with page 2 items
Active CSS on page 2 button ✓
```

---

## Common Issues & Solutions

### Issue 1: Search Box Clears After Search

**Symptom:** Type "VCL", get results, search box is empty

**Root Cause:** `serverSideSearchTerm` not passed from parent

**Solution:**
```typescript
// Add this prop
<TableContainer
  serverSideSearchTerm={searchTerm}  // ← CRITICAL
  ...
/>
```

---

### Issue 2: Active Button Wrong

**Symptom:** On page 3 but page 1 button shows active

**Root Cause:** `serverSideCurrentPage` not updating from Redux

**Solution:** In thunk, use requested page (not API response):
```typescript
const currentPage = params.pageNumber || 1;  // ← Correct
dispatch(setPagination({ currentPage, ... }));
```

---

### Issue 3: Multiple API Calls

**Symptom:** Clicking page 2 makes 2+ API calls

**Root Cause:** No duplicate prevention

**Solution:** Use `useRef` to track last query:
```typescript
const lastQueryRef = useRef<string>('');

useEffect(() => {
  const query = JSON.stringify({ pageNumber, pageSize, search });
  if (lastQueryRef.current === query) return;
  lastQueryRef.current = query;
  dispatch(fetchClinics({ ... }));
}, [pageNumber, pageSize, search]);
```

---

## Performance Considerations

### Memoization

✅ **Memoize columns:**
```typescript
const columns = useMemo(() => [...], []);
```

❌ **Don't memoize every render:**
```typescript
// Bad - recreates every render
const columns = [
  { header: 'Name', ... },
];
```

### Debouncing

✅ **Search is debounced (500ms)** - Good for API calls

❌ **Don't reduce debounce below 300ms** - Increases API load

---

## Security Considerations

⚠️ **Search Input Sanitization**

```typescript
// Current: No sanitization
const query = JSON.stringify({ search: globalFilter });

// Better: Sanitize input
const query = JSON.stringify({ 
  search: globalFilter.trim().slice(0, 100)  // Max 100 chars
});
```

⚠️ **XSS Protection**

The component uses `flexRender` from TanStack which handles escaping. Custom cell renders should still be careful:

```typescript
// Safe - TanStack escapes
cell: (cell: any) => <span>{cell.getValue()}</span>

// Risky - Direct HTML
cell: (cell: any) => <div dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('TableContainer', () => {
  it('renders table with columns', () => {
    // Test basic rendering
  });

  it('shows pagination controls', () => {
    // Test pagination UI
  });

  it('calls onServerChange on page click', () => {
    // Test server-side callback
  });

  it('updates localPage on serverSideCurrentPage change', () => {
    // Test prop sync
  });

  it('persists search term from prop', () => {
    // Test serverSideSearchTerm sync
  });
});
```

### Integration Tests

```typescript
describe('ClinicList with TableContainer', () => {
  it('fetches page 2 when user clicks page 2', async () => {
    // Full integration test
  });

  it('keeps search term in box after search', async () => {
    // Test search persistence
  });
});
```

---

## Recommendations

### ✅ Current Strengths

1. **Flexible:** Works for both server-side and client-side
2. **Reusable:** Used across multiple components
3. **Feature-rich:** Search, filter, sort, pagination
4. **Well-integrated:** Uses TanStack React Table v8
5. **Debounced input:** Prevents excessive API calls
6. **Synced state:** `serverSideSearchTerm` prop keeps search persistent

### 📋 Potential Improvements

1. **Add TypeScript generics** for better type safety
   ```typescript
   interface TableContainerProps<TData> {
     columns: ColumnDef<TData>[];
     data: TData[];
   }
   ```

2. **Extract pagination logic** into custom hook
   ```typescript
   const usePagination = (isServer: boolean) => {
     // Page state, handlers, etc.
   };
   ```

3. **Add loading state** for better UX
   ```typescript
   <TableContainer
     isLoading={loading}
     loadingMessage="Loading data..."
   />
   ```

4. **Export column types** for easier use
   ```typescript
   export type TableColumns<T> = ColumnDef<T>[];
   ```

5. **Add column resizing** for better UX
   ```typescript
   const [columnSizing, setColumnSizing] = useState({});
   // Add resizeColumns feature
   ```

---

## Summary

**TableContainer** is a well-designed, production-ready component that:

- ✅ Supports both server-side and client-side pagination
- ✅ Handles search, filtering, and sorting
- ✅ Provides excellent UX with debounced search and instant feedback
- ✅ Properly syncs state between parent and child
- ✅ Reusable across different data tables

**Key to success:** Always pass `serverSideSearchTerm` prop and ensure parent Redux state syncs correctly!
