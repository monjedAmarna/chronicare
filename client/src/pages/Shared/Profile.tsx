import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateProfile, UserProfile } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { getUserDisplayName } from "@/lib/utils";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Activity, 
  Edit, 
  Save, 
  X, 
  Camera,
  Shield,
  AlertCircle
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch current user data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "height" || name === "weight" ? parseFloat(value) || undefined : value
    }));
  };

  const handleEdit = () => {
    setFormData(profile || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return "Admin";
      case 'doctor': return "Doctor";
      case 'patient': return "Patient";
      default: return "Unknown";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return "destructive";
      case 'doctor': return "default";
      case 'patient': return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load profile.
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-slate-500">
          No profile data available.
        </div>
      </div>
    );
  }

  const currentData = isEditing ? formData : profile;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-slate-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {profile.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold">
                  {getUserDisplayName(profile)}
                </h3>
                <p className="text-sm text-slate-600">
                  {profile.name || profile.email || "Unknown User"}
                </p>
                <Badge variant={getRoleBadgeVariant(profile.role)} className="mt-2">
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Account Status</span>
                  <Badge variant={profile.isActive ? "default" : "secondary"}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Email Verified</span>
                  <Badge variant={profile.isEmailVerified ? "default" : "secondary"}>
                    {profile.isEmailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Member Since</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                {profile.lastLoginAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Last Login</span>
                    <span>{new Date(profile.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={updateProfileMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {updateProfileMutation.isError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    Failed to update profile. Please try again.
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">First Name</label>
                      {isEditing ? (
                        <Input
                          name="firstName"
                          value={currentData.firstName || ""}
                          onChange={handleInputChange}
                          disabled={updateProfileMutation.isPending}
                        />
                      ) : (
                        <p className="text-sm text-slate-600">{profile.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Last Name</label>
                      {isEditing ? (
                        <Input
                          name="lastName"
                          value={currentData.lastName || ""}
                          onChange={handleInputChange}
                          disabled={updateProfileMutation.isPending}
                        />
                      ) : (
                        <p className="text-sm text-slate-600">{profile.lastName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-600">{profile.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Phone</label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            name="phone"
                            value={currentData.phone || ""}
                            onChange={handleInputChange}
                            className="pl-10"
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <p className="text-sm text-slate-600">{profile.phone || "Not provided"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                      {isEditing ? (
                        <Input
                          name="dateOfBirth"
                          type="date"
                          value={currentData.dateOfBirth || ""}
                          onChange={handleInputChange}
                          disabled={updateProfileMutation.isPending}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Gender</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={currentData.gender || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={updateProfileMutation.isPending}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-sm text-slate-600">{profile.gender || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Address Information</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Address</label>
                      {isEditing ? (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            name="address"
                            value={currentData.address || ""}
                            onChange={handleInputChange}
                            className="pl-10"
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <p className="text-sm text-slate-600">{profile.address || "Not provided"}</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">City</label>
                        {isEditing ? (
                          <Input
                            name="city"
                            value={currentData.city || ""}
                            onChange={handleInputChange}
                            disabled={updateProfileMutation.isPending}
                          />
                        ) : (
                          <p className="text-sm text-slate-600">{profile.city || "Not provided"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">State</label>
                        {isEditing ? (
                          <Input
                            name="state"
                            value={currentData.state || ""}
                            onChange={handleInputChange}
                            disabled={updateProfileMutation.isPending}
                          />
                        ) : (
                          <p className="text-sm text-slate-600">{profile.state || "Not provided"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ZIP Code</label>
                        {isEditing ? (
                          <Input
                            name="zipCode"
                            value={currentData.zipCode || ""}
                            onChange={handleInputChange}
                            disabled={updateProfileMutation.isPending}
                          />
                        ) : (
                          <p className="text-sm text-slate-600">{profile.zipCode || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Information */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Health Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Height (cm)</label>
                      {isEditing ? (
                        <div className="relative">
                          <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            name="height"
                            type="number"
                            value={currentData.height || ""}
                            onChange={handleInputChange}
                            className="pl-10"
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-slate-400" />
                          <p className="text-sm text-slate-600">{profile.height ? `${profile.height} cm` : "Not provided"}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
                      {isEditing ? (
                        <div className="relative">
                          <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            name="weight"
                            type="number"
                            value={currentData.weight || ""}
                            onChange={handleInputChange}
                            className="pl-10"
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-slate-400" />
                          <p className="text-sm text-slate-600">{profile.weight ? `${profile.weight} kg` : "Not provided"}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Blood Type</label>
                      {isEditing ? (
                        <select
                          name="bloodType"
                          value={currentData.bloodType || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={updateProfileMutation.isPending}
                        >
                          <option value="">Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      ) : (
                        <p className="text-sm text-slate-600">{profile.bloodType || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
