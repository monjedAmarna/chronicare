import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMedications } from "@/api/medications.api";
import { getHealthMetrics } from "@/api/health.api";
import { getAppointments } from "@/api/appointments.api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { useAlertsQuery } from "@/hooks/useAlertsQuery";
import HealthSummaryStats from "@/components/HealthSummaryStats";
import AlertListModal from "@/components/AlertListModal";
import { 
  Activity, 
  Calendar, 
  Heart, 
  Pill, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Clock,
  Wifi,
  WifiOff,
  RotateCw
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getPatientHealthSummary } from "@/api/analytics.api";
import type { Alert } from "@/api/alerts.api";
import { getUserDisplayName } from "@/lib/utils";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize Socket.IO connection for real-time alerts
  const { isConnected } = useSocket(user?.id);

  // Fetch patient data
  const {
    data: medications,
    isLoading: medicationsLoading,
    refetch: refetchMedications,
  } = useQuery({
    queryKey: ["medications", location],
    queryFn: getMedications,
  });

  const {
    data: healthMetrics,
    isLoading: healthLoading,
    refetch: refetchHealthMetrics,
  } = useQuery({
    queryKey: ["health-metrics", location],
    queryFn: getHealthMetrics,
  });

  const {
    data: appointments,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ["appointments", location],
    queryFn: getAppointments,
  });

  // Health summary stats query (moved from component)
  const {
    data: healthSummary,
    isLoading: healthSummaryLoading,
    error: healthSummaryError,
    refetch: refetchHealthSummary,
    isFetching: isFetchingHealthSummary,
  } = useQuery({
    queryKey: ["patient-health-summary"],
    queryFn: getPatientHealthSummary,
  });

  // Fetch alerts for modal
  const { data: alerts = [] } = useAlertsQuery();

  // Track if any refetch is in progress
  const [refreshing, setRefreshing] = React.useState(false);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = React.useState(false);
  const [selectedAlerts, setSelectedAlerts] = React.useState<Alert[]>([]);
  const [modalTitle, setModalTitle] = React.useState("");

  // Filter alerts by status
  const criticalAlerts = alerts.filter((alert: Alert) => alert.status === "critical");
  const nonCriticalAlerts = alerts.filter((alert: Alert) => alert.status !== "critical");

  const handleOpenAlertModal = (alerts: Alert[], title: string) => {
    setSelectedAlerts(alerts);
    setModalTitle(title);
    setAlertModalOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchMedications(),
        refetchHealthMetrics(),
        refetchAppointments(),
        refetchHealthSummary(),
        queryClient.invalidateQueries({ queryKey: ["alerts"] }),
      ]);
      toast({
        title: "Data refreshed successfully ✅",
        description: "Your dashboard data is up to date.",
      });
    } catch (e) {
      toast({
        title: "Failed to refresh data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const isLoading = medicationsLoading || healthLoading || appointmentsLoading || healthSummaryLoading;
  const isAnyFetching = refreshing || isFetchingHealthSummary;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const activeMedications = Array.isArray(medications) ? medications.filter(m => m.isActive).length : 0;
  const recentMetrics = Array.isArray(healthMetrics) ? healthMetrics.slice(0, 5) : [];
  const upcomingAppointments = Array.isArray(appointments) ? appointments.slice(0, 3) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="text-slate-600">Welcome back, {getUserDisplayName(user)}!</p>
        </div>
        <div className="flex items-center space-x-2">
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
          <Button asChild>
            <Link href="/patient/health-metrics">
              <Plus className="w-4 h-4 mr-2" />
              Add Health Data
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isAnyFetching}
            className="ml-2 flex items-center"
          >
            {isAnyFetching ? (
              <RotateCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4 mr-2" />
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Health Summary Stats */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Health Summary</h2>
          <HealthSummaryStats
            data={healthSummary}
            isLoading={healthSummaryLoading}
            error={healthSummaryError}
            onHealthAlertsClick={() => handleOpenAlertModal(nonCriticalAlerts, "Health Alerts")}
            onCriticalAlertsClick={() => handleOpenAlertModal(criticalAlerts, "Critical Alerts")}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMedications}</div>
            <p className="text-xs text-muted-foreground">
              Currently taking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Records</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMetrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled visits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            Real-time Health Monitoring
          </CardTitle>
          <CardDescription className="text-blue-700">
            Your health data is continuously monitored for any concerning readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Glucose:</strong> Alerts for readings below 70 or above 126 mg/dL (fasting)</p>
            <p>• <strong>Blood Pressure:</strong> Alerts for readings above 140/90 mmHg</p>
            <p>• <strong>Critical Alerts:</strong> Immediate notifications for dangerous levels</p>
            {isConnected ? (
              <p className="text-green-700 font-medium">✓ Real-time monitoring is active</p>
            ) : (
              <p className="text-red-700 font-medium">⚠ Real-time monitoring is offline</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Health Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Health Data
            </CardTitle>
            <CardDescription>
              Your latest health measurements and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMetrics.length > 0 ? (
              <div className="space-y-3">
                {recentMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-medium">{metric.type}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(metric.recordedAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.value}</p>
                      {metric.unit && <p className="text-sm text-slate-500">{metric.unit}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No health data recorded yet</p>
                <Button asChild className="mt-2">
                  <Link href="/patient/health-metrics">Add Health Data</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              Your scheduled medical appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Appointment</p>
                        <p className="text-sm text-slate-500">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No upcoming appointments</p>
                <Button asChild className="mt-2">
                  <Link href="/patient/appointments">Schedule Appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/patient/medications">
                <Pill className="w-6 h-6 mb-2" />
                <span className="text-sm">Medications</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/patient/health-metrics">
                <Activity className="w-6 h-6 mb-2" />
                <span className="text-sm">Health Data</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/patient/care-plans">
                <Heart className="w-6 h-6 mb-2" />
                <span className="text-sm">Care Plans</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/patient/appointments">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Appointments</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert List Modal */}
      <AlertListModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title={modalTitle}
        alerts={selectedAlerts}
      />
    </div>
  );
} 