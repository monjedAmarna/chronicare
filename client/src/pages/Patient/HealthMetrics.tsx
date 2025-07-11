import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHealthMetrics, createHealthMetric, HealthMetric } from "@/api/health.api";
import { useAuth } from "@/hooks/useAuth";

const healthMetricSchema = z.object({
  type: z.string().min(1, "Type is required"),
  value: z.string().min(1, "Value is required"),
  unit: z.string().min(1, "Unit is required"),
  recordedAt: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  isFasting: z.boolean().optional(),
});

type HealthMetricFormData = z.infer<typeof healthMetricSchema>;

const metricTypes = [
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL" },
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { value: "weight", label: "Weight", unit: "kg" },
  { value: "temperature", label: "Temperature", unit: "°C" },
  { value: "oxygen_saturation", label: "Oxygen Saturation", unit: "%" },
];

export default function HealthMetrics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HealthMetricFormData>({
    resolver: zodResolver(healthMetricSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().split('T')[0],
      isFasting: false,
    }
  });

  const watchedType = watch("type");

  // Fetch health metrics
  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ["health-metrics"],
    queryFn: getHealthMetrics,
  });

  // Add health metric
  const addMutation = useMutation({
    mutationFn: (data: HealthMetricFormData & { userId: string }) => createHealthMetric(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
      
      // Check if alerts were created
      if (response.alerts && response.alerts.length > 0) {
        toast({ 
          title: "Health Alert Generated", 
          description: `${response.alerts.length} health alert(s) have been created due to concerning readings.`,
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Metric Logged", 
          description: "Health metric has been logged successfully." 
        });
      }
      
      setIsAddDialogOpen(false);
      reset();
      setSelectedType("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to log metric.", variant: "destructive" });
    },
  });

  // Handle form submission
  const onSubmit = (data: HealthMetricFormData) => {
    if (!user?.id) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    addMutation.mutate({ ...data, userId: user.id });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  // Get unit for selected type
  const getUnitForType = (type: string) => {
    const metricType = metricTypes.find(t => t.value === type);
    return metricType?.unit || "";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Health Metrics</h1>
        <Button onClick={() => { setIsAddDialogOpen(true); reset(); }}>
          Log Metric
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Skeleton className="w-8 h-8" />
          <span className="ml-4 text-slate-500">Loading health metrics...</span>
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">
          {error instanceof Error ? error.message : "Failed to load health metrics."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(metrics) && metrics.length > 0 ? (
            metrics.map((metric: HealthMetric) => (
              <Card key={metric.id} className="flex flex-col gap-2 p-4">
                <div className="font-semibold">{metric.type}</div>
                <div className="text-slate-700">{metric.value} {metric.unit}</div>
                <div className="text-xs text-slate-500">{formatDate(metric.recordedAt)}</div>
                {metric.notes && <div className="text-xs text-slate-400">{metric.notes}</div>}
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500">No health metrics found.</div>
          )}
        </div>
      )}
      {/* Add Metric Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Log Health Metric</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="type">Metric Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedType(value);
                        setValue("unit", getUnitForType(value));
                      }} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric type" />
                        </SelectTrigger>
                        <SelectContent>
                          {metricTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
                </div>

                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input 
                    id="value" 
                    {...register("value")} 
                    placeholder={watchedType === "blood_pressure" ? "e.g., 120/80" : "Enter value"}
                  />
                  {errors.value && <span className="text-xs text-red-500">{errors.value.message}</span>}
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" {...register("unit")} readOnly />
                  {errors.unit && <span className="text-xs text-red-500">{errors.unit.message}</span>}
                </div>

                {watchedType === "glucose" && (
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isFasting"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isFasting"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="isFasting" className="text-sm">
                      Fasting glucose reading
                    </Label>
                  </div>
                )}

                <div>
                  <Label htmlFor="recordedAt">Date</Label>
                  <Input id="recordedAt" type="date" {...register("recordedAt")} />
                  {errors.recordedAt && <span className="text-xs text-red-500">{errors.recordedAt.message}</span>}
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" {...register("notes")} placeholder="Additional notes..." />
                  {errors.notes && <span className="text-xs text-red-500">{errors.notes.message}</span>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Logging..." : "Log"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 