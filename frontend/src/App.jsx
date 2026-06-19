import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import AdminRoute from "./dashboard/AdminRoute";
import DashboardHome from "./dashboard/DashboardHome";
import DashboardLayout from "./dashboard/DashboardLayout";
import EmpresasPage from "./dashboard/EmpresasPage";
import GeneradorPage from "./dashboard/GeneradorPage";
import ProtectedRoute from "./dashboard/ProtectedRoute";
import UsuariosPage from "./dashboard/UsuariosPage";
import ComoFunciona from "./pages/ComoFunciona";
import Contacto from "./pages/Contacto";
import Home from "./pages/Home";
import Login from "./pages/Login";

function Layout() {
  const location = useLocation();
  const hidePublicLayout =
    location.pathname === "/login" || location.pathname.startsWith("/dashboard");

  return (
    <>
      {!hidePublicLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route
            path="empresas"
            element={
              <AdminRoute>
                <EmpresasPage />
              </AdminRoute>
            }
          />
          <Route
            path="usuarios"
            element={
              <AdminRoute>
                <UsuariosPage />
              </AdminRoute>
            }
          />
          <Route path="generador" element={<GeneradorPage />} />
        </Route>
      </Routes>

      {!hidePublicLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
