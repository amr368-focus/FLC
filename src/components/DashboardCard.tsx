import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  color: 'red' | 'orange' | 'blue' | 'green';
}

const colorStyles = {
  red: 'bg-red-50 text-red-600 border-red-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
};

export function DashboardCard({ title, count, icon, color }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
