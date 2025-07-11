import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointment } from "@/api/appointments.api";
import { getPatients } from "@/api/patients.api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  afterCreate?: () => void;
}

interface AppointmentFormData {
  patientId: string;
  date: string;
  time: string;
}

interface AppointmentFormErrors {
  patientId?: string;
  date?: string;
  time?: string;
}

export default function CreateAppointmentModal({ isOpen, onClose, doctorId, afterCreate }: CreateAppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: "",
    date: "",
    time: "",
  });
  const [errors, setErrors] = useState<AppointmentFormErrors>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch patients for the dropdown
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", "doctor"],
    queryFn: getPatients,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: { doctorId: number; patientId: string; date: string; time: string }) => 
      createAppointment(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      if (afterCreate) afterCreate();
      queryClient.invalidateQueries({ queryKey: ["appointments", "doctor"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to schedule appointment",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: AppointmentFormErrors = {};
    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    
    // Additional validation for date (not in the past)
    if (formData.date && formData.time) {
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (appointmentDateTime < now) {
        newErrors.date = "Appointment cannot be in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const appointmentData = {
      doctorId,
      patientId: parseInt(formData.patientId),
      date: formData.date,
      time: formData.time,
    };
    
    createAppointmentMutation.mutate(appointmentData);
  };

  const handleClose = () => {
    setFormData({
      patientId: "",
      date: "",
      time: "",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Schedule New Appointment</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={createAppointmentMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Schedule a new appointment with a patient.
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className={errors.date ? "border-red-500" : ""}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              className={errors.time ? "border-red-500" : ""}
            />
            {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createAppointmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAppointmentMutation.isPending || patientsLoading}
            >
              {createAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 