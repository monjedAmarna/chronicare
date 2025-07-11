import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendDataPoint } from '@/api/reports.api';

interface TrendsChartProps {
  data: TrendDataPoint[];
  isLoading: boolean;
  isError: boolean;
}

export default function TrendsChart({ data, isLoading, isError }: TrendsChartProps) {
  // Transform data for Recharts: group by date, each type as a property
  const chartData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // Group data by date
    const groupedByDate: Record<string, any> = {};
    
    data.forEach(item => {
      if (!groupedByDate[item.date]) {
        groupedByDate[item.date] = { date: item.date };
      }
      groupedByDate[item.date][item.type] = item.average;
    });
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading trends...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading trends</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">No data available</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value, name) => [
            typeof value === 'number' ? value.toFixed(1) : value,
            name === 'glucose' ? 'Glucose (mg/dL)' : 
            name === 'systolic' ? 'Systolic BP (mmHg)' : 
            name === 'diastolic' ? 'Diastolic BP (mmHg)' : name
          ]}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="glucose" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="systolic" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="diastolic" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 