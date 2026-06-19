import { Navigate } from "react-router-dom";

function getStoredUser() {
  const storedUser = localStorage.getItem("toolsprint-user");
  return storedUser ? JSON.parse(storedUser) : null;
}

function AdminRoute({ children }) {
  const user = getStoredUser();

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard/generador" replace />;
  }

  return children;
}

export default AdminRoute;
