import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCarePlan } from "@/api/careplans.api";
import { getPatients } from "@/api/patients.api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface CreateCarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  afterCreate?: () => void;
}

interface CarePlanFormData {
  patientId: string;
  title: string;
  description: string;
  goals: string;
  duration: string;
  assignedTo: string;
  status: string;
  totalTasks: string;
  completedTasks: string;
}

interface CarePlanFormErrors {
  patientId?: string;
  title?: string;
  description?: string;
  duration?: string;
  totalTasks?: string;
  completedTasks?: string;
}

export default function CreateCarePlanModal({ isOpen, onClose, doctorId, afterCreate }: CreateCarePlanModalProps) {
  const [formData, setFormData] = useState<CarePlanFormData>({
    patientId: "",
    title: "",
    description: "",
    goals: "",
    duration: "4",
    assignedTo: "",
    status: "ongoing",
    totalTasks: "0",
    completedTasks: "0",
  });
  const [errors, setErrors] = useState<CarePlanFormErrors>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch patients for the dropdown
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", "doctor"],
    queryFn: getPatients,
  });

  const createCarePlanMutation = useMutation({
    mutationFn: (data: any) => createCarePlan(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Care plan created successfully",
      });
      if (afterCreate) afterCreate();
      queryClient.invalidateQueries({ queryKey: ["careplans", "doctor"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create care plan",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: CarePlanFormErrors = {};
    
    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    
    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) newErrors.duration = "Duration must be a positive number";
    
    const totalTasks = parseInt(formData.totalTasks);
    if (isNaN(totalTasks) || totalTasks < 0) newErrors.totalTasks = "Total tasks must be 0 or greater";
    
    const completedTasks = parseInt(formData.completedTasks);
    if (isNaN(completedTasks) || completedTasks < 0) newErrors.completedTasks = "Completed tasks must be 0 or greater";
    
    if (completedTasks > totalTasks) newErrors.completedTasks = "Completed tasks cannot exceed total tasks";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Parse goals from textarea (assuming one goal per line)
    const goalsArray = formData.goals
      .split('\n')
      .map(goal => goal.trim())
      .filter(goal => goal.length > 0);
    
    const carePlanData = {
      patientId: parseInt(formData.patientId),
      title: formData.title.trim(),
      description: formData.description.trim(),
      goals: goalsArray,
      duration: parseInt(formData.duration),
      assignedTo: formData.assignedTo.trim() || null,
      status: formData.status,
      totalTasks: parseInt(formData.totalTasks),
      completedTasks: parseInt(formData.completedTasks),
    };
    
    createCarePlanMutation.mutate(carePlanData);
  };

  const handleClose = () => {
    setFormData({
      patientId: "",
      title: "",
      description: "",
      goals: "",
      duration: "4",
      assignedTo: "",
      status: "ongoing",
      totalTasks: "0",
      completedTasks: "0",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof CarePlanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Care Plan</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={createCarePlanMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive care plan for your patient.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient *</Label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => handleInputChange("patientId", value)}
            >
              <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patientsLoading ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading patients...
                    </div>
                  </SelectItem>
                ) : patients && patients.length > 0 ? (
                  patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No patients available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.patientId && <p className="text-sm text-red-500">{errors.patientId}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter care plan title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the care plan objectives and approach"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              placeholder="Enter goals (one per line)&#10;Example:&#10;Reduce blood pressure to normal range&#10;Improve medication adherence&#10;Increase physical activity"
              value={formData.goals}
              onChange={(e) => handleInputChange("goals", e.target.value)}
              rows={4}
            />
            <p className="text-xs text-slate-500">Enter one goal per line</p>
          </div>

          {/* Duration and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="4"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              placeholder="Enter assigned person (optional)"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange("assignedTo", e.target.value)}
            />
          </div>

          {/* Tasks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalTasks">Total Tasks *</Label>
              <Input
                id="totalTasks"
                type="number"
                min="0"
                placeholder="0"
                value={formData.totalTasks}
                onChange={(e) => handleInputChange("totalTasks", e.target.value)}
                className={errors.totalTasks ? "border-red-500" : ""}
              />
              {errors.totalTasks && <p className="text-sm text-red-500">{errors.totalTasks}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completedTasks">Completed Tasks *</Label>
              <Input
                id="completedTasks"
                type="number"
                min="0"
                placeholder="0"
                value={formData.completedTasks}
                onChange={(e) => handleInputChange("completedTasks", e.target.value)}
                className={errors.completedTasks ? "border-red-500" : ""}
              />
              {errors.completedTasks && <p className="text-sm text-red-500">{errors.completedTasks}</p>}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createCarePlanMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCarePlanMutation.isPending || patientsLoading}
            >
              {createCarePlanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Care Plan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 