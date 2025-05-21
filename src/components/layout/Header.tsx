import { useAuth } from '../../hooks/useAuth';
import { Bell, Menu, User } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 md:hidden">BudgetMaster</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button
                className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={toggleUserMenu}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={signOut}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;