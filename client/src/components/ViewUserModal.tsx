import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getUserById, User } from "@/api/users.api";
import { useToast } from "@/hooks/use-toast";
import { 
  X, 
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  UserCheck
} from "lucide-react";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function ViewUserModal({ isOpen, onClose, userId }: ViewUserModalProps) {
  const { toast } = useToast();

  // Fetch user details
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: isOpen && userId !== null,
    retry: 1,
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return "destructive";
      case 'doctor': return "default";
      case 'patient': return "secondary";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleClose = () => {
    onClose();
  };

  // Show error toast if query fails
  React.useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user account.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load user</h3>
            <p className="text-slate-600">Unable to retrieve user details. Please try again.</p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.name || user.email || "Unknown User"}
                </h3>
                <p className="text-slate-600">{user.email}</p>
              </div>
            </div>

            {/* Role and Status */}
            <div className="flex gap-2">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <Badge variant={getStatusBadgeVariant(user.isActive)}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
              {user.isEmailVerified ? (
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Email Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Email Not Verified
                </Badge>
              )}
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Basic Information</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Full Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Role:</span>
                    <span className="font-medium">{getRoleLabel(user.role)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Status:</span>
                    <span className="font-medium">{user.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Contact Information</h4>
                
                <div className="space-y-2">
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Address:</span>
                      <span className="font-medium">{user.address}</span>
                    </div>
                  )}
                  
                  {user.city && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">City:</span>
                      <span className="font-medium">{user.city}</span>
                    </div>
                  )}
                  
                  {user.state && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">State:</span>
                      <span className="font-medium">{user.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(user.dateOfBirth || user.gender || user.bloodType || user.height || user.weight) && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Additional Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.dateOfBirth && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Date of Birth:</span>
                      <span className="font-medium">{formatDate(user.dateOfBirth)}</span>
                    </div>
                  )}
                  
                  {user.gender && (
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Gender:</span>
                      <span className="font-medium">{user.gender}</span>
                    </div>
                  )}
                  
                  {user.bloodType && (
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Blood Type:</span>
                      <span className="font-medium">{user.bloodType}</span>
                    </div>
                  )}
                  
                  {user.height && (
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Height:</span>
                      <span className="font-medium">{user.height} cm</span>
                    </div>
                  )}
                  
                  {user.weight && (
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Weight:</span>
                      <span className="font-medium">{user.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Account Information</h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Created:</span>
                  <span className="font-medium">{formatDate(user.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(user.updatedAt)}</span>
                </div>
                
                {user.lastLoginAt && (
                  <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Last Login:</span>
                    <span className="font-medium">{formatDate(user.lastLoginAt)}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-600">User ID:</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                    {user.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 