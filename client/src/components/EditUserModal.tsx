import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, User } from "@/api/users.api";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface FormData {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "patient",
    isActive: true,
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "patient",
        isActive: user.isActive ?? true,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
      setErrors({});
    }
  }, [user]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: Partial<User>) => updateUser(user!.id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updateData: Partial<User> = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      isActive: formData.isActive,
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
    };

    updateUserMutation.mutate(updateData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit User</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Update user information. Changes will be applied immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => handleInputChange("role", value)}
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Account Status</Label>
              <p className="text-sm text-slate-600">
                {formData.isActive ? "Active" : "Inactive"} - User can {formData.isActive ? "access" : "not access"} the system
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>

          {/* First Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name (Optional)</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>

          {/* Last Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name (Optional)</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>

          {/* Current User Info */}
          <div className="bg-slate-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Current User Info</h4>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">User ID:</span> {user.id}</p>
              <p><span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(user.updatedAt).toLocaleDateString()}</p>
              {user.lastLoginAt && (
                <p><span className="font-medium">Last Login:</span> {new Date(user.lastLoginAt).toLocaleDateString()}</p>
              )}
              <p>
                <span className="font-medium">Email Verified:</span> 
                <span className={user.isEmailVerified ? "text-green-600" : "text-red-600"}>
                  {user.isEmailVerified ? " Yes" : " No"}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 