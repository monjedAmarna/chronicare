import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPatients, Patient } from "@/api/patients.api";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Activity,
  Heart,
  AlertTriangle,
  User,
  Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import AddUserModal from "@/components/AddUserModal";

export default function DoctorPatients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [, setLocation] = useLocation();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients, isLoading, isError } = useQuery({
    queryKey: ["patients", "doctor"],
    queryFn: getPatients,
  });

  // Filter patients based on search and risk level
  const filteredPatients = React.useMemo(() => {
    if (!Array.isArray(patients)) return [];
    
    return patients.filter(patient => {
      // Safely handle undefined/null values and ensure searchTerm is a string
      const safeSearchTerm = (searchTerm || "").toLowerCase();
      const safePatientName = (patient.name || "").toLowerCase();
      const safePrimaryCondition = (patient.primaryCondition || "").toLowerCase();
      
      const matchesSearch = safePatientName.includes(safeSearchTerm) ||
                           safePrimaryCondition.includes(safeSearchTerm);
      const matchesRisk = filterRisk === "all" || patient.riskLevel === filterRisk;
      
      return matchesSearch && matchesRisk;
    });
  }, [patients, searchTerm, filterRisk]);

  const getRiskBadgeVariant = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "discharged": return "outline";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load patients.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-slate-600">Manage and monitor your patient list</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search patients by name or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" onClick={() => setShowAddUserModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Array.isArray(patients) ? patients.length : 0}</p>
                <p className="text-sm text-slate-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(patients) ? patients.filter(p => p.status === "active").length : 0}
                </p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(patients) ? patients.filter(p => p.riskLevel === "high" || p.riskLevel === "critical").length : 0}
                </p>
                <p className="text-sm text-slate-600">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(patients) ? patients.filter(p => p.nextAppointment).length : 0}
                </p>
                <p className="text-sm text-slate-600">With Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{patient.name || "Unknown Patient"}</CardTitle>
                  <CardDescription>
                    {patient.age ? `${patient.age} years` : "Age not specified"} • {patient.gender || "Not specified"}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                    {patient.riskLevel
                      ? patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)
                      : "Unknown"}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(patient.status)}>
                    {patient.status
                      ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1)
                      : "Unknown"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Primary Condition</p>
                  <p className="text-sm text-slate-600">{patient.primaryCondition || "Not specified"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Blood Pressure</p>
                    {/* Optional chaining prevents crash if healthMetrics is missing */}
                    <p className="font-medium">{patient.healthMetrics?.bloodPressure ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Glucose</p>
                    {/* Optional chaining prevents crash if healthMetrics is missing */}
                    <p className="font-medium">{patient.healthMetrics?.glucose ?? "N/A"} mg/dL</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Weight</p>
                    {/* Optional chaining prevents crash if healthMetrics is missing */}
                    <p className="font-medium">{patient.healthMetrics?.weight ?? "N/A"} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Height</p>
                    {/* Optional chaining prevents crash if healthMetrics is missing */}
                    <p className="font-medium">{patient.healthMetrics?.height ?? "N/A"} cm</p>
                  </div>
                  <div>
                    <p className="text-slate-500">BMI</p>
                    {/* Optional chaining prevents crash if healthMetrics is missing */}
                    <p className="font-medium">{patient.healthMetrics?.bmi ?? "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Activity className="w-4 h-4" />
                    <span>Last Reading: {patient.lastReading ? new Date(patient.lastReading).toLocaleDateString() : "No data"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone || "Not provided"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Mail className="w-4 h-4" />
                    <span>{patient.email || "Not provided"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span>{patient.address || "Not provided"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-slate-500">
                    {patient.medicationCount || 0} medications • {patient.adherenceRate || 0}% adherence
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLocation(`/doctor/patients/${patient.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No patients found</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Render AddUserModal for adding a patient */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        afterCreate={() => queryClient.invalidateQueries({ queryKey: ["patients", "doctor"] })}
        hideRoleSelector={true}
      />
    </div>
  );
} 