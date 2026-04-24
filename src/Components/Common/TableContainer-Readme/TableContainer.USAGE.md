# TableContainer - Usage Reference Guide

## Overview

`TableContainer` is a flexible React data table component built on **TanStack React Table (v8)** that supports both **client-side** and **server-side** pagination, filtering, and sorting.

---

## Props Reference

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | **Required** | TanStack table column definitions |
| `data` | `T[]` | **Required** | Array of row data |
| `isServerSidePagination` | `boolean` | `false` | Enable server-side pagination mode |
| `onServerChange` | `(query) => void` | `undefined` | Callback when server-side query changes |

### Server-Side Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `serverSideCurrentPage` | `number` | `1` | Current page (1-based) from server |
| `serverSidePageSize` | `number` | `10` | Items per page from server |
| `serverSideTotalPages` | `number` | `0` | Total pages from server |
| `serverSideTotalRecords` | `number` | `0` | Total records from server |
| `serverSideSearchTerm` | `string` | `""` | Current search term to sync |

### Feature Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isGlobalFilter` | `boolean` | `true` | Show search box |
| `isPagination` | `boolean` | `true` | Show pagination controls |
| `isCustomPageSize` | `boolean` | `true` | Show page size dropdown (10, 20, 30, 50) |

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isAddButton` | `boolean` | `false` | Show add button |
| `handleUserClick` | `() => void` | `undefined` | Callback when add button clicked |
| `buttonName` | `string` | `"Add"` | Add button text |
| `buttonClass` | `string` | `""` | CSS classes for button |

---

## Complete Example 1: Server-Side Pagination

### Parent Component (ClinicExample.tsx)

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableContainer from 'Components/Common/TableContainer';
import { fetchClinics } from '@/slices/admin/clinic/clinicThunk';
import { RootState } from '@/store';

interface PageParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

const ClinicList = () => {
  // Local state for pagination & search
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Redux state
  const dispatch = useDispatch();
  const { 
    list, 
    loading, 
    currentPage, 
    pageSize: reduxPageSize,
    totalPages, 
    totalRecords 
  } = useSelector((state: RootState) => state.Clinic);

  // Prevent duplicate API calls
  const lastQueryRef = useRef<string>('');

  // Fetch data when pagination changes
  useEffect(() => {
    const query = JSON.stringify({
      pageNumber,
      pageSize,
      search: searchTerm,
    });

    if (lastQueryRef.current === query) return;
    lastQueryRef.current = query;

    dispatch(fetchClinics({
      pageNumber,
      pageSize,
      search: searchTerm,
    }));
  }, [pageNumber, pageSize, searchTerm, dispatch]);

  // Handle server-side changes from table
  const handleServerChange = (query: any) => {
    console.log('📌 Server query:', query);
    
    if (query.page !== undefined) {
      setPageNumber(query.page);
    }
    if (query.pageSize !== undefined) {
      setPageSize(query.pageSize);
    }
    if (query.search !== undefined) {
      setSearchTerm(query.search);
    }
  };

  // Column definitions
  const columns = [
    {
      header: 'Code',
      accessorKey: 'code',
      enableSorting: true,
    },
    {
      header: 'Name',
      accessorKey: 'name',
      enableSorting: true,
    },
    {
      header: 'Contact',
      accessorKey: 'contact1',
      enableSorting: false,
    },
    {
      header: 'Active',
      accessorKey: 'active',
      cell: (cell: any) => cell.getValue() ? 'Yes' : 'No',
    },
  ];

  return (
    <TableContainer
      // Core props
      columns={columns}
      data={list || []}

      // Server-side pagination
      isServerSidePagination={true}
      onServerChange={handleServerChange}
      serverSideCurrentPage={currentPage}
      serverSidePageSize={reduxPageSize}
      serverSideTotalPages={totalPages}
      serverSideTotalRecords={totalRecords}
      serverSideSearchTerm={searchTerm}  // ← IMPORTANT: Sync search

      // Features
      isGlobalFilter={true}
      isPagination={true}
      isCustomPageSize={true}
      isAddButton={true}
      buttonName="Add Clinic"
      buttonClass="btn btn-primary"
      handleUserClick={() => {
        // Open add clinic modal
        console.log('Add new clinic');
      }}
    />
  );
};

export default ClinicList;
```

