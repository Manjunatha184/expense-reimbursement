import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  BarChart3, 
  LogOut, 
  FolderKanban,
  Shield,
  CheckSquare
} from 'lucide-react';

const AdminLayout = () => {
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
          <h1 className="text-2xl font-bold text-blue-600">Admin Portal</h1>
        </div>
        
        <nav className="px-4 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/expenses"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FileText className="w-5 h-5" />
            <span>Expenses</span>
          </NavLink>

          <NavLink
            to="/admin/approvals"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <CheckSquare className="w-5 h-5" />
            <span>Approvals</span>
          </NavLink>

          <NavLink
            to="/admin/tickets"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span>Support Tickets</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FolderKanban className="w-5 h-5" />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/admin/policies"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            <span>Policies</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
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

export default AdminLayout;
