import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Printer,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import "../styles/dashboardLayout.css";

const dashboardLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { to: "/dashboard/empresas", icon: Building2, label: "Empresas", adminOnly: true },
  { to: "/dashboard/usuarios", icon: Users, label: "Usuarios", adminOnly: true },
  { to: "/dashboard/generador", icon: Printer, label: "Generador" },
];

function DashboardLayout() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const storedUser = localStorage.getItem("toolsprint-user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const visibleLinks = dashboardLinks.filter((link) => !link.adminOnly || user?.isAdmin);

  function handleLogout() {
    localStorage.removeItem("toolsprint-user");
    navigate("/login");
  }

  return (
    <div className="dashboard-layout">
      <button
        className={`sidebar-backdrop ${isSidebarOpen ? "open" : ""}`}
        type="button"
        aria-label="Cerrar menu"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-logo">
            <Printer size={30} />
            <h2>ToolsPrint</h2>
            <button
              className="sidebar-close"
              type="button"
              aria-label="Cerrar menu"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-menu">
            {visibleLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setIsSidebarOpen(false)}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="theme-btn" type="button" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
          </button>

          <button className="logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="menu-btn"
            type="button"
            aria-label={isSidebarOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="user-info">
            {user ? `Bienvenida/o, ${user.nombre}` : "Bienvenida/o"}
          </div>
        </header>

        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