### Backend API (Expected Response)

```typescript
// GET /api/clinic/clinicbyclientbypage
// Query params: ?pagenumber=1&pagesize=10&search=

{
  "data": [
    { "id": 1, "code": "C001", "name": "Clinic A", "contact1": "555-1234", "active": true },
    { "id": 2, "code": "C002", "name": "Clinic B", "contact1": "555-5678", "active": true },
    // ... 10 items
  ],
  "xpage": {
    "pageNumber": 1,        // Current page (from request)
    "pageSize": 10,         // Items per page
    "totalPages": 16,       // Total pages
    "totalRecords": 150     // Total records
  },
  "success": true
}
```

### Redux Thunk (clinicThunk.ts)

```typescript
export const fetchClinics = createAsyncThunk(
  'clinic/fetchClinics',
  async (params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
  }, { dispatch }) => {
    try {
      dispatch(setLoading(true));

      const response = await clinicService.getClinicsByPaginated(
        params.pageNumber || 1,
        params.pageSize || 10,
        params.search || ''
      );

      // Dispatch list data
      dispatch(setList(response.data));

      // Use requested page number (API doesn't return it)
      const currentPage = params.pageNumber || 1;

      // Dispatch pagination info
      dispatch(setPagination({
        currentPage,  // ← From params, not response
        totalPages: response.xpage.totalPages,
        pageSize: response.xpage.pageSize,
        totalRecords: response.xpage.totalRecords,
      }));

      return response.data;
    } catch (error) {
      dispatch(setError('Failed to fetch clinics'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
```

---

## Complete Example 2: Client-Side Pagination

### Simple Local Data Table

```typescript
import React, { useMemo, useState } from 'react';
import TableContainer from 'Components/Common/TableContainer';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const ProductList = () => {
  const [data] = useState<Product[]>([
    { id: 1, name: 'Laptop', price: 999, stock: 5, category: 'Electronics' },
    { id: 2, name: 'Mouse', price: 25, stock: 50, category: 'Electronics' },
    { id: 3, name: 'Desk', price: 299, stock: 10, category: 'Furniture' },
    { id: 4, name: 'Chair', price: 199, stock: 15, category: 'Furniture' },
    // ... more data
  ]);

  const columns = useMemo(() => [
    {
      header: 'Product Name',
      accessorKey: 'name',
      enableSorting: true,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      enableSorting: true,
      cell: (cell: any) => `$${cell.getValue().toFixed(2)}`,
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      enableSorting: true,
    },
    {
      header: 'Category',
      accessorKey: 'category',
      enableSorting: true,
    },
  ], []);

  return (
    <TableContainer
      // Core props
      columns={columns}
      data={data}

      // Client-side (all defaults)
      isServerSidePagination={false}  // ← Use local pagination
      // NO onServerChange callback needed

      // Features
      isGlobalFilter={true}   // Show search box
      isPagination={true}     // Show pagination
      isCustomPageSize={true} // Show page size dropdown

      // Add button
      isAddButton={true}
      buttonName="Add Product"
      buttonClass="btn btn-success"
      handleUserClick={() => console.log('Add product')}
    />
  );
};

export default ProductList;
```

---

## Data Flow Diagrams

### Server-Side Pagination Flow

