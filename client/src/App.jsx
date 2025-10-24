import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/common/ChangePassword';

// Employee Pages
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import SubmitExpense from './pages/employee/SubmitExpense';
import MyExpenses from './pages/employee/MyExpenses';
import RaiseTicket from './pages/employee/RaiseTicket';
import MyTickets from './pages/employee/MyTickets';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllExpenses from './pages/admin/AllExpenses';
import Tickets from './pages/admin/Tickets';
import Categories from './pages/admin/Categories';
import Users from './pages/admin/Users';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="submit-expense" element={<SubmitExpense />} />
            <Route path="my-expenses" element={<MyExpenses />} />
            <Route path="raise-ticket" element={<RaiseTicket />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Admin Routes - REMOVED: approvals, policies, analytics */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="expenses" element={<AllExpenses />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="categories" element={<Categories />} />
            <Route path="users" element={<Users />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
