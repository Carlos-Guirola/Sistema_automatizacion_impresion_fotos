import { Mail, MapPin, Phone, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

const footerLinks = [
  { to: "/", label: "Inicio" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/contacto", label: "Registro" },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Printer size={28} />
            <span>ToolsPrint</span>
          </div>

          <p>
            Plataforma para generar PDF y Word de impresion fotografica, controlar
            materiales y gestionar pedidos desde un solo lugar.
          </p>
        </div>

        <div className="footer-column">
          <h4>Navegacion</h4>
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <h4>Contacto</h4>

          <div className="footer-item">
            <Mail size={16} />
            guirolacarlos745@gmail.com
          </div>

          <div className="footer-item">
            <Phone size={16} />
            +503 7507-9705
          </div>

          <div className="footer-item">
            <MapPin size={16} />
            El Salvador
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 ToolsPrint - Todos los derechos reservados
      </div>
    </footer>
  );
}

export default Footer;