```
User Action (click page 2)
    ↓
TableContainer.onClick
    ↓
setLocalPage(2)  ← Updates immediately (for active CSS)
onServerChange({ page: 2, pageSize: 10, search: '' })
    ↓
Parent.handleServerChange
    setPageNumber(2)
    ↓
useEffect detects state change
    ↓
dispatch(fetchClinics({ pageNumber: 2, pageSize: 10, search: '' }))
    ↓
API Call: /api/clinic?pagenumber=2&pagesize=10
    ↓
API Response:
    {
      data: [...page 2 items],
      xpage: { pageNumber: 2, pageSize: 10, totalPages: 16, totalRecords: 150 }
    }
    ↓
Redux dispatch(setPagination({ currentPage: 2, ... }))
    ↓
Parent re-renders with currentPage=2
    serverSideCurrentPage={2} passed to TableContainer
    ↓
TableContainer.useEffect([serverSideCurrentPage]) triggers
    setLocalPage(2)  ← Syncs with Redux
    ↓
TableContainer renders with page 2 active ✓
```

### Client-Side Pagination Flow

```
User Action (click page 2)
    ↓
TableContainer.setPageIndex(1)  ← React Table handles it
    ↓
TableContainer.getPaginationRowModel()
    ↓
Filter data array to show rows 10-20 (for page 2, size 10)
    ↓
TableContainer re-renders with page 2 data
    ↓
Active CSS shows page 2 ✓
```

---

## Common Use Cases

### Use Case 1: Clinic/Hospital List (Server-Side)

**When to use:** Large dataset (100+ records), API handles pagination

```typescript
<TableContainer
  isServerSidePagination={true}
  onServerChange={handleServerChange}
  serverSideCurrentPage={currentPage}
  serverSidePageSize={pageSize}
  serverSideTotalPages={totalPages}
  serverSideTotalRecords={totalRecords}
  serverSideSearchTerm={searchTerm}
  columns={columns}
  data={list}
  isGlobalFilter={true}
  isPagination={true}
  isCustomPageSize={true}
/>
```

### Use Case 2: Product Catalog (Client-Side)

**When to use:** Small dataset (< 100 records), all data available locally

```typescript
<TableContainer
  isServerSidePagination={false}  // ← Client-side
  columns={columns}
  data={products}
  isGlobalFilter={true}
  isPagination={true}
/>
```

### Use Case 3: Report Table (No Pagination)

**When to use:** Need to display all records in one page

```typescript
<TableContainer
  columns={columns}
  data={reportData}
  isPagination={false}  // ← No pagination
  isGlobalFilter={true}
  isCustomPageSize={false}
/>
```

### Use Case 4: Simple List with Add Button

**When to use:** CRUD operation with modal

```typescript
<TableContainer
  columns={columns}
  data={items}
  isAddButton={true}
  buttonName="Add Item"
  buttonClass="btn btn-primary"
  handleUserClick={handleAddClick}
  isPagination={true}
  isGlobalFilter={true}
/>
```

---

## Column Definition Examples

### Basic Column

```typescript
{
  header: 'Name',
  accessorKey: 'name',
  enableSorting: true,
}
```

### Column with Custom Cell Render

```typescript
{
  header: 'Status',
  accessorKey: 'active',
  cell: (cell: any) => {
    const isActive = cell.getValue();
    return (
      <span className={isActive ? 'text-success' : 'text-danger'}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  },
}
```

### Column with Actions

```typescript
{
  header: 'Actions',
  accessorKey: 'id',
  cell: (cell: any) => {
    const id = cell.getValue();
    return (
      <div className="d-flex gap-2">
        <button 
          className="btn btn-sm btn-info"
          onClick={() => handleEdit(id)}
        >
          Edit
        </button>
        <button 
          className="btn btn-sm btn-danger"
          onClick={() => handleDelete(id)}
        >
          Delete
        </button>
      </div>
    );
  },
}
```

### Column with Sorting Disabled

```typescript
{
  header: 'Address',
  accessorKey: 'address',
  enableSorting: false,  // ← No sorting for this column
}
```

---

## Best Practices

### ✅ DO

- ✅ **Use useRef for duplicate prevention** when fetching
  ```typescript
  const lastQueryRef = useRef<string>('');
  if (lastQueryRef.current === currentQuery) return;
  ```

- ✅ **Pass searchTerm as prop** for search synchronization
  ```typescript
  serverSideSearchTerm={searchTerm}
  ```

