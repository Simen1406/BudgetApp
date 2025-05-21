import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: number;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, icon, change, trend }: StatCardProps) => {
  return (
    <div className="card hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="rounded-full bg-gray-100 p-2">{icon}</div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
      <div className="mt-4 flex items-center">
        <span
          className={`inline-flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-success-600' : 'text-danger-600'
          }`}
        >
          {trend === 'up' ? (
            <ArrowUpRight className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDownRight className="mr-1 h-4 w-4" />
          )}
          {Math.abs(change)}%
        </span>
        <span className="ml-2 text-sm text-gray-500">from last period</span>
      </div>
    </div>
  );
};

export default StatCard;