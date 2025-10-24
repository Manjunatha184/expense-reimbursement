import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Users, 
  Folder,
  BarChart3,
  CheckCircle,
  MessageSquare, 
  HelpCircle,
  Shield,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { Lock } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const employeeLinks = [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/submit-expense', icon: PlusCircle, label: 'Submit Expense' },
    { to: '/employee/my-expenses', icon: Receipt, label: 'My Expenses' },
    { to: '/employee/raise-ticket', icon: MessageSquare, label: 'Raise Ticket' },
    { to: '/employee/my-tickets', icon: HelpCircle, label: 'My Tickets' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/expenses', icon: Receipt, label: 'All Expenses' },
    { to: '/admin/tickets', icon: MessageSquare, label: 'Support Tickets' },
    { to: '/admin/categories', icon: Folder, label: 'Categories' },
    { to: '/admin/policies', icon: Shield, label: 'Policies' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 capitalize">
          {user?.role === 'admin' ? 'Admin Panel' : 'Employee Panel'}
        </h2>
        
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
            
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
