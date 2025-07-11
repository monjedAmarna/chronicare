import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Clock, User, AlertCircle } from "lucide-react";

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    patientName?: string;
    date: string;
    time: string;
    status: string;
  } | null;
}

const statusColor: Record<string, string> = {
  Upcoming: "primary",
  Completed: "success",
  Missed: "destructive",
};

const statusIcon: Record<string, React.ReactNode> = {
  Upcoming: <Calendar className="h-4 w-4" />,
  Completed: <Calendar className="h-4 w-4" />,
  Missed: <AlertCircle className="h-4 w-4" />,
};

export default function ViewAppointmentModal({ 
  isOpen, 
  onClose, 
  appointment 
}: ViewAppointmentModalProps) {
  if (!appointment) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Appointment Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View details for this appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appointment ID */}
          <div className="text-sm text-gray-500">
            Appointment ID: #{appointment.id}
          </div>

          {/* Patient Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Patient</p>
                <p className="text-sm text-gray-600">
                  {appointment.patientName || "Patient name not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">
                  {formatDate(appointment.date)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">
                  {formatTime(appointment.time)}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {statusIcon[appointment.status] || <AlertCircle className="h-5 w-5 text-gray-500" />}
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                <Badge 
                  variant={statusColor[appointment.status] as any || "secondary"}
                  className="mt-1"
                >
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Additional Info Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This is a read-only view of the appointment details. 
              To make changes, use the "Reschedule" button in the appointments list.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 