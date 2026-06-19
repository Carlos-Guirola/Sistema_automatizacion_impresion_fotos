import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/contacto.css";

const emptyForm = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono_whatsapp: "",
  empresa_nombre: "",
  contrasena: "",
};

function Contacto() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
      const response = await api.registros.create(form);
      setSuccessMessage(response.message);
      setForm(emptyForm);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAcceptSuccess() {
    setSuccessMessage("");
    navigate("/");
  }

  return (
    <div className="contacto-container">
      <section className="contacto-hero">
        <span className="contacto-badge">Registro</span>
        <h1>Registro</h1>
        <p>Completa tus datos para solicitar acceso a ToolsPrint.</p>
      </section>

      <section className="contacto-content">
        <div className="contacto-info">
          <h2>Acceso pendiente</h2>
          <p>
            Al registrarte, tu usuario queda pendiente. El administrador te
            contactara cuando este activo.
          </p>

          <div className="info-box">
            <strong>Estado inicial</strong>
            <span>Pendiente</span>
          </div>

          <div className="info-box">
            <strong>Inicio de sesion</strong>
            <span>Usaras tu correo cuando el usuario este activo</span>
          </div>
        </div>

        <div className="contacto-form-container">
          {message && <div className="notice">{message}</div>}

          <form className="contacto-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido</label>
                <input
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Correo electronico</label>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label>WhatsApp</label>
              <input
                name="telefono_whatsapp"
                value={form.telefono_whatsapp}
                onChange={handleChange}
                placeholder="+503 7000-0000"
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre de la empresa</label>
              <input
                name="empresa_nombre"
                value={form.empresa_nombre}
                onChange={handleChange}
                placeholder="Nombre de tu empresa"
                required
              />
            </div>

            <div className="form-group">
              <label>Contrasena</label>
              <input
                name="contrasena"
                type="password"
                value={form.contrasena}
                onChange={handleChange}
                placeholder="Crea una contrasena"
                required
              />
            </div>

            <button type="submit" className="btn-enviar" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>
        </div>
      </section>

      {successMessage && (
        <div className="success-modal-backdrop" role="presentation">
          <div className="success-modal" role="dialog" aria-modal="true">
            <div className="success-modal-icon">✓</div>
            <h2>Registro exitoso</h2>
            <p>{successMessage}</p>
            <button type="button" onClick={handleAcceptSuccess}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacto;
