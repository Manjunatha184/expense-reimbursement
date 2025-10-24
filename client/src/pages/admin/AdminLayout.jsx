import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  LogOut, 
  FolderKanban,
  Menu,
  X,
  CircleDollarSign
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // UPDATED - Removed Approvals, Policies, Analytics
  const menuItems = [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/expenses', icon: FileText, label: 'All Expenses' },
    { to: '/admin/tickets', icon: MessageSquare, label: 'Support Tickets' },
    { to: '/admin/categories', icon: FolderKanban, label: 'Categories' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-md
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="px-3 sm:px-4 py-4 space-y-1 sm:space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-100 hover:bg-blue-800/50'
                }`
              }
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-64 p-3 sm:p-4 border-t border-blue-700 bg-blue-900">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 text-blue-100 hover:bg-red-600 hover:text-white rounded-lg w-full transition text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-blue-600">Admin Portal</h2>
          <div className="w-6"></div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
