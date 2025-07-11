import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, deleteUser, User } from "@/api/users.api";
import AddUserModal from "@/components/AddUserModal";
import ViewUserModal from "@/components/ViewUserModal";
import EditUserModal from "@/components/EditUserModal";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  User as UserIcon,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function AdminManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [debouncedFilterRole, setDebouncedFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce role filter to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterRole(filterRole);
    }, 300);

    return () => clearTimeout(timer);
  }, [filterRole]);

  // Fetch users with search term and role filter
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["users", "admin", debouncedSearchTerm, debouncedFilterRole],
    queryFn: () => getUsers(debouncedSearchTerm, debouncedFilterRole === "all" ? undefined : debouncedFilterRole),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });

  // Filter users based on status only (frontend filtering for status)
  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    return users.filter(user => {
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "active" && user.isActive) ||
                           (filterStatus === "inactive" && !user.isActive);
      
      return matchesStatus;
    });
  }, [users, filterStatus]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return "destructive"; // Admin
      case 'doctor': return "default"; // Doctor
      case 'patient': return "secondary"; // Patient
      default: return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return "Admin";
      case 'doctor': return "Doctor";
      case 'patient': return "Patient";
      default: return "Unknown";
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      data: { isActive: !currentStatus }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUserId(null);
  };

  const handleEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUserForEdit(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load users.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-slate-600">Administer user accounts and permissions</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" onClick={handleAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Array.isArray(users) ? users.length : 0}</p>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}
                </p>
                <p className="text-sm text-slate-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(users) ? users.filter(u => u.role === 'doctor').length : 0}
                </p>
                <p className="text-sm text-slate-600">Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(users) ? users.filter(u => u.isActive).length : 0}
                </p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {user.name || user.email || "Unknown User"}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(user.isActive)}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{user.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  {user.isEmailVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-slate-600">
                    {user.isEmailVerified ? "Email verified" : "Email not verified"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-slate-500">
                    ID: {user.id}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      disabled={updateUserMutation.isPending}
                    >
                      {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={showAddUserModal} 
        onClose={handleCloseAddUserModal} 
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        userId={selectedUserId}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUserForEdit}
      />
    </div>
  );
} 