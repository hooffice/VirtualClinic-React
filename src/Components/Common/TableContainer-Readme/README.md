# TableContainer Component - Documentation

## 📋 Files in This Folder

### Main Component
- **`TableContainer.tsx`** - The actual component code

### Documentation
1. **`TableContainer.USAGE.md`** ⭐ **START HERE**
   - How to use the component
   - Complete examples (server-side & client-side)
   - Data flow diagrams
   - Common use cases
   - Testing examples

2. **`TableContainer.REVIEW.md`** - Deep dive
   - Code architecture & structure
   - Component breakdown
   - Feature explanations
   - Performance considerations
   - Security notes
   - Recommendations

3. **`TableContainer.QUICK_REF.md`** - Quick lookup
   - Props checklist
   - Common patterns
   - Gotchas & solutions
   - One-minute setup
   - Do's & Don'ts

---

## 🚀 Quick Start

### Server-Side Pagination (Most Common)

```typescript
import TableContainer from 'Components/Common/TableContainer';

const MyList = () => {
  // State management
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');

  // Redux data
  const { list, totalPages, totalRecords } = 
    useSelector(state => state.YourSlice);

  // Prevent duplicate API calls
  const lastQuery = useRef('');
  useEffect(() => {
    const q = JSON.stringify({ page, size, search });
    if (lastQuery.current === q) return;
    lastQuery.current = q;
    dispatch(fetchData({ page, size, search }));
  }, [page, size, search, dispatch]);

  // Handle table changes
  const handleChange = (query: any) => {
    query.page && setPage(query.page);
    query.pageSize && setSize(query.pageSize);
    query.search && setSearch(query.search);
  };

  return (
    <TableContainer
      columns={columns}
      data={list}
      isServerSidePagination={true}
      onServerChange={handleChange}
      serverSideCurrentPage={page}
      serverSidePageSize={size}
      serverSideTotalPages={totalPages}
      serverSideTotalRecords={totalRecords}
      serverSideSearchTerm={search}  // ← CRITICAL!
    />
  );
};
```

### Client-Side Pagination (Simple)

```typescript
<TableContainer
  columns={columns}
  data={localData}
  // That's it! Uses defaults for client-side
/>
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Forgetting Search Term Prop
```typescript
// WRONG - Search box clears after search
<TableContainer
  serverSideCurrentPage={currentPage}
  serverSidePageSize={pageSize}
  // Missing: serverSideSearchTerm={searchTerm}
/>
```

**Fix:** Add the prop
```typescript
<TableContainer
  serverSideCurrentPage={currentPage}
  serverSidePageSize={pageSize}
  serverSideSearchTerm={searchTerm}  // ← Add this
/>
```

### ❌ Mistake 2: Using API Response Page Number
```typescript
// WRONG - currentPage becomes undefined
dispatch(setPagination({
  currentPage: response.xpage.pageNumber,  // Might not exist!
}));
```

**Fix:** Use the requested page
```typescript
dispatch(setPagination({
  currentPage: params.pageNumber || 1,  // ← Use params
}));
```

### ❌ Mistake 3: No Duplicate Prevention
```typescript
// WRONG - Multiple API calls on each render
useEffect(() => {
  dispatch(fetchData({ page, size }));
}, [page, size]);
```

**Fix:** Add useRef tracking
```typescript
const lastQuery = useRef('');
useEffect(() => {
  const q = JSON.stringify({ page, size });
  if (lastQuery.current === q) return;
  lastQuery.current = q;
  dispatch(fetchData({ page, size }));
}, [page, size]);
```

---

## 📊 Features

| Feature | Server-Side | Client-Side |
|---------|------------|-----------|
| Pagination | ✅ Backend | ✅ Frontend |
| Search/Filter | ✅ Backend | ✅ Frontend |
| Sorting | ✅ Backend | ✅ Frontend |
| Debounced search | ✅ Yes (500ms) | ✅ Yes (500ms) |
| Load huge datasets | ✅ Yes | ❌ Performance issues |
| No backend needed | ❌ Needs API | ✅ Local data only |

---

## 🎯 Which Mode to Use?

### Choose Server-Side If...
- ✅ Dataset has 100+ records
- ✅ Backend API available
- ✅ Want to reduce memory usage
- ✅ Need real-time filtering (live data)

**Example:** Clinic list, product catalog, user management

### Choose Client-Side If...
- ✅ Dataset has <100 records
- ✅ All data available locally
- ✅ Want simple implementation
- ✅ No backend available

**Example:** Report table, settings list, small local data

---

## 🔧 Props at a Glance

### Essential
```typescript
<TableContainer
  columns={columns}           // TanStack column definitions
  data={data}               // Row data array
/>
```

### Server-Side
```typescript
<TableContainer
  isServerSidePagination={true}
  onServerChange={handleChange}
  serverSideCurrentPage={page}
  serverSidePageSize={size}
  serverSideTotalPages={total}
  serverSideTotalRecords={count}
  serverSideSearchTerm={search}  // ← Don't forget!
