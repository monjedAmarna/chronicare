import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "@/api/appointments.api";
import { useAuth } from "@/hooks/useAuth";
import CreateAppointmentModal from "@/components/CreateAppointmentModal";
import RescheduleAppointmentModal from "@/components/RescheduleAppointmentModal";
import ViewAppointmentModal from "@/components/ViewAppointmentModal";

const statusColor: Record<string, string> = {
  Upcoming: "primary",
  Completed: "success",
  Missed: "destructive",
};

export default function Appointments() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["appointments", "doctor"],
    queryFn: getAppointments,
  });

  const handleCreateSuccess = () => {
    // The modal will handle closing and refetching
  };

  const handleRescheduleSuccess = () => {
    // The modal will handle closing and refetching
  };

  const handleRescheduleClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleClose = () => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleViewClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handleViewClose = () => {
    setIsViewModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patient Appointments</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Schedule New Appointment
        </Button>
      </div>
      <Card>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Skeleton className="w-8 h-8" />
            <span className="ml-4 text-slate-500">Loading appointments...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            {error instanceof Error ? error.message : "Failed to load appointments."}
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((appt: any) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.patient || appt.patientName}</TableCell>
                    <TableCell>{appt.date || appt.appointmentDate}</TableCell>
                    <TableCell>{appt.time || appt.appointmentTime}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[appt.status] as any || "secondary"}>{appt.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mr-2" 
                        onClick={() => handleViewClick(appt)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRescheduleClick(appt)}
                      >
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    No appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Appointment Modal */}
      {user && (
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          doctorId={user.id}
          afterCreate={handleCreateSuccess}
        />
      )}

      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={handleRescheduleClose}
        appointment={selectedAppointment}
        afterUpdate={handleRescheduleSuccess}
      />

      {/* View Appointment Modal */}
      <ViewAppointmentModal
        isOpen={isViewModalOpen}
        onClose={handleViewClose}
        appointment={selectedAppointment}
      />
    </div>
  );
} 