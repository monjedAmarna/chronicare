import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";

interface MedicationCardProps {
  medication: {
    id: number;
    name: string;
    dosage: string;
    times: string[];
    isActive: boolean;
  };
}

export default function MedicationCard({ medication }: MedicationCardProps) {
  const nextTime = medication.times?.[0] || "08:00";
  
  const getStatusColor = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const medicationTime = new Date();
    medicationTime.setHours(hours, minutes, 0, 0);
    
    if (medicationTime < now) {
      return "bg-green-100 text-green-800";
    } else if (medicationTime.getTime() - now.getTime() <= 2 * 60 * 60 * 1000) { // Within 2 hours
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-slate-100 text-slate-600";
  };

  const getStatusIcon = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const medicationTime = new Date();
    medicationTime.setHours(hours, minutes, 0, 0);
    
    if (medicationTime < now) {
      return <Check className="w-3 h-3" />;
    }
    return <Clock className="w-3 h-3" />;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(nextTime).includes('green') ? 'bg-green-400' : getStatusColor(nextTime).includes('yellow') ? 'bg-yellow-400' : 'bg-slate-300'}`}></div>
        <div>
          <p className="font-medium text-slate-800">{medication.name}</p>
          <p className="text-sm text-slate-600">{medication.dosage}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className={getStatusColor(nextTime)}>
          <span className="flex items-center space-x-1">
            {getStatusIcon(nextTime)}
            <span>{nextTime}</span>
          </span>
        </Badge>
      </div>
    </div>
  );
}
