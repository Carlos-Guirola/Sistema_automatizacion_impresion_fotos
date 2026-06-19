import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import "../styles/navbar.css";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/contacto", label: "Registro" },
];

function Navbar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span>ToolsPrint</span>
        </Link>

        <nav className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              className={location.pathname === link.to ? "active" : ""}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/login" className="navbar-button" onClick={() => setIsMenuOpen(false)}>
            <LogIn size={18} />
            <span>Iniciar sesion</span>
          </Link>

          <button
            type="button"
            className="navbar-menu-toggle"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