- ✅ **Use Math.min()** when calculating shown items
  ```typescript
  Math.min(currentPage * pageSize, totalRecords)
  ```

- ✅ **Memoize columns** to prevent re-renders
  ```typescript
  const columns = useMemo(() => [...], []);
  ```

- ✅ **Use async thunks** for API calls
  ```typescript
  const response = await clinicService.getClinicsByPaginated(...);
  ```

### ❌ DON'T

- ❌ **Don't forget serverSideSearchTerm** - search box will clear
  ```typescript
  // Wrong - search clears after results
  <TableContainer
    serverSideCurrentPage={currentPage}
    // Missing: serverSideSearchTerm={searchTerm}
  />
  ```

- ❌ **Don't use response.xpage.pageNumber** if API doesn't return it
  ```typescript
  // Wrong - becomes undefined
  currentPage: response.xpage.pageNumber

  // Right - use requested page
  currentPage: params.pageNumber || 1
  ```

- ❌ **Don't call API directly in onClick handlers**
  ```typescript
  // Wrong - can cause multiple calls
  const handlePageClick = (page) => {
    dispatch(fetchClinics(page));  // ← Multiple times!
  };

  // Right - use state + useEffect
  setPageNumber(page);  // Update state
  // useEffect will detect change and fetch
  ```

- ❌ **Don't forget dependencies in useEffect**
  ```typescript
  // Wrong - missing dispatch
  useEffect(() => {
    dispatch(fetchData());
  }, [pageNumber, pageSize]); // Missing dispatch!

  // Right - include all deps
  useEffect(() => {
    dispatch(fetchData());
  }, [pageNumber, pageSize, dispatch]);
  ```

---

## Testing

### Test Server-Side Pagination

```typescript
it('fetches page 2 when clicking page 2 button', () => {
  const { getByText } = render(<ClinicList />);
  
  // Click page 2
  fireEvent.click(getByText('2'));
  
  // Verify API called with pageNumber=2
  expect(mockFetch).toHaveBeenCalledWith({
    pageNumber: 2,
    pageSize: 10
  });
});
```

### Test Client-Side Pagination

```typescript
it('shows page 2 data when clicking page 2', () => {
  const { getByText } = render(<ProductList />);
  
  // Click page 2
  fireEvent.click(getByText('2'));
  
  // Verify page 2 items are displayed
  expect(getByText('Item 11')).toBeInTheDocument();
  expect(getByText('Item 20')).toBeInTheDocument();
});
```

### Test Search Persistence

```typescript
it('keeps search term in box after search', async () => {
  const { getByPlaceholderText } = render(<ClinicList />);
  
  const searchBox = getByPlaceholderText('Search...');
  
  // Type search
  fireEvent.change(searchBox, { target: { value: 'VCL' } });
  
  // Wait for debounce and API call
  await waitFor(() => {
    // Verify search box still has "VCL"
    expect(searchBox).toHaveValue('VCL');
  });
});
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Search box clears after search | Missing `serverSideSearchTerm` prop | Add `serverSideSearchTerm={searchTerm}` |
| Active page shows wrong number | Redux `currentPage` not updating | Use `params.pageNumber` in thunk, not `response.xpage.pageNumber` |
| Pagination not working | `isServerSidePagination={false}` | Set to `true` for server-side |
| Multiple API calls | No duplicate prevention | Add `useRef` to track last query |
| Search not debounced | DebouncedInput has 500ms delay | Normal behavior, expected |
| Total items count wrong | Using `list?.length` instead of `totalRecords` | Use `totalRecords` from server |

---

## Summary

| Feature | Server-Side | Client-Side |
|---------|------------|-----------|
| Best for | Large datasets (100+) | Small datasets (<100) |
| API calls | Yes (per action) | No |
| Sorting | Backend | Frontend |
| Filtering | Backend | Frontend |
| Search | Backend | Frontend |
| Setup complexity | Medium | Low |
| Performance | Better for large data | Better for small data |
| Memory usage | Lower | Higher |

Choose **Server-Side** for scalability, **Client-Side** for simplicity.
