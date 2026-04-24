# TableContainer - Quick Reference Card

## For Developers Using This Component

### Server-Side (What You Probably Need)

```typescript
// 1. State + Redux
const [pageNumber, setPageNumber] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [searchTerm, setSearchTerm] = useState('');

const { list, currentPage, pageSize: reduxPageSize, totalPages, totalRecords } = 
  useSelector(state => state.YourSlice);

// 2. Prevent duplicate API calls
const lastQueryRef = useRef<string>('');
useEffect(() => {
  const query = JSON.stringify({ pageNumber, pageSize, searchTerm });
  if (lastQueryRef.current === query) return;
  lastQueryRef.current = query;
  dispatch(fetchData({ pageNumber, pageSize, search: searchTerm }));
}, [pageNumber, pageSize, searchTerm, dispatch]);

// 3. Handle table changes
const handleServerChange = (query: any) => {
  if (query.page !== undefined) setPageNumber(query.page);
  if (query.pageSize !== undefined) setPageSize(query.pageSize);
  if (query.search !== undefined) setSearchTerm(query.search);
};

// 4. Pass to TableContainer
<TableContainer
  columns={columns}
  data={list}
  isServerSidePagination={true}
  onServerChange={handleServerChange}
  serverSideCurrentPage={currentPage}
  serverSidePageSize={reduxPageSize}
  serverSideTotalPages={totalPages}
  serverSideTotalRecords={totalRecords}
  serverSideSearchTerm={searchTerm}  // ← DON'T FORGET!
  isGlobalFilter={true}
  isPagination={true}
  isCustomPageSize={true}
/>
```

---

### Client-Side (Simple Local Data)

```typescript
// That's it! Just pass data
<TableContainer
  columns={columns}
  data={localData}
  // Everything else uses defaults for client-side
/>
```

---

## Props Checklist

### ✅ Must Have
- [ ] `columns` - TanStack column definitions
- [ ] `data` - Array of rows

### ✅ Server-Side (if using server pagination)
- [ ] `isServerSidePagination={true}`
- [ ] `onServerChange={handler}`
- [ ] `serverSideCurrentPage={...}`
- [ ] `serverSidePageSize={...}`
- [ ] `serverSideTotalPages={...}`
- [ ] `serverSideTotalRecords={...}`
- [ ] `serverSideSearchTerm={...}` ← **CRITICAL**

### ✅ Optional
- [ ] `isGlobalFilter` - Show search box (default: true)
- [ ] `isPagination` - Show pagination (default: true)
- [ ] `isCustomPageSize` - Show page size dropdown (default: true)
- [ ] `isAddButton` - Show add button (default: false)
- [ ] `buttonName` - Button text (default: "Add")
- [ ] `buttonClass` - Button CSS (default: "")
- [ ] `handleUserClick` - Add button handler (default: undefined)

---

## Common Patterns

### Pattern 1: Server-Side with Search
```typescript
// User types "VCL" → finds 1 item → search box keeps "VCL" ✓
const handleServerChange = (query: any) => {
  query.page && setPage(query.page);
  query.search && setSearch(query.search);
};

<TableContainer
  serverSideSearchTerm={search}  // ← Keeps it visible
  onServerChange={handleServerChange}
/>
```

### Pattern 2: Add/Edit Modal
```typescript
const [showModal, setShowModal] = useState(false);

const handleAddClick = () => setShowModal(true);

<TableContainer
  isAddButton={true}
  buttonName="Add Item"
  handleUserClick={handleAddClick}
/>

<Modal isOpen={showModal}>
  {/* Add/edit form */}
</Modal>
```

### Pattern 3: With Actions Column
```typescript
const columns = [
  // ... other columns
  {
    header: 'Actions',
    accessorKey: 'id',
    cell: (cell: any) => (
      <div className="d-flex gap-2">
        <button onClick={() => handleEdit(cell.getValue())}>Edit</button>
        <button onClick={() => handleDelete(cell.getValue())}>Delete</button>
      </div>
    ),
  },
];
```

### Pattern 4: Hide Features
```typescript
// Show only table and search
<TableContainer
  columns={columns}
  data={data}
  isPagination={false}         // Hide pagination
  isCustomPageSize={false}     // Hide page size
  isAddButton={false}          // Hide add button
  isGlobalFilter={true}        // Keep search
/>
```

---

## Gotchas & Solutions

| Problem | Cause | Fix |
|---------|-------|-----|
| Search clears | Missing `serverSideSearchTerm` | Add `serverSideSearchTerm={searchTerm}` |
| Wrong active page | Redux `currentPage` not updating | Use `params.pageNumber`, not API response |
| Multiple API calls | No duplicate prevention | Use `useRef` to track last query |
| Slow search | No debouncing | DebouncedInput already debounces (500ms) |
| Page number wrong | Using 0-based instead of 1-based | TanStack uses `pageIndex`, we use `page` |

---

## Redux Setup (Required for Server-Side)

### Thunk
```typescript
export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (params: { pageNumber: number; pageSize: number; search: string }, { dispatch }) => {
    const response = await api.getData(params);
    
    dispatch(setList(response.data));
    dispatch(setPagination({
      currentPage: params.pageNumber,  // ← Use params, not response!
      totalPages: response.xpage.totalPages,
      pageSize: response.xpage.pageSize,
      totalRecords: response.xpage.totalRecords,
    }));
  }
);
```

### Slice
```typescript
const initialState = {
  list: [],
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalRecords: 0,
};

const mySlice = createSlice({
  reducers: {
    setPagination: (state, action) => {
      state.currentPage = action.payload.currentPage;
      state.pageSize = action.payload.pageSize;
      state.totalPages = action.payload.totalPages;
      state.totalRecords = action.payload.totalRecords;
    },
    setList: (state, action) => {
      state.list = action.payload;
    },
  },
});
```

---

## Quick Debugging

### Is search term persisting?
```typescript
// Add temporary log
console.log('serverSideSearchTerm:', searchTerm);

// Should show the search term
// If blank, add the prop!
```

### Is page number correct?
```typescript
// Check Redux state
console.log('currentPage:', currentPage);

// Should match clicked page
// If stays at 1, check thunk
```

### Are multiple API calls happening?
```typescript
// Check Network tab
// Should see 1 request per action
// If multiple, add useRef duplicate prevention
```

### Does search box clear after search?
```typescript
// Check parent passes the prop
console.log('searchTerm:', searchTerm);

// Should keep value after search
// If clears, add serverSideSearchTerm={searchTerm}
```

---

## Do's & Don'ts

### ✅ DO
```typescript
// ✅ Debounce search (build-in)
<DebouncedInput value={search} onChange={handleSearch} />

// ✅ Use requestPage for Redux, not response
const currentPage = params.pageNumber;

// ✅ Prevent duplicate calls
const lastQueryRef = useRef('');
if (lastQueryRef.current === currentQuery) return;

// ✅ Pass searchTerm prop
<TableContainer serverSideSearchTerm={searchTerm} />

// ✅ Use Math.min() for item count
Math.min(currentPage * pageSize, totalRecords)
```

### ❌ DON'T
```typescript
// ❌ Forget serverSideSearchTerm
<TableContainer
  serverSideCurrentPage={currentPage}
  // Missing: serverSideSearchTerm={searchTerm}
/>

// ❌ Use response.xpage.pageNumber (might be undefined)
currentPage: response.xpage.pageNumber  // Wrong!

// ❌ Call API in onClick directly
onClick={() => dispatch(fetchData())}  // Can cause multiple calls!

// ❌ Mix 1-based and 0-based page numbers
const page = getState().pagination.pageIndex;  // 0-based
// vs
const page = localPage;  // 1-based

// ❌ Forget dispatch in useEffect dependencies
useEffect(() => {
  dispatch(fetchData());
}, [pageNumber]);  // Missing: dispatch!
```

---

## One-Minute Setup

**For server-side pagination:**

```typescript
// 1. Copy this pattern
const [page, setPage] = useState(1);
const [size, setSize] = useState(10);
const [search, setSearch] = useState('');

const { list, totalPages, totalRecords } = useSelector(s => s.slice);

const lastQuery = useRef('');
useEffect(() => {
  const q = JSON.stringify({ page, size, search });
  if (lastQuery.current === q) return;
  lastQuery.current = q;
  dispatch(fetchData({ page, size, search }));
}, [page, size, search, dispatch]);

const handleChange = (q: any) => {
  q.page && setPage(q.page);
  q.pageSize && setSize(q.pageSize);
  q.search && setSearch(q.search);
};

// 2. Pass to component
<TableContainer
  data={list}
  columns={columns}
  isServerSidePagination={true}
  onServerChange={handleChange}
  serverSideCurrentPage={page}
  serverSidePageSize={size}
  serverSideTotalPages={totalPages}
  serverSideTotalRecords={totalRecords}
  serverSideSearchTerm={search}
/>
```

**Done!** ✓

---

## Need Help?

- **Search box clears?** → Add `serverSideSearchTerm={searchTerm}`
- **Wrong active page?** → Check Redux `currentPage` is updating
- **Multiple API calls?** → Add `useRef` duplicate prevention
- **Page doesn't change?** → Check `onServerChange` updates state

See `TableContainer.USAGE.md` for detailed examples!
