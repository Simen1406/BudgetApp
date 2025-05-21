import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-warning-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-center text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link to="/" className="btn btn-primary inline-flex">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;