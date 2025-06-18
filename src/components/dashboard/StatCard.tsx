//import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ReactNode } from 'react';

//statcard for rendering total income, expense and nettotal calculated from current months transactions.

//defines strucutre of the card
interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  valueClassName?: string;
}

//component that renders the statcards on dashboard UI. 
const StatCard = ({ title, value, icon, valueClassName }: StatCardProps) => {
  return (
    <div className="card hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="rounded-full bg-gray-100 p-2">{icon}</div>
      </div>
      <p className={`mt-4 text-2xl font-semibold ${valueClassName || 'text-gray-900'}`}>
        {value}
        </p>
    </div>
  );
};

export default StatCard;