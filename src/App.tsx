import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import UserManagement from "./pages/UserManagement";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { Student } from "./pages/Dashboard";
import { initialMockStudents } from "./data/mockStudents";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const [students, setStudents] = useState<Student[]>(initialMockStudents);
  const { isAuthenticated, role, instructorName } = useAuth();

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.cunyId === updatedStudent.cunyId ? updatedStudent : s)));
  };


  // Route based on role
  if (role === ROLES.INSTRUCTOR && instructorName) {
    return (
      <InstructorDashboard
        instructorName={instructorName}
        allStudents={students}
        onUpdateStudent={handleUpdateStudent}
      />
    );
  }

  return <Dashboard initialStudentsData={students} onUpdateStudents={setStudents} />;
};

// UserManagementRoute no longer needed - handled by ProtectedRoute

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/overview" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OFFICE, ROLES.INSTRUCTOR]}>
                  <Overview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.OFFICE, ROLES.INSTRUCTOR]}>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
