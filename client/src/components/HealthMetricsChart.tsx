import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface HealthMetricsChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  unit?: string;
  height?: number;
  width?: number;
}

export default function HealthMetricsChart({
  title,
  data,
  color = "#0d9488", // teal-600
  unit = "",
  height = 200,
  width = 400,
}: HealthMetricsChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (data.length - 1);
    const stepY = chartHeight / range;

    const points = data.map((point, index) => ({
      x: padding + index * stepX,
      y: padding + chartHeight - (point.value - minValue) * stepY,
      value: point.value,
      date: point.date,
      label: point.label,
    }));

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return {
      points,
      pathData,
      minValue,
      maxValue,
      range,
    };
  }, [data, width, height]);

  if (!chartData || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-navy-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600 font-medium">No data available</p>
              <p className="text-sm text-slate-500 mt-1">Add some readings to see trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-navy-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg width={width} height={height} className="w-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const value = chartData.minValue + ratio * chartData.range;
              const y = 40 + (1 - ratio) * (height - 80);
              return (
                <g key={index}>
                  <text
                    x="5"
                    y={y + 4}
                    className="text-xs fill-slate-500"
                    textAnchor="start"
                  >
                    {value.toFixed(0)}{unit}
                  </text>
                  <line
                    x1="35"
                    y1={y}
                    x2={width - 5}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Chart line */}
            <path
              d={chartData.pathData}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                />
                {/* Tooltip on hover */}
                <title>
                  {point.date}: {point.value}{unit}
                  {point.label && ` (${point.label})`}
                </title>
              </g>
            ))}

            {/* X-axis labels (every other point to avoid crowding) */}
            {chartData.points
              .filter((_, index) => index % Math.max(1, Math.floor(data.length / 5)) === 0)
              .map((point, index) => (
                <text
                  key={index}
                  x={point.x}
                  y={height - 10}
                  className="text-xs fill-slate-500"
                  textAnchor="middle"
                >
                  {new Date(point.date).toLocaleDateString()}
                </text>
              ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
} 