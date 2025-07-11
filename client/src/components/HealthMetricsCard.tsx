import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface HealthMetricsCardProps {
  title: string;
  value: string;
  status: string;
  icon: LucideIcon;
  color: "red" | "blue" | "green" | "purple";
}

const colorClasses = {
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    badge: "bg-green-100 text-green-800"
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    badge: "bg-green-100 text-green-800"
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    badge: "bg-green-100 text-green-800"
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    badge: "bg-green-100 text-green-800"
  }
};

export default function HealthMetricsCard({ title, value, status, icon: Icon, color }: HealthMetricsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-navy-primary mb-2">{value}</p>
            <Badge variant="secondary" className={colors.badge}>
              {status}
            </Badge>
          </div>
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
