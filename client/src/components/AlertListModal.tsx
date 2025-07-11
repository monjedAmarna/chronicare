import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { Alert } from "@/api/alerts.api";
import { markAlertAsRead } from "@/api/alerts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AlertListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  alerts: Alert[];
}

export default function AlertListModal({
  isOpen,
  onClose,
  title,
  alerts,
}: AlertListModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const markAsReadMutation = useMutation({
    mutationFn: markAlertAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["patient-health-summary"] });
      toast({
        title: "Alert marked as read",
        description: "The alert has been marked as read.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark alert as read",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (alertId: number) => {
    markAsReadMutation.mutate(alertId.toString());
  };

  const getSeverityIcon = (status?: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeVariant = (status?: string) => {
    switch (status) {
      case "critical":
        return "destructive" as const;
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      case "low":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline">{alerts.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts found</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`transition-all ${
                    alert.isRead
                      ? "opacity-60 border-gray-200"
                      : "border-l-4 border-l-orange-500"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.status)}
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityBadgeVariant(alert.status)}>
                          {alert.status || "unknown"}
                        </Badge>
                        {!alert.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(alert.createdAt)}
                      </div>
                      {alert.value && (
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {alert.value}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 