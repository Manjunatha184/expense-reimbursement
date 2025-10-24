import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, LogOut, FileText } from 'lucide-react';

const ManagerLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Manager Portal</h1>
        </div>
        
        <nav className="px-4 space-y-2">
          <NavLink
            to="/manager/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/manager/approvals"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <CheckSquare className="w-5 h-5" />
            <span>Pending Approvals</span>
          </NavLink>

          <NavLink
            to="/manager/history"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FileText className="w-5 h-5" />
            <span>Approval History</span>
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
