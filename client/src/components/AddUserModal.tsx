import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPatient } from "@/api/patients.api";
import { Patient } from "@/api/patients.api";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  afterCreate?: () => void;
}

interface PatientFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
}

interface PatientFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AddUserModal({ isOpen, onClose, afterCreate }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
  });
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPatientMutation = useMutation({
    mutationFn: (data: Omit<Patient, "id"> & { password: string }) => createPatient(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      if (afterCreate) afterCreate();
      queryClient.invalidateQueries({ queryKey: ["patients", "doctor"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create patient",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: PatientFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const patientData: Omit<Patient, "id"> & { password: string } = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      primaryCondition: "",
      lastReading: "",
      recentActivity: "",
      medicationCount: 0,
      adherenceRate: 0,
      alertCount: 0,
      carePlanStatus: "current",
    };
    createPatientMutation.mutate(patientData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dateOfBirth: "",
      phone: "",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add New Patient</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={createPatientMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Create a new patient account with the required information.
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
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              type="text"
              placeholder="Enter gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
            />
          </div>
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              placeholder="Enter date of birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />
          </div>
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="text"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPatientMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPatientMutation.isPending}
            >
              {createPatientMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Patient"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 