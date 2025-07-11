import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCarePlans, createCarePlan, updateCarePlan, deleteCarePlan, CarePlan } from "@/api/careplans.api";
import EditCarePlanModal from "@/components/EditCarePlanModal";

const carePlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(["ongoing", "completed", "paused"]),
});

type CarePlanFormData = z.infer<typeof carePlanSchema>;

export default function PatientCarePlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CarePlan | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<CarePlanFormData>({
    resolver: zodResolver(carePlanSchema),
  });

  // Fetch care plans
  const { data: carePlans, isLoading, isError, error } = useQuery({
    queryKey: ["care-plans", "patient"],
    queryFn: getCarePlans,
  });

  // Add care plan
  const addMutation = useMutation({
    mutationFn: (data: CarePlanFormData) => createCarePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans", "patient"] });
      toast({ title: "Care Plan Added", description: `Care plan has been added.` });
      setIsDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to add care plan.", variant: "destructive" });
    },
  });

  // Edit care plan
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarePlanFormData }) => updateCarePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans", "patient"] });
      toast({ title: "Care Plan Updated", description: `Care plan has been updated.` });
      setEditingPlan(null);
      setIsDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update care plan.", variant: "destructive" });
    },
  });

  // Delete care plan
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCarePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans", "patient"] });
      toast({ title: "Care Plan Removed", description: `Care plan has been removed.` });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to remove care plan.", variant: "destructive" });
    },
  });

  // Handle form submission
  const onSubmit = (data: CarePlanFormData) => {
    if (editingPlan) {
      editMutation.mutate({ id: editingPlan.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // Open edit dialog
  const handleEdit = (plan: CarePlan) => {
    setEditingPlan(plan);
    setValue("title", plan.title);
    setValue("description", plan.description);
    setValue("startDate", plan.startDate);
    setValue("endDate", plan.endDate || "");
    setValue("status", plan.status);
    setIsDialogOpen(true);
  };

  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
    reset();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Care Plans</h1>
        <Button onClick={() => { setIsDialogOpen(true); reset(); setEditingPlan(null); }}>
          Add Care Plan
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Skeleton className="w-8 h-8" />
          <span className="ml-4 text-slate-500">Loading care plans...</span>
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">
          {error instanceof Error ? error.message : "Failed to load care plans."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(carePlans) && carePlans.length > 0 ? (
            carePlans.map((plan: CarePlan) => (
              <Card key={plan.id} className="flex flex-col gap-2 p-4">
                <div className="font-semibold">{plan.title}</div>
                <div className="text-slate-700">{plan.description}</div>
                <div className="text-xs text-slate-500">Start: {formatDate(plan.startDate)}</div>
                {plan.endDate && <div className="text-xs text-slate-400">End: {formatDate(plan.endDate)}</div>}
                <div className="text-xs text-slate-400">Status: {plan.status}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(plan.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500">No care plans found.</div>
          )}
        </div>
      )}
      {/* Add/Edit Care Plan Dialog */}
      {isDialogOpen && editingPlan && (
        <EditCarePlanModal
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          carePlan={{
            ...editingPlan,
            // Only pass fields the patient is allowed to edit (e.g., progress, status)
            // Other fields can be shown as read-only or omitted
          }}
          afterUpdate={() => {
            setIsDialogOpen(false);
            setEditingPlan(null);
            reset();
            queryClient.invalidateQueries({ queryKey: ["care-plans", "patient"] });
          }}
          // Add a prop or context if needed to indicate patient role, so the modal can render only allowed fields
          role="patient"
        />
      )}
    </div>
  );
} 