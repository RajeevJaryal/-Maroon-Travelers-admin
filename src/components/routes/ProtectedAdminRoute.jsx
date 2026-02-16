import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const { token, isAdmin } = useSelector((s) => s.adminAuth);

  const loggedInAsAdmin = !!token && !!isAdmin;

  if (!loggedInAsAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
