import { ArrowLeft, Printer } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = localStorage.getItem("toolsprint-user");
  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.auth.login({
        correo: form.correo.trim(),
        contrasena: form.contrasena,
      });
      localStorage.setItem("toolsprint-user", JSON.stringify(response.data));
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (storedUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Printer size={30} />
          </div>
          <h1>ToolsPrint</h1>
          <p>Inicia sesion para continuar</p>
        </div>

        {message && <div className="login-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo</label>
            <input
              name="correo"
              type="text"
              placeholder="Ingresa tu correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Contrasena</label>
            <input
              name="contrasena"
              type="password"
              placeholder="Ingresa tu contrasena"
              value={form.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <label className="remember">
            <input type="checkbox" />
            <span>Recordarme</span>
          </label>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Validando..." : "Iniciar sesion"}
          </button>
        </form>

        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Volver al sitio
        </Link>
      </div>
    </div>
  );
}

export default Login;
