import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getHealthData, getReportStats, getRecentTrends, HealthDataPoint, ReportStats } from "@/api/reports.api";
import TrendsChart from "@/components/TrendsChart";
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Heart,
  Users,
  AlertTriangle
} from "lucide-react";

export default function AdminReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("7d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [metricType, setMetricType] = useState("");

  // Fetch report data with backend filtering
  const {
    data: healthData,
    isLoading: healthDataLoading,
    isError: healthDataError,
    refetch: refetchHealthData,
  } = useQuery({
    queryKey: ["healthData", "admin", startDate, endDate, searchTerm, metricType],
    queryFn: () => getHealthData(startDate, endDate, searchTerm, metricType),
  });

  const { data: reportStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["reportStats", "admin"],
    queryFn: getReportStats,
  });

  // Fetch recent trends data
  const { data: trendsData, isLoading: trendsLoading, isError: trendsError } = useQuery({
    queryKey: ["recent-trends", "admin"],
    queryFn: getRecentTrends,
  });

  const isLoading = healthDataLoading || statsLoading;
  const isError = healthDataError || statsError;

  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < previousValue) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-slate-600" />;
  };

  const getTrendColor = (value: number, previousValue: number) => {
    if (value > previousValue) return "text-green-600";
    if (value < previousValue) return "text-red-600";
    return "text-slate-600";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
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
          Failed to load reports.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-slate-600">Comprehensive health data analysis and insights</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="glucose">Glucose</option>
            <option value="blood_pressure_systolic">Systolic BP</option>
            <option value="blood_pressure_diastolic">Diastolic BP</option>
            <option value="weight">Weight</option>
            <option value="heart_rate">Heart Rate</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-2 py-2 border border-slate-300 rounded-md text-sm"
            placeholder="Start date"
          />
          <span className="mx-1">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-2 py-2 border border-slate-300 rounded-md text-sm"
            placeholder="End date"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchHealthData()}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportStats?.totalPatients || 0}
            </div>
            <p className="text-xs text-slate-600">
              Active patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportStats?.totalAppointments || 0}
            </div>
            <p className="text-xs text-slate-600">
              Scheduled visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Glucose</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportStats?.averageGlucose || 0} mg/dL
            </div>
            <p className="text-xs text-slate-600">
              Across all patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reportStats?.totalAlerts || 0}
            </div>
            <p className="text-xs text-slate-600">
              Generated alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Data Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Health Metrics Summary
            </CardTitle>
            <CardDescription>Average health metrics across all patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Blood Pressure</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {reportStats?.averageBloodPressure 
                      ? `${Math.round(reportStats.averageBloodPressure.systolic)}/${Math.round(reportStats.averageBloodPressure.diastolic)}`
                      : "120/80"
                    }
                  </span>
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Glucose</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{reportStats?.averageGlucose || 0} mg/dL</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Points</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{Array.isArray(healthData) ? healthData.length : 0}</span>
                  <BarChart3 className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Trends
            </CardTitle>
            <CardDescription>Health metric trends over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendsChart 
              data={trendsData || []} 
              isLoading={trendsLoading} 
              isError={trendsError} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Health Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Data Records
          </CardTitle>
          <CardDescription>Recent health metric recordings</CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(healthData) && healthData.length > 0 ? (
            <div className="space-y-4">
              {healthData.slice(0, 10).map((data) => (
                <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <p className="font-medium">{new Date(data.recordedAt).toLocaleDateString()}</p>
                      <p className="text-slate-500">{data.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Type:</span>
                      <span className="font-medium ml-1">{data.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Value:</span>
                      <span className="font-medium ml-1">{data.value} {data.unit || ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No health data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 