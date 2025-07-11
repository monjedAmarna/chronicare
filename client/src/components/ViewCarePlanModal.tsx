import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Clock, User, Target, CheckCircle, FileText, Users } from "lucide-react";

interface ViewCarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  carePlan: {
    id: number;
    title: string;
    description: string;
    patientName: string;
    status: string;
    progress: number;
    duration: number;
    assignedTo?: string;
    goals?: string[];
    completedTasks: number;
    totalTasks: number;
    createdAt: string;
  } | null;
}

const statusColor: Record<string, string> = {
  ongoing: "default",
  completed: "secondary",
  paused: "outline",
  overdue: "destructive",
};

const statusIcon: Record<string, React.ReactNode> = {
  ongoing: <Calendar className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  paused: <Clock className="h-4 w-4" />,
  overdue: <X className="h-4 w-4" />,
};

export default function ViewCarePlanModal({ isOpen, onClose, carePlan }: ViewCarePlanModalProps) {
  if (!carePlan) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Care Plan Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View comprehensive details for this care plan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Care Plan ID */}
          <div className="text-sm text-gray-500">
            Care Plan ID: #{carePlan.id}
          </div>

          {/* Title and Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{carePlan.title}</h3>
              <Badge variant={statusColor[carePlan.status] as any}>
                {statusIcon[carePlan.status]}
                <span className="ml-1">{carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}</span>
              </Badge>
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Patient</p>
                <p className="text-sm text-gray-600">{carePlan.patientName}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Description</p>
                <p className="text-sm text-gray-600">{carePlan.description}</p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">Progress</span>
                  <span className={`font-medium ${getProgressColor(carePlan.progress)}`}>
                    {carePlan.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(carePlan.progress)}`}
                    style={{ width: `${carePlan.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Duration and Tasks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">{carePlan.duration} weeks</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tasks</p>
                  <p className="text-sm text-gray-600">{carePlan.completedTasks} of {carePlan.totalTasks} completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned To */}
          {carePlan.assignedTo && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Assigned To</p>
                  <p className="text-sm text-gray-600">{carePlan.assignedTo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Goals */}
          {carePlan.goals && carePlan.goals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Goals ({carePlan.goals.length})</p>
                  <ul className="mt-2 space-y-1">
                    {carePlan.goals.map((goal, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Creation Date */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">{formatDate(carePlan.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Additional Info Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This is a read-only view of the care plan details. 
              To make changes, use the "Edit" button in the care plans list.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 