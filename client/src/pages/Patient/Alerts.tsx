import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getAlerts } from "@/api/alerts.api";
import { useAlertsQuery } from "@/hooks/useAlertsQuery";
import { 
  Search, 
  Bell, 
  AlertTriangle,
  Activity
} from "lucide-react";

export default function PatientAlerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const { data: alerts, isLoading, isError } = useAlertsQuery();

  // Filter alerts based on search and severity
  const filteredAlerts = React.useMemo(() => {
    if (!Array.isArray(alerts)) return [];
    
    return alerts.filter(alert => {
      // Safe string conversion and null checks
      const alertMessage = typeof alert.message === 'string' ? alert.message : '';
      const alertTitle = typeof alert.title === 'string' ? alert.title : '';
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = alertMessage.toLowerCase().includes(searchLower) ||
                           alertTitle.toLowerCase().includes(searchLower);
      const matchesSeverity = filterSeverity === "all" || alert.type === filterSeverity;
      
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchTerm, filterSeverity]);

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-blue-600";
      default: return "text-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
          Failed to load alerts.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Health Alerts</h1>
        <p className="text-slate-600">View and manage your health alerts</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search alerts by message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Array.isArray(alerts) ? alerts.length : 0}</p>
                <p className="text-sm text-slate-600">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {Array.isArray(alerts) ? alerts.filter(a => a.type === 'critical' || a.type === 'high').length : 0}
                </p>
                <p className="text-sm text-slate-600">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Array.isArray(alerts) ? alerts.filter(a => a.isRead).length : 0}
                </p>
                <p className="text-sm text-slate-600">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No alerts found</h3>
          <p className="text-slate-600">You're all caught up! No health alerts at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={alert.isRead ? "opacity-75" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={getSeverityBadgeVariant(alert.type)}>{alert.type}</Badge>
                  <span className="capitalize">{alert.title || "Health Alert"}</span>
                  <span className="text-xs text-slate-400">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "No timestamp"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {alert.message || "No message provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.type === 'critical' ? 'bg-red-500' :
                      alert.type === 'high' ? 'bg-orange-500' :
                      alert.type === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm text-slate-600">
                      {alert.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 