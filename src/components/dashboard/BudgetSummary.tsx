import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const BudgetSummary = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Create new chart
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Housing', 'Food', 'Transportation', 'Entertainment', 'Other'],
            datasets: [
              {
                data: [35, 25, 15, 15, 10],
                backgroundColor: [
                  '#0891b2', // primary
                  '#8b5cf6', // secondary
                  '#10b981', // success
                  '#f59e0b', // warning
                  '#6b7280', // gray
                ],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 16,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
                    const percentage = Math.round((value * 100) / total);
                    return `${label}: ${percentage}% ($${value * 10})`;
                  },
                },
              },
            },
          },
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Budget Summary</h2>
        <Link to="/budgets" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View details
        </Link>
      </div>
      
      <div className="relative h-48 md:h-60">
        <canvas ref={chartRef}></canvas>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-500">Monthly spent</p>
            <p className="text-xl font-semibold text-gray-900">$1,250</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Monthly budget</span>
          <span className="font-medium text-gray-900">$2,000</span>
        </div>
        
        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full" style={{ width: '62.5%' }}></div>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-success-600 font-medium">$750 remaining</span>
          <span className="text-gray-500">62.5% spent</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;