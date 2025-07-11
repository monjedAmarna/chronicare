import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, User, deleteUser, updateUser } from "@/api/users.api";
import { getPatients, Patient } from "@/api/patients.api";
import { getAlerts, Alert } from "@/api/alerts.api";
import { getReportStats, ReportStats } from "@/api/reports.api";
import { useAnalyticsQuery } from "@/hooks/useAnalyticsQuery";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  Settings, 
  Shield, 
  Database,
  Activity,
  AlertTriangle,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  RefreshCw,
  Save,
  Trash2,
  Eye,
  Edit,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { apiRequest } from "@/api/apiRequest";
import { clearSystemLogs } from "@/api/system.api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";
import ViewUserModal from "@/components/ViewUserModal";
import SettingsModal from "@/components/SettingsModal";
import ClearLogsModal from "@/components/ClearLogsModal";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("system");
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>("");
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // System Actions state
  const [refreshingCache, setRefreshingCache] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [cooldown, setCooldown] = useState<{ [k: string]: boolean }>({});
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState<string | null>(null);

  // User CRUD state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);

  // Always call the hook at the top level
  const analyticsStart = analyticsStartDate || "";
  const analyticsEnd = analyticsEndDate || "";
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
    error: analyticsErrorObj
  } = useAnalyticsQuery(analyticsStart, analyticsEnd);

  // Delete user mutation (move outside handler)
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast({ title: "User deleted" });
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error?.message, variant: "destructive" });
    },
  });

  // Helper for cooldown
  const triggerCooldown = (key: string, ms = 5000) => {
    setCooldown((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCooldown((prev) => ({ ...prev, [key]: false })), ms);
  };

  // Handlers
  const handleRefreshCache = async () => {
    setRefreshingCache(true);
    try {
      await apiRequest("POST", "/api/system/refresh-cache");
      toast({ title: "Cache refreshed" });
      triggerCooldown("refresh");
    } catch (e: any) {
      toast({ title: "Failed to refresh cache", description: e.message, variant: "destructive" });
    } finally {
      setRefreshingCache(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      await apiRequest("POST", "/api/system/backup-database");
      toast({ title: "Database backup started" });
      triggerCooldown("backup");
    } catch (e: any) {
      toast({ title: "Failed to backup database", description: e.message, variant: "destructive" });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleSecurityScan = async () => {
    setScanLoading(true);
    try {
      const res = await apiRequest("POST", "/api/system/security-scan");
      toast({ title: "Security scan completed", description: `Issues found: ${res.issuesFound}` });
      triggerCooldown("scan");
    } catch (e: any) {
      toast({ title: "Failed to run security scan", description: e.message, variant: "destructive" });
    } finally {
      setScanLoading(false);
    }
  };

  const handleAuditLogs = async () => {
    setAuditLogsOpen(true);
    setAuditLogsLoading(true);
    setAuditLogsError(null);
    try {
      const logs = await apiRequest("GET", "/api/system/audit-logs");
      setAuditLogs(logs);
    } catch (e: any) {
      setAuditLogsError(e.message);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const handleAddUser = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
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
  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };
  const handleConfirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteUserId(null);
  };

  const handleOpenSettings = () => setIsSettingsModalOpen(true);
  const handleCloseSettings = () => setIsSettingsModalOpen(false);
  
  const handleOpenClearLogs = () => setIsClearLogsModalOpen(true);
  const handleCloseClearLogs = () => setIsClearLogsModalOpen(false);
  
  const handleClearLogs = async () => {
    setClearingLogs(true);
    try {
      const result = await clearSystemLogs();
      toast({ 
        title: "Logs cleared successfully", 
        description: `Cleared ${result.clearedCounts.auditLogs} audit logs, ${result.clearedCounts.errorLogs} error logs, and ${result.clearedCounts.activityLogs} activity logs.`
      });
      setIsClearLogsModalOpen(false);
      // Refresh audit logs if they're currently being viewed
      if (auditLogsOpen) {
        handleAuditLogs();
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to clear logs", 
        description: error?.message || "An error occurred while clearing logs.", 
        variant: "destructive" 
      });
    } finally {
      setClearingLogs(false);
    }
  };

  // Fetch system data
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users", "admin"],
    queryFn: () => getUsers(),
  });

  const { data: patients, isLoading: patientsLoading, isError: patientsError } = useQuery({
    queryKey: ["patients", "admin"],
    queryFn: getPatients,
  });

  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts", "admin"],
    queryFn: getAlerts,
  });

  const { data: reportStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["reportStats", "admin"],
    queryFn: getReportStats,
  });

  const isLoading = usersLoading || patientsLoading || alertsLoading || statsLoading;
  const isError = usersError || patientsError || alertsError || statsError;

  // Refresh all data
  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    queryClient.invalidateQueries({ queryKey: ["patients", "admin"] });
    queryClient.invalidateQueries({ queryKey: ["alerts", "admin"] });
    queryClient.invalidateQueries({ queryKey: ["reportStats", "admin"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  // Filtered users
  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(user => {
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesSearch =
        !searchTerm ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchTerm]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load admin panel data.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-slate-600">System administration and configuration</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "system"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          System
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "security"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Security
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "analytics"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analytics
        </button>
      </div>

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Server Status</p>
                    <p className="text-2xl font-bold text-green-600">Online</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-2xl font-bold text-green-600">Healthy</p>
                  </div>
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">API Response</p>
                    <p className="text-2xl font-bold text-blue-600">&lt; 200ms</p>
                  </div>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Uptime</p>
                    <p className="text-2xl font-bold text-purple-600">99.9%</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Actions
              </CardTitle>
              <CardDescription>Administrative actions and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleRefreshCache}
                  disabled={refreshingCache || cooldown.refresh}
                >
                  {refreshingCache ? <span className="animate-spin mr-2"><RefreshCw className="w-6 h-6 mb-2" /></span> : <RefreshCw className="w-6 h-6 mb-2" />}
                  <span>Refresh Cache</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleBackup}
                  disabled={backupLoading || cooldown.backup}
                >
                  {backupLoading ? <span className="animate-spin mr-2"><Database className="w-6 h-6 mb-2" /></span> : <Database className="w-6 h-6 mb-2" />}
                  <span>Backup Database</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleAuditLogs}
                >
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Audit Logs</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleSecurityScan}
                  disabled={scanLoading || cooldown.scan}
                >
                  {scanLoading ? <span className="animate-spin mr-2"><Shield className="w-6 h-6 mb-2" /></span> : <Shield className="w-6 h-6 mb-2" />}
                  <span>Security Scan</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleOpenSettings}
                >
                  <Save className="w-6 h-6 mb-2" />
                  <span>Save Settings</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleOpenClearLogs}
                  disabled={clearingLogs}
                >
                  {clearingLogs ? <span className="animate-spin mr-2"><Trash2 className="w-6 h-6 mb-2" /></span> : <Trash2 className="w-6 h-6 mb-2" />}
                  <span>Clear Logs</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="w-16 h-6" />
                    </div>
                  ))}
                </div>
              ) : alertsError ? (
                <div className="py-8 text-center text-red-500">
                  Failed to load system alerts.
                </div>
              ) : !Array.isArray(alerts) || alerts.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No active system alerts</h3>
                  <p className="text-slate-600">All systems are running normally.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.type === 'critical' ? 'bg-red-500' : 
                          alert.type === 'high' ? 'bg-orange-500' : 
                          alert.type === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-slate-500">{alert.message}</p>
                          {alert.user && (
                            <p className="text-xs text-slate-400">
                              User: {alert.user.name || alert.user.email || "Unknown User"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.isRead ? "secondary" : "default"}>
                          {alert.isRead ? "Read" : "Unread"}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Management Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
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
              <Button size="sm" onClick={handleAddUser}>
                <Plus className="w-4 h-4 mr-2" />
                New User
              </Button>
            </div>
          </div>
          {/* User List Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, create, edit, and delete users</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="py-12 text-center">Loading users...</div>
              ) : usersError ? (
                <div className="py-12 text-center text-red-500">Failed to load users.</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Role</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Created</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium">
                            {user.name || user.email || "Unknown User"}
                          </td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2 capitalize">{user.role}</td>
                          <td className="px-4 py-2">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewUser(user.id)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUserId === user.id}
                            >
                              {deleteUserId === user.id ? (
                                <span className="animate-spin"><Trash2 className="w-4 h-4" /></span>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Add User Modal */}
          <AddUserModal isOpen={showAddUserModal} onClose={handleCloseAddUserModal} />
          {/* View User Modal */}
          <ViewUserModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} userId={selectedUserId} />
          {/* Edit User Modal */}
          <EditUserModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} user={selectedUserForEdit} />
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
              </DialogHeader>
              <div className="py-4">Are you sure you want to delete this user? This action cannot be undone.</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteUserMutation.isPending}>
                  {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
              <CardDescription>System security overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SSL Certificate</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Valid
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Expires: Dec 15, 2024</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Firewall</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Last scan: 2 hours ago</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Data Encryption</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">AES-256 encryption</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Access Control</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Secure
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Role-based permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Security Actions</CardTitle>
              <CardDescription>Security-related administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Shield className="w-5 h-5 mb-1" />
                  <span>Run Security Scan</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Activity className="w-5 h-5 mb-1" />
                  <span>View Audit Logs</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Users className="w-5 h-5 mb-1" />
                  <span>Manage Permissions</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Database className="w-5 h-5 mb-1" />
                  <span>Backup Security</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* System Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Array.isArray(alerts) ? alerts.length : 0}
                    </p>
                    <p className="text-sm text-slate-600">Total Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{Array.isArray(patients) ? patients.length : 0}</p>
                    <p className="text-sm text-slate-600">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {reportStats?.totalAppointments || 0}
                    </p>
                    <p className="text-sm text-slate-600">Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Usage Analytics</CardTitle>
                  <CardDescription>User activity and system performance metrics</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={analyticsStartDate}
                    onChange={(e) => setAnalyticsStartDate(e.target.value)}
                    className="w-40"
                    placeholder="Start Date"
                  />
                  <span className="text-slate-500">to</span>
                  <Input
                    type="date"
                    value={analyticsEndDate}
                    onChange={(e) => setAnalyticsEndDate(e.target.value)}
                    className="w-40"
                    placeholder="End Date"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAnalyticsStartDate("");
                      setAnalyticsEndDate("");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-slate-600">Loading analytics data...</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : analyticsError ? (
                <div className="py-12 text-center">
                  <div className="text-red-500 mb-2">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Failed to load analytics</h3>
                    <p className="text-sm text-slate-600">{analyticsErrorObj?.message || "An error occurred while fetching data"}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["analytics"] })}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : !analyticsData || analyticsData.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No analytics data available</h3>
                  <p className="text-slate-600">Try adjusting the date range or check back later.</p>
                </div>
              ) : (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData} margin={{ top: 16, right: 32, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        stroke="#0ea5e9" 
                        name="Active Users"
                        strokeWidth={2}
                        dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="#22c55e" 
                        name="Appointments"
                        strokeWidth={2}
                        dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="alertsTriggered" 
                        stroke="#ef4444" 
                        name="Alerts Triggered"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto mt-6">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Active Users</th>
                          <th className="px-4 py-2 text-left">Appointments</th>
                          <th className="px-4 py-2 text-left">Alerts Triggered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.map((row) => (
                          <tr key={row.date} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-2 font-medium">
                              {new Date(row.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">{row.activeUsers}</td>
                            <td className="px-4 py-2">{row.appointments}</td>
                            <td className="px-4 py-2">{row.alertsTriggered}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Logs Modal */}
      <Dialog open={auditLogsOpen} onOpenChange={setAuditLogsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Logs</DialogTitle>
          </DialogHeader>
          {auditLogsLoading ? (
            <div className="py-8 text-center">Loading logs...</div>
          ) : auditLogsError ? (
            <div className="py-8 text-center text-red-500">{auditLogsError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-2 text-left">Action</th>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">{log.user}</td>
                      <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsModalOpen} onClose={handleCloseSettings} />
      
      {/* Clear Logs Modal */}
      <ClearLogsModal 
        isOpen={isClearLogsModalOpen} 
        onClose={handleCloseClearLogs} 
        onConfirm={handleClearLogs}
        isLoading={clearingLogs}
      />
    </div>
  );
} 