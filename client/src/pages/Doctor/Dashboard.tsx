import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPatients, Patient } from "@/api/patients.api";
import { getAlerts, Alert } from "@/api/alerts.api";
import { getAppointments } from "@/api/appointments.api";
import { getActivities } from "@/api/activities.api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  UserCheck, 
  Clock,
  Calendar,
  Heart,
  Activity as ActivityIcon,
  Wifi,
  WifiOff
} from "lucide-react";
import { useLocation } from "wouter";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  patientName?: string;
}

export default function DoctorDashboard() {
  const [location] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Initialize Socket.IO connection for real-time alerts
  const { isConnected } = useSocket(user?.id);

  // Fetch patients
  const { data: patients, isLoading: patientsLoading, isError: patientsError } = useQuery({
    queryKey: ["patients", "doctor", location],
    queryFn: getPatients,
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts", "doctor", location],
    queryFn: getAlerts,
  });

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ["appointments", "doctor", location],
    queryFn: getAppointments,
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading, isError: activitiesError } = useQuery({
    queryKey: ["activities", "doctor", location],
    queryFn: getActivities,
  });

  const isLoading = patientsLoading || alertsLoading || appointmentsLoading || activitiesLoading;
  const isError = patientsError || alertsError || appointmentsError || activitiesError;

  // Calculate stats from real data
  const totalPatients = Array.isArray(patients) ? patients.length : 0;
  const unreadAlerts = Array.isArray(alerts) ? alerts.filter(alert => !alert.read).length : 0;
  const highRiskPatients = Array.isArray(patients) ? patients.filter(p => p.riskLevel === "high" || p.riskLevel === "critical").length : 0;
  const urgentPatients = Array.isArray(patients) ? patients.filter(p => p.status === "active" && p.riskLevel === "critical").length : 0;
  const stablePatients = Array.isArray(patients) ? patients.filter(p => p.status === "active" && p.riskLevel === "low").length : 0;

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const todayAppointmentsCount = Array.isArray(appointments)
    ? appointments.filter(a => a.status === "Upcoming" && a.date === today).length
    : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <Skeleton className="w-8 h-8" />
          <span className="ml-4 text-slate-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load dashboard data.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's an overview of your patients and recent activity.</p>
          </div>
          {/* Real-time connection indicator */}
          <div className="flex items-center space-x-1 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Real-time alerts active</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-600">Alerts offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-slate-600">Active patients under care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadAlerts}</div>
            <p className="text-xs text-slate-600">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
            <Heart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highRiskPatients}</div>
            <p className="text-xs text-slate-600">Need close monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {todayAppointmentsCount}
            </div>
            <p className="text-xs text-slate-600">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts Info Card */}
      <Card className="border-red-200 bg-red-50 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Real-time Patient Monitoring
          </CardTitle>
          <CardDescription className="text-red-700">
            You will receive instant notifications when patients submit concerning health readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-red-800">
            <p>• <strong>Critical Alerts:</strong> Immediate notifications for dangerous glucose or blood pressure levels</p>
            <p>• <strong>Patient-Specific:</strong> Alerts are filtered to show only your assigned patients</p>
            <p>• <strong>Real-time Updates:</strong> No need to refresh - alerts appear instantly</p>
            {isConnected ? (
              <p className="text-green-700 font-medium">✓ Real-time monitoring is active</p>
            ) : (
              <p className="text-red-700 font-medium">⚠ Real-time monitoring is offline</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Patient Status Overview
            </CardTitle>
            <CardDescription>Current status of your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stable Patients</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {stablePatients}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Urgent Cases</span>
                <Badge variant="destructive">
                  {urgentPatients}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Risk</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {highRiskPatients}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : activitiesError ? (
              <div className="text-center text-red-500 py-4">
                Failed to load recent activity.
              </div>
            ) : !Array.isArray(activities) || activities.length === 0 ? (
              <div className="text-center text-slate-500 py-4">
                No recent activity
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Recent Alerts
          </CardTitle>
          <CardDescription>Latest patient alerts requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(alerts) && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === "critical" ? "bg-red-500" :
                      alert.severity === "high" ? "bg-orange-500" :
                      alert.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                    <div>
                      <p className="font-medium">{alert.patientName}</p>
                      <p className="text-sm text-slate-600">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                    <Badge variant={alert.read ? "secondary" : "destructive"}>
                      {alert.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No alerts at the moment
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 