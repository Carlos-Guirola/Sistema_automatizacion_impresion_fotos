import { CheckCircle, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import "../styles/dashboardPages.css";

const emptyForm = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono_whatsapp: "",
  contrasena: "",
  id_empresa: "",
  estado: 0,
};

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [usuariosResponse, registrosResponse, empresasResponse] = await Promise.all([
      api.usuarios.list(),
      api.registros.list(),
      api.empresas.list(),
    ]);

    setUsuarios(usuariosResponse.data);
    setRegistros(registrosResponse.data);
    setEmpresas(empresasResponse.data);
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        await loadData();
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadInitialData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (editingId) {
        await api.usuarios.update(editingId, form);
        setMessage("Usuario actualizado correctamente");
      }

      resetForm();
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(registroId) {
    setLoading(true);
    setMessage("");

    try {
      await api.registros.approve(registroId, {});
      setMessage("Registro aprobado y usuario activado");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    setMessage("");

    try {
      await api.usuarios.remove(id);
      setMessage("Usuario eliminado correctamente");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function editUsuario(usuario) {
    setEditingId(usuario.idUsuario);
    setForm({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      correo: usuario.correo || "",
      telefono_whatsapp: usuario.telefono_whatsapp || "",
      contrasena: "",
      id_empresa: usuario.id_empresa || "",
      estado: usuario.estado ?? 0,
    });
  }

  const registrosPendientes = registros.filter((registro) => registro.estado === 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-title">
        <span>Administracion</span>
        <h1>Usuarios</h1>
        <p>Aprueba registros, revisa empresas y activa usuarios.</p>
      </div>

      {message && <div className="notice">{message}</div>}

      <section className="dashboard-grid">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <UserPlus size={24} />
            <h2>{editingId ? "Editar usuario" : "Selecciona un usuario"}</h2>
          </div>

          <div className="two-columns">
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>

            <label>
              Apellido
              <input name="apellido" value={form.apellido} onChange={handleChange} required />
            </label>
          </div>

          <label>
            Correo
            <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
          </label>

          <label>
            WhatsApp
            <input name="telefono_whatsapp" value={form.telefono_whatsapp} onChange={handleChange} />
          </label>

          <label>
            Contrasena
            <input
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Dejar vacio para no cambiar"
            />
          </label>

          <label>
            Empresa
            <select name="id_empresa" value={form.id_empresa} onChange={handleChange}>
              <option value="">Sin empresa asignada</option>
              {empresas.map((empresa) => (
                <option key={empresa.id_empresa} value={empresa.id_empresa}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="0">Inactivo</option>
              <option value="1">Activo</option>
            </select>
          </label>

          <div className="form-actions">
            <button className="primary-action" type="submit" disabled={loading || !editingId}>
              Guardar cambios
            </button>

            {editingId && (
              <button className="secondary-action" type="button" onClick={resetForm}>
                <X size={18} />
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="data-panel">
          <h2>Solicitudes pendientes</h2>
          <div className="data-table">
            {registrosPendientes.map((registro) => (
              <article className="data-row" key={registro.id_registro}>
                <div>
                  <strong>
                    {registro.nombre} {registro.apellido}
                  </strong>
                  <span>
                    {registro.correo} · {registro.telefono_whatsapp} ·{" "}
                    {registro.empresa || "Sin empresa"}
                  </span>
                </div>

                <div className="approval-actions">
                  <button type="button" onClick={() => handleApprove(registro.id_registro)}>
                    <CheckCircle size={17} />
                    Aprobar
                  </button>
                </div>
              </article>
            ))}

            {!registrosPendientes.length && (
              <p className="empty-state">No hay solicitudes pendientes.</p>
            )}
          </div>

          <h2 className="panel-subtitle">Usuarios registrados</h2>
          <div className="data-table">
            {usuarios.map((usuario) => (
              <article className="data-row" key={usuario.idUsuario}>
                <div>
                  <strong>
                    {usuario.nombre} {usuario.apellido}
                  </strong>
                  <span>
                    {usuario.correo} · {usuario.empresa || "Sin empresa"} ·{" "}
                    {usuario.estado ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="row-actions">
                  <button type="button" onClick={() => editUsuario(usuario)} title="Editar">
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(usuario.idUsuario)}
                    title="Eliminar"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}

            {!usuarios.length && <p className="empty-state">Aun no hay usuarios registrados.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default UsuariosPage;
