import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getCarePlans, CarePlan } from "@/api/careplans.api";
import { useAuth } from "@/hooks/useAuth";
import CreateCarePlanModal from "@/components/CreateCarePlanModal";
import ViewCarePlanModal from "@/components/ViewCarePlanModal";
import EditCarePlanModal from "@/components/EditCarePlanModal";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  FileText,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react";

export default function DoctorCarePlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCarePlan, setSelectedCarePlan] = useState<any>(null);
  const { user } = useAuth();

  // Fetch care plans
  const { data: carePlans, isLoading, isError } = useQuery({
    queryKey: ["careplans", "doctor"],
    queryFn: getCarePlans,
  });

  // Filter care plans based on search and status
  const filteredCarePlans = React.useMemo(() => {
    if (!Array.isArray(carePlans)) return [];
    
    return carePlans.filter(plan => {
      const matchesSearch = plan.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || plan.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [carePlans, searchTerm, filterStatus]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ongoing": return "default";
      case "completed": return "secondary";
      case "paused": return "outline";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    if (progress >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const handleCreateSuccess = () => {
    // The modal will handle closing and refetching
  };

  const handleViewSuccess = () => {
    // View modal doesn't need any special handling
  };

  const handleEditSuccess = () => {
    // The modal will handle closing and refetching
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewClick = (carePlan: any) => {
    setSelectedCarePlan(carePlan);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (carePlan: any) => {
    setSelectedCarePlan(carePlan);
    setIsEditModalOpen(true);
  };

  const handleCreateClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleViewClose = () => {
    setIsViewModalOpen(false);
    setSelectedCarePlan(null);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedCarePlan(null);
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
          Failed to load care plans.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Care Plans</h1>
        <p className="text-slate-600">Manage and monitor patient care plans</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search care plans by patient or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="overdue">Overdue</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Array.isArray(carePlans) ? carePlans.length : 0}</p>
                <p className="text-sm text-slate-600">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(carePlans) ? carePlans.filter(p => p.status === "ongoing").length : 0}
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
                  {Array.isArray(carePlans) ? carePlans.filter(p => p.status === "paused").length : 0}
                </p>
                <p className="text-sm text-slate-600">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(carePlans) && carePlans.length > 0 ? 
                    Math.round(carePlans.reduce((sum, p) => sum + (p.progress || 0), 0) / carePlans.length) : 0
                  }%
                </p>
                <p className="text-sm text-slate-600">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Care Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCarePlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <CardDescription>{plan.patientName}</CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(plan.status)}>
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Description</p>
                  <p className="text-sm text-slate-600">{plan.description}</p>
                </div>
                
                {/* Progress Section */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className={`font-medium ${getProgressColor(plan.progress || 0)}`}>
                      {plan.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(plan.progress || 0)}`}
                      style={{ width: `${plan.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="font-medium">{plan.duration || 0} weeks</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Tasks</p>
                    <p className="font-medium">{plan.completedTasks || 0} of {plan.totalTasks || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Target className="w-4 h-4" />
                    <span>{plan.goals?.length || 0} goals</span>
                  </div>
                </div>

                {plan.assignedTo && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span>{plan.assignedTo}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-slate-500">
                    {plan.completedTasks || 0} of {plan.totalTasks || 0} tasks completed
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewClick(plan)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCarePlans.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No care plans found</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Modals */}
      {user && (
        <CreateCarePlanModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateClose}
          doctorId={user.id}
          afterCreate={handleCreateSuccess}
        />
      )}

      <ViewCarePlanModal
        isOpen={isViewModalOpen}
        onClose={handleViewClose}
        carePlan={selectedCarePlan}
      />

      <EditCarePlanModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        carePlan={selectedCarePlan}
        afterUpdate={handleEditSuccess}
      />
    </div>
  );
} 