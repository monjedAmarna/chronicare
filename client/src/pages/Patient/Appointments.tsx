import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User as DoctorIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "@/api/appointments.api";

const statusColor: Record<string, string> = {
  Upcoming: "primary",
  Completed: "success",
  Missed: "destructive",
};

const statusTabs = [
  { value: "Upcoming", label: "Upcoming" },
  { value: "Completed", label: "Completed" },
  { value: "Missed", label: "Missed" },
  { value: "All", label: "All" },
];

export default function PatientAppointments() {
  const [tab, setTab] = useState("Upcoming");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: getAppointments,
  });

  let filtered: any[] = [];
  if (Array.isArray(data)) {
    filtered = tab === "All" ? data : data.filter((appt: any) => appt.status === tab);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          {statusTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Skeleton className="w-8 h-8" />
          <span className="ml-4 text-slate-500">Loading appointments...</span>
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">
          {error instanceof Error ? error.message : "Failed to load appointments."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-slate-500">No appointments found.</div>
          ) : (
            filtered.map((appt) => (
              <Card key={appt.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="w-4 h-4 mr-1 text-teal-600" />
                  {appt.date || appt.appointmentDate}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 mr-1 text-slate-500" />
                  {appt.time || appt.appointmentTime}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DoctorIcon className="w-4 h-4 mr-1 text-slate-500" />
                  {appt.doctor || appt.doctorName}
                </div>
                <div className="mt-2">
                  <Badge variant={statusColor[appt.status] as any || "secondary"}>{appt.status}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 