import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "./Loading";
import { fetchCurrentUser } from "../services/authService";
import { getAuthToken, setAuthToken } from "../services/apiClient";

const ProtectedRoute = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await fetchCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setAuthToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [location.pathname]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
