# User Search and Role Filtering Implementation

## Overview
Enhanced the `/api/users` endpoint to support searching users by name and filtering by role with case-insensitive matching and combination filtering.

## Backend Changes

### 1. User Service (`backend/services/user.service.js`)
- **Added**: `Op` import from Sequelize for case-insensitive search
- **Modified**: `getAllUsers()` function to accept optional `searchTerm` and `role` parameters
- **Implementation**: Uses `Op.iLike` for case-insensitive partial matching on the `name` field and exact role matching

```javascript
export async function getAllUsers(searchTerm = null, role = null) {
  const whereClause = {};
  
  // Add search filter if searchTerm is provided
  if (searchTerm && searchTerm.trim()) {
    whereClause.name = { [Op.iLike]: `%${searchTerm.trim()}%` };
  }
  
  // Add role filter if role is provided
  if (role && role.trim()) {
    whereClause.role = role.trim().toLowerCase();
  }
  
  return await User.findAll({
    where: whereClause,
    attributes: { exclude: ['password'] },
    order: [['id', 'ASC']],
  });
}
```

### 2. User Controller (`backend/controllers/user.controller.js`)
- **Modified**: `getUsers()` function to read `searchTerm` and `role` from query parameters
- **Implementation**: Passes both parameters to the service function

```javascript
export async function getUsers(req, res) {
  try {
    const { searchTerm, role } = req.query;
    const users = await userService.getAllUsers(searchTerm, role);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}
```

## Frontend Changes

### 1. Users API (`client/src/api/users.api.ts`)
- **Modified**: `getUsers()` function to accept optional `searchTerm` and `role` parameters
- **Implementation**: Builds query string with both parameters when provided

```typescript
export async function getUsers(searchTerm?: string, role?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (searchTerm && searchTerm.trim()) {
    params.append('searchTerm', searchTerm.trim());
  }
  if (role && role.trim()) {
    params.append('role', role.trim());
  }
  
  const queryString = params.toString();
  const url = queryString ? `/api/users?${queryString}` : '/api/users';
  
  return apiRequest("GET", url);
}
```

### 2. ManageUsers Component (`client/src/pages/Admin/ManageUsers.tsx`)
- **Added**: Debounced role filter state to prevent excessive API calls
- **Modified**: React Query to use both debounced search term and role filter in query key
- **Updated**: Role filtering now handled by backend instead of frontend
- **Implementation**: Combined filtering with search and role parameters

```typescript
// Debounced search and role implementation
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
const [debouncedFilterRole, setDebouncedFilterRole] = useState<string>("all");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm]);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedFilterRole(filterRole);
  }, 300);
  return () => clearTimeout(timer);
}, [filterRole]);

// React Query with search and role filtering
const { data: users, isLoading, isError } = useQuery({
  queryKey: ["users", "admin", debouncedSearchTerm, debouncedFilterRole],
  queryFn: () => getUsers(debouncedSearchTerm, debouncedFilterRole === "all" ? undefined : debouncedFilterRole),
});
```

## API Usage

### Endpoint
```
GET /api/users?searchTerm=john&role=patient
```

### Query Parameters
- `searchTerm` (optional): String to search for in user names
- `role` (optional): Role to filter by (`admin`, `doctor`, `patient`)

### Examples
```bash
# Get all users
GET /api/users

# Search for users with "john" in their name
GET /api/users?searchTerm=john

# Filter by doctor role
GET /api/users?role=doctor

# Combined search and role filter
GET /api/users?searchTerm=dr&role=doctor

# Case-insensitive search and role filter
GET /api/users?searchTerm=ADMIN&role=ADMIN
```

## Features

### ✅ Implemented
- Case-insensitive search using `Op.iLike`
- Role-based filtering with exact matching
- Combined filtering (search + role)
- Debounced frontend search and role filtering to prevent excessive API calls
- Proper error handling
- Maintains existing functionality when no filters are provided

### 🔍 Search Behavior
- Searches only the `name` field (not email)
- Case-insensitive matching
- Partial matching (contains search term anywhere in name)
- Trims whitespace from search term
- Returns empty array if no matches found

### 🏷️ Role Filtering Behavior
- Filters by exact role match (`admin`, `doctor`, `patient`)
- Case-insensitive role matching (converts to lowercase)
- Works in combination with search filtering
- Returns empty array if no users match the role

### ⚡ Performance
- 300ms debounce delay on frontend for both search and role filters
- Database-level filtering (not frontend filtering)
- Maintains existing pagination and ordering
- Efficient combined queries

## Testing

The implementation includes comprehensive testing:
1. Search for existing names
2. Filter by each role (admin, doctor, patient)
3. Combined search and role filtering
4. Case-insensitive search and role filtering
5. Empty search/filter results
6. No filters (returns all users)
7. Invalid role filtering

## Filter Combinations

| Search Term | Role | Result |
|-------------|------|--------|
| `null` | `null` | All users |
| `"john"` | `null` | Users with "john" in name |
| `null` | `"doctor"` | All doctors |
| `"dr"` | `"doctor"` | Doctors with "dr" in name |
| `"admin"` | `"admin"` | Admins with "admin" in name |

## Future Enhancements

Potential improvements for future iterations:
- Add search by email field
- Add filtering by status (active/inactive)
- Add pagination for large result sets
- Add search highlighting in results
- Add sorting options (by name, role, creation date)
- Add bulk operations (activate/deactivate multiple users) 