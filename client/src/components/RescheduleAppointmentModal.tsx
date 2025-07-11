import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointment } from "@/api/appointments.api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    patientName?: string;
    date: string;
    time: string;
  } | null;
  afterUpdate?: () => void;
}

interface AppointmentFormData {
  date: string;
  time: string;
}

interface AppointmentFormErrors {
  date?: string;
  time?: string;
}

export default function RescheduleAppointmentModal({ 
  isOpen, 
  onClose, 
  appointment, 
  afterUpdate 
}: RescheduleAppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: "",
    time: "",
  });
  const [errors, setErrors] = useState<AppointmentFormErrors>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Pre-fill form when appointment data changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        date: appointment.date,
        time: appointment.time,
      });
      setErrors({});
    }
  }, [appointment]);

  const updateAppointmentMutation = useMutation({
    mutationFn: (data: { id: number; date: string; time: string }) => 
      updateAppointment(data.id.toString(), { date: data.date, time: data.time }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });
      if (afterUpdate) afterUpdate();
      queryClient.invalidateQueries({ queryKey: ["appointments", "doctor"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to reschedule appointment",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: AppointmentFormErrors = {};
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
    if (!validateForm() || !appointment) return;
    
    const appointmentData = {
      id: appointment.id,
      date: formData.date,
      time: formData.time,
    };
    
    updateAppointmentMutation.mutate(appointmentData);
  };

  const handleClose = () => {
    setFormData({
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

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Reschedule Appointment</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={updateAppointmentMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Update the date and time for the appointment with {appointment.patientName || "the patient"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Appointment Info */}
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Current Appointment:</p>
            <p className="text-sm font-medium">
              {appointment.patientName || "Patient"} - {appointment.date} at {appointment.time}
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">New Date *</Label>
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
            <Label htmlFor="time">New Time *</Label>
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
              disabled={updateAppointmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateAppointmentMutation.isPending}
            >
              {updateAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Appointment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 