import React from "react";
import { useParams, useLocation } from "wouter";
import { getPatientById } from "@/api/patients.api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft } from "lucide-react";

export default function DoctorPatientDetails() {
  const params = useParams();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Only allow doctors
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "doctor")) {
      setLocation("/doctor/patients");
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  const {
    data: patient,
    isLoading: patientLoading,
    isError,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
    enabled: !!id && isAuthenticated && user?.role === "doctor",
  });

  if (isLoading || patientLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load patient details.
        <div className="mt-4">
          <Button variant="outline" onClick={() => setLocation("/doctor/patients")}>Back to Patients</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => setLocation("/doctor/patients")}> <ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-2xl">{patient.name}</CardTitle>
          <div className="text-slate-600">{patient.age} years • {patient.gender}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Email:</strong> {patient.email}</div>
            <div><strong>Phone:</strong> {patient.phone}</div>
            <div><strong>Address:</strong> {patient.address}</div>
            <div><strong>Primary Condition:</strong> {patient.primaryCondition}</div>
            <div><strong>Status:</strong> {patient.status}</div>
            <div><strong>Risk Level:</strong> {patient.riskLevel}</div>
            <div><strong>Last Reading:</strong> {patient.lastReading ? new Date(patient.lastReading).toLocaleDateString() : "N/A"}</div>
            <div><strong>Next Appointment:</strong> {patient.nextAppointment || "N/A"}</div>
            <div><strong>Medications:</strong> {patient.medicationCount}</div>
            <div><strong>Adherence Rate:</strong> {patient.adherenceRate}%</div>
            <div><strong>Care Plan Status:</strong> {patient.carePlanStatus}</div>
            {patient.healthMetrics && (
              <div className="pt-2">
                <div><strong>Blood Pressure:</strong> {patient.healthMetrics.bloodPressure ?? "N/A"}</div>
                <div><strong>Glucose:</strong> {patient.healthMetrics.glucose ?? "N/A"}</div>
                <div><strong>Weight:</strong> {patient.healthMetrics.weight ?? "N/A"}</div>
                <div><strong>Height:</strong> {patient.healthMetrics.height ?? "N/A"}</div>
                <div><strong>BMI:</strong> {patient.healthMetrics.bmi ?? "N/A"}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 