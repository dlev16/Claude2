import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/constants/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, initialized } = useAuth();

  if (!initialized) {
    return null; // wait for auth to initialize to avoid false redirects
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
