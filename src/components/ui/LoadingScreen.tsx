import { CircleDashed } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <CircleDashed className="h-12 w-12 text-primary-600 animate-spin" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;