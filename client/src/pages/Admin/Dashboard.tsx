import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getUsers, User } from "@/api/users.api";
import { UserRole } from "@/types";
import { getPatients, Patient } from "@/api/patients.api";
import { getAppointments } from "@/api/appointments.api";
import { getAlerts, Alert } from "@/api/alerts.api";
import { getReportStats, ReportStats } from "@/api/reports.api";
import { 
  Users, 
  UserCheck, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  Shield,
  Clock,
  Heart,
  Droplet,
  HeartPulse
} from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [location] = useLocation();
  // Fetch various data
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users", "admin", location],
    queryFn: () => getUsers(),
  });

  const { data: patients, isLoading: patientsLoading, isError: patientsError } = useQuery({
    queryKey: ["patients", "admin", location],
    queryFn: getPatients,
  });

  const { data: appointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ["appointments", "admin", location],
    queryFn: getAppointments,
  });

  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts", "admin", location],
    queryFn: getAlerts,
  });

  const { data: reportStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["reportStats", "admin", location],
    queryFn: getReportStats,
  });

  // System Health Overview - fetch from /api/system/health
  const { data: systemHealth, isLoading: healthLoading, isError: healthError } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const res = await axios.get("/api/system/health");
      return res.data;
    },
  });

  // Recent Activity - fetch from /api/activities
  const { data: activitiesData, isLoading: activitiesLoading, isError: activitiesError } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const res = await axios.get("/api/activities");
      return res.data;
    },
  });

  // Average Glucose - fetch from /api/health-metrics/average-glucose
  const { data: avgGlucoseData, isLoading: avgGlucoseLoading, isError: avgGlucoseError } = useQuery({
    queryKey: ["average-glucose"],
    queryFn: async () => {
      const res = await axios.get("/api/health-metrics/average-glucose");
      return res.data;
    },
  });

  // Health Metrics Summary - fetch from /api/health-metrics/summary
  const { data: metricsSummary, isLoading: metricsSummaryLoading, isError: metricsSummaryError } = useQuery({
    queryKey: ["health-metrics-summary"],
    queryFn: async () => {
      const res = await axios.get("/api/health-metrics/summary");
      return res.data;
    },
  });

  // Health Data Records Table - fetch from /api/health-metrics/recent
  const { data: recentMetrics, isLoading: recentMetricsLoading, isError: recentMetricsError } = useQuery({
    queryKey: ["recent-health-metrics"],
    queryFn: async () => {
      const res = await axios.get("/api/health-metrics/recent");
      return res.data;
    },
  });

  // Recent Trends - fetch from /api/analytics/recent-trends
  const { data: trendsData, isLoading: trendsLoading, isError: trendsError } = useQuery({
    queryKey: ["recent-trends"],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/recent-trends");
      return res.data;
    },
  });

  // Prepare chart data: group by date, each type as a line
  const chartData = React.useMemo(() => {
    if (!Array.isArray(trendsData)) return [];
    // Get all unique dates
    const dates = Array.from(new Set(trendsData.map((d: any) => d.date))).sort();
    // Build a row for each date
    return dates.map(date => {
      const row: any = { date };
      trendsData.forEach((d: any) => {
        if (d.date === date) {
          row[d.type] = d.average;
        }
      });
      return row;
    });
  }, [trendsData]);

  const isLoading = usersLoading || patientsLoading || appointmentsLoading || alertsLoading || statsLoading || healthLoading || activitiesLoading;
  const isError = usersError || patientsError || appointmentsError || alertsError || statsError || healthError || activitiesError;

  // Calculate stats from real data
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeUsers = Array.isArray(users) ? users.filter(u => u.isActive).length : 0;
  const totalPatients = Array.isArray(patients) ? patients.length : 0;
  const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
  const unreadAlerts = Array.isArray(alerts) ? alerts.filter(a => !a.read).length : 0;
  const highRiskPatients = Array.isArray(patients) ? patients.filter(p => p.riskLevel === "high" || p.riskLevel === "critical").length : 0;

  // When mapping/filtering users, ensure user.role is treated as string
  const getRoleCount = (role: UserRole) => Array.isArray(users) ? users.filter((u: any) => String(u.role) === role).length : 0;

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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600">System overview and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-slate-600">
              {activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-slate-600">
              {highRiskPatients} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-slate-600">
              Total scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadAlerts}</div>
            <p className="text-xs text-slate-600">
              Require attention
            </p>
          </CardContent>
        </Card>

        {/* Average Glucose Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Glucose</CardTitle>
            <Droplet className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            {avgGlucoseLoading ? (
              <div className="text-slate-500">Loading...</div>
            ) : avgGlucoseError ? (
              <div className="text-red-500">Error loading</div>
            ) : (
              <div className="text-2xl font-bold">
                {avgGlucoseData && typeof avgGlucoseData.averageGlucose === 'number' && !isNaN(avgGlucoseData.averageGlucose)
                  ? `${avgGlucoseData.averageGlucose.toFixed(1)} mg/dL`
                  : "N/A"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Avg. glucose level across all patients
            </p>
          </CardContent>
        </Card>

        {/* Health Metrics Summary Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Metrics Summary</CardTitle>
            <HeartPulse className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            {metricsSummaryLoading ? (
              <div className="text-slate-500">Loading...</div>
            ) : metricsSummaryError ? (
              <div className="text-red-500">Error loading</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Glucose</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.averageGlucose === 'number' && !isNaN(metricsSummary.averageGlucose)
                      ? `${metricsSummary.averageGlucose.toFixed(1)} mg/dL`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Systolic BP</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.averageSystolicBP === 'number' && !isNaN(metricsSummary.averageSystolicBP)
                      ? `${metricsSummary.averageSystolicBP.toFixed(0)} mmHg`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Diastolic BP</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.averageDiastolicBP === 'number' && !isNaN(metricsSummary.averageDiastolicBP)
                      ? `${metricsSummary.averageDiastolicBP.toFixed(0)} mmHg`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Records</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.totalRecords === 'number' && !isNaN(metricsSummary.totalRecords)
                      ? metricsSummary.totalRecords
                      : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div>Loading system health...</div>
            ) : healthError ? (
              <div className="text-red-500">Failed to load system health.</div>
            ) : systemHealth ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Server Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {systemHealth.server}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {systemHealth.database}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {systemHealth.apiResponseTime}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {systemHealth.uptime}
                  </Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div>Loading recent activity...</div>
            ) : activitiesError ? (
              <div className="text-red-500">Failed to load recent activity.</div>
            ) : activitiesData && activitiesData.success ? (
              <div className="space-y-4">
                {activitiesData.data.length === 0 ? (
                  <div className="text-slate-500 text-center">No recent activity found.</div>
                ) : (
                  activitiesData.data.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-slate-500">
                          {activity.patientName ? `${activity.patientName}  3 ` : ''}
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Health Data Records Table */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Recent Health Data Records</CardTitle>
            <CardDescription>Latest 20 health metric entries from all patients</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMetricsLoading ? (
              <div className="text-slate-500">Loading...</div>
            ) : recentMetricsError ? (
              <div className="text-red-500">Error loading records</div>
            ) : !Array.isArray(recentMetrics) ? (
              <div className="text-slate-500">No records found</div>
            ) : recentMetrics.length === 0 ? (
              <div className="text-slate-500">No records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-4 py-2 text-left font-semibold">Patient Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Metric Type</th>
                      <th className="px-4 py-2 text-left font-semibold">Value</th>
                      <th className="px-4 py-2 text-left font-semibold">Unit</th>
                      <th className="px-4 py-2 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMetrics.map((row: any) => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        <td className="px-4 py-2 whitespace-nowrap">{row.userName || row.userId}</td>
                        <td className="px-4 py-2 whitespace-nowrap capitalize">{row.type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{row.value}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{row.unit || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{row.recordedAt ? new Date(row.recordedAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Health Trends Widget */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Recent Health Trends</CardTitle>
            <CardDescription>Daily averages for glucose and blood pressure (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="text-slate-500">Loading...</div>
            ) : trendsError ? (
              <div className="text-red-500">Error loading trends</div>
            ) : !Array.isArray(chartData) || chartData.length === 0 ? (
              <div className="text-slate-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="glucose" name="Glucose" stroke="#e11d48" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Statistics
          </CardTitle>
          <CardDescription>User activity and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-navy-primary">
                  {getRoleCount('doctor')}
                </span>
                <span className="text-xs text-slate-500">Doctors</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-navy-primary">
                  {getRoleCount('patient')}
                </span>
                <span className="text-xs text-slate-500">Patients</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-navy-primary">
                  {getRoleCount('admin')}
                </span>
                <span className="text-xs text-slate-500">Admins</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