/>
```

### Features
```typescript
<TableContainer
  isGlobalFilter={true}      // Show search
  isPagination={true}        // Show pagination
  isCustomPageSize={true}    // Show page size dropdown
/>
```

### Add Button
```typescript
<TableContainer
  isAddButton={true}
  buttonName="Add Item"
  buttonClass="btn btn-primary"
  handleUserClick={() => {}}
/>
```

---

## 🧪 Testing

### Server-Side Test
```typescript
it('fetches page 2 on click', async () => {
  const { getByText } = render(<MyList />);
  fireEvent.click(getByText('2'));
  
  // Verify API called
  expect(mockAPI).toHaveBeenCalledWith({ page: 2 });
});
```

### Search Persistence Test
```typescript
it('keeps search term visible', async () => {
  const { getByPlaceholderText } = render(<MyList />);
  const search = getByPlaceholderText('Search...');
  
  fireEvent.change(search, { target: { value: 'VCL' } });
  
  await waitFor(() => {
    expect(search).toHaveValue('VCL');  // Should persist
  });
});
```

---

## 🐛 Troubleshooting

### "Search box clears after search"
**Cause:** Missing `serverSideSearchTerm` prop

**Solution:**
```typescript
<TableContainer serverSideSearchTerm={searchTerm} />
```

### "Active page shows wrong number"
**Cause:** Redux `currentPage` not updating

**Solution:** Use requested page in thunk
```typescript
const currentPage = params.pageNumber || 1;
dispatch(setPagination({ currentPage, ... }));
```

### "Multiple API calls happening"
**Cause:** No duplicate prevention

**Solution:** Add useRef tracking
```typescript
const lastQuery = useRef('');
if (lastQuery.current === currentQuery) return;
lastQuery.current = currentQuery;
dispatch(fetchData());
```

### "Table shows no data"
**Cause:** Empty data array

**Solution:** Check Redux state
```typescript
const { list } = useSelector(state => state.slice);
console.log('Data:', list);  // Should have items
```

### "Page size doesn't change"
**Cause:** Not handling `pageSize` in `onServerChange`

**Solution:**
```typescript
const handleChange = (query: any) => {
  query.pageSize && setPageSize(query.pageSize);  // Add this
};
```

---

## 📚 Documentation Files

| File | Purpose | When to Read |
|------|---------|------|
| `TableContainer.USAGE.md` | Complete usage guide with examples | First time setup |
| `TableContainer.REVIEW.md` | Deep code review & architecture | Understanding how it works |
| `TableContainer.QUICK_REF.md` | Quick lookup & patterns | Daily development |
| `README.md` | This file - overview | Overview & troubleshooting |

---

## 🎓 Learning Path

1. **First time?** → Read `TableContainer.USAGE.md` (Examples section)
2. **Want to understand?** → Read `TableContainer.REVIEW.md`
3. **Need quick answer?** → Check `TableContainer.QUICK_REF.md`
4. **Have an issue?** → See Troubleshooting section above

---

## 💡 Pro Tips

### Tip 1: Always Memoize Columns
```typescript
const columns = useMemo(() => [
  { header: 'Name', accessorKey: 'name' },
  // ...
], []);  // Empty dependency array
```

### Tip 2: Use Flex Render for Complex Cells
```typescript
{
  header: 'Status',
  cell: (cell: any) => flexRender(
    cell.column.columnDef.cell,
    cell.getContext()
  ),
}
```

### Tip 3: Track Last Query to Prevent Duplicates
```typescript
const lastQueryRef = useRef<string>('');
useEffect(() => {
  const query = JSON.stringify({ page, size, search });
  if (lastQueryRef.current === query) return;
  lastQueryRef.current = query;
  // API call only happens if query changed
}, [page, size, search]);
```

### Tip 4: Always Pass `serverSideSearchTerm`
```typescript
// Even for simple searches
<TableContainer
  serverSideSearchTerm={searchTerm}  // Critical!
/>
```

---

## 🚨 Critical Notes

⚠️ **Must Do**
- ✅ Pass `serverSideSearchTerm` to prevent search clearing
- ✅ Use `params.pageNumber` in thunk, not API response
- ✅ Add `useRef` duplicate prevention
- ✅ Include all dependencies in useEffect

❌ **Don't Do**
- ❌ Forget `serverSideSearchTerm` prop
- ❌ Use `response.xpage.pageNumber` (might be undefined)
- ❌ Call API in onClick handlers directly
- ❌ Mix 1-based and 0-based page numbers

---

## 📞 Support

For detailed information:
- See **`TableContainer.USAGE.md`** for examples
- See **`TableContainer.REVIEW.md`** for architecture
- See **`TableContainer.QUICK_REF.md`** for quick answers

---

## ✨ Summary

**TableContainer** is a production-ready, flexible data table component that:

✅ Handles both server-side and client-side pagination  
✅ Provides search, filtering, and sorting  
✅ Syncs state properly between parent and child  
✅ Debounces search to prevent excessive API calls  
✅ Shows active pagination button with instant feedback  

**Just remember:** Always pass `serverSideSearchTerm` to keep search visible!
