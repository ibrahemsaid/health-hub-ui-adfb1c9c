import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import PatientList from "@/pages/doctor/PatientList";
import MedicalRecords from "@/pages/doctor/MedicalRecords";
import Prescriptions from "@/pages/doctor/Prescriptions";
import MedicalHistory from "@/pages/patient/MedicalHistory";
import MyPrescriptions from "@/pages/patient/MyPrescriptions";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin */}
            <Route path="/dashboard/users" element={<ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>} />
            
            {/* Doctor */}
            <Route path="/dashboard/patients" element={<ProtectedRoute roles={["doctor"]}><PatientList /></ProtectedRoute>} />
            <Route path="/dashboard/records" element={<ProtectedRoute roles={["doctor"]}><MedicalRecords /></ProtectedRoute>} />
            <Route path="/dashboard/prescriptions" element={<ProtectedRoute roles={["doctor"]}><Prescriptions /></ProtectedRoute>} />
            
            {/* Patient */}
            <Route path="/dashboard/history" element={<ProtectedRoute roles={["patient"]}><MedicalHistory /></ProtectedRoute>} />
            <Route path="/dashboard/my-prescriptions" element={<ProtectedRoute roles={["patient"]}><MyPrescriptions /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
