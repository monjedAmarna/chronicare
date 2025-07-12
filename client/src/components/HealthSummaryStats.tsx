import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  AlertTriangle, 
  AlertCircle, 
  Droplets,
  Heart
} from "lucide-react";
import type { PatientHealthSummary } from "@/api/analytics.api";

interface HealthSummaryStatsProps {
  className?: string;
  data?: PatientHealthSummary;
  isLoading?: boolean;
  error?: unknown;
  onHealthAlertsClick?: () => void;
  onCriticalAlertsClick?: () => void;
}

export default function HealthSummaryStats({ 
  className = "", 
  data, 
  isLoading, 
  error,
  onHealthAlertsClick,
  onCriticalAlertsClick
}: HealthSummaryStatsProps) {
  // Debug logging
  console.log("🔍 HealthSummaryStats Debug:");
  console.log("📊 Full data object:", data);
  console.log("📈 data.metrics:", data?.metrics);
  console.log("🩸 data.averageGlucose:", data?.averageGlucose);
  console.log("⏳ isLoading:", isLoading);
  console.log("❌ error:", error);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Error</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">--</div>
              <p className="text-xs text-red-600">Failed to load data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Helper function to get background color based on glucose level
  const getGlucoseColor = (glucose: string | null | undefined) => {
    if (!glucose) return "bg-slate-50 border-slate-200";
    const value = parseFloat(glucose);
    if (value < 70 || value > 126) return "bg-red-50 border-red-200";
    if (value >= 100 && value <= 125) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  // Helper function to get background color based on blood pressure
  const getBloodPressureColor = (systolic: string | null | undefined, diastolic: string | null | undefined) => {
    if (!systolic || !diastolic) return "bg-slate-50 border-slate-200";
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);
    if (sys >= 140 || dia >= 90) return "bg-red-50 border-red-200";
    if (sys >= 120 || dia >= 80) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  // Helper function to get background color based on alert count
  const getAlertColor = (count: number | undefined) => {
    if (!count) return "bg-green-50 border-green-200";
    if (count <= 2) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  // Find the latest glucose reading from data.metrics
  let latestGlucose: number | null = null;
  let latestGlucoseDate: string | null = null;
  
  console.log("🔍 Processing glucose data...");
  
  if (Array.isArray(data?.metrics)) {
    console.log("✅ data.metrics is an array with length:", data.metrics.length);
    const glucoseMetrics = data.metrics
      .filter((m: any) => m.type === 'glucose' && m.value)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log("🩸 Filtered glucose metrics:", glucoseMetrics);
    
    if (glucoseMetrics.length > 0) {
      latestGlucose = parseFloat(glucoseMetrics[0].value);
      latestGlucoseDate = glucoseMetrics[0].createdAt;
      console.log("✅ Found latest glucose from metrics:", latestGlucose, "at", latestGlucoseDate);
    } else {
      console.log("❌ No glucose metrics found in data.metrics array");
    }
  } else {
    console.log("❌ data.metrics is not an array or is undefined");
  }
  
  // Fallback: use average glucose if no latest glucose from metrics array
  if (latestGlucose === null && data?.averageGlucose) {
    latestGlucose = parseFloat(data.averageGlucose);
    latestGlucoseDate = new Date().toISOString(); // Use current time as fallback
    console.log("🔄 Using fallback average glucose:", latestGlucose);
  }
  
  console.log("🎯 Final latestGlucose value:", latestGlucose);
  console.log("📅 Final latestGlucoseDate:", latestGlucoseDate);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {/* Average Glucose */}
      <Card className={getGlucoseColor(data?.averageGlucose)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Glucose</CardTitle>
          <Droplets className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.averageGlucose ? `${data.averageGlucose} mg/dL` : "No data"}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.averageGlucose ? "Last 7 days" : "No measurements"}
          </p>
        </CardContent>
      </Card>

      {/* Correction Dose */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Correction Dose</CardTitle>
          <Droplets className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          {latestGlucose !== null ? (() => {
            console.log("🧮 Calculating correction dose with glucose:", latestGlucose);
            const currentGlucose = latestGlucose;
            const targetGlucose = 120;
            const correctionFactor = 50;
            const dose = ((currentGlucose - targetGlucose) / correctionFactor);
            const roundedDose = Math.round(dose * 10) / 10;
            console.log("🧮 Calculation:", `(${currentGlucose} - ${targetGlucose}) / ${correctionFactor} = ${roundedDose} units`);
            console.log("🧮 Final rounded dose:", roundedDose);
            return (
              <>
                <div className="text-2xl font-bold">{roundedDose} units</div>
                <p className="text-xs text-muted-foreground mb-1">
                  ({currentGlucose} - {targetGlucose}) / {correctionFactor} = {roundedDose} units
                </p>
                {latestGlucoseDate && (
                  <p className="text-xs text-slate-400 mb-1">Latest: {new Date(latestGlucoseDate).toLocaleString()}</p>
                )}
                <p className="text-xs text-slate-500">Based on standard values</p>
              </>
            );
          })() : (
            <>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mb-1">No glucose data</p>
              <p className="text-xs text-slate-500">Based on standard values</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Average Blood Pressure */}
      <Card className={getBloodPressureColor(data?.averageSystolic, data?.averageDiastolic)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
          <Heart className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.averageSystolic && data?.averageDiastolic 
              ? `${data.averageSystolic}/${data.averageDiastolic} mmHg` 
              : "No data"}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.averageSystolic && data?.averageDiastolic ? "Average reading" : "No measurements"}
          </p>
        </CardContent>
      </Card>

      {/* Non-Critical Health Alerts */}
      <Card 
        className={`${getAlertColor(data?.totalAlerts)} ${onHealthAlertsClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onHealthAlertsClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Alerts</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.totalAlerts ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            Non-critical alerts
          </p>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card 
        className={`${data?.criticalAlerts && data.criticalAlerts > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"} ${onCriticalAlertsClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onCriticalAlertsClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.criticalAlerts ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {data?.criticalAlerts && data.criticalAlerts > 0 ? "Requires attention" : "All clear"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 