import { Building2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import "../styles/dashboardPages.css";

const emptyForm = {
  nombre: "",
  telefono: "",
  direccion: "",
  correo: "",
  estado: 1,
};

function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEmpresas() {
    const response = await api.empresas.list();
    setEmpresas(response.data);
  }

  useEffect(() => {
    async function loadInitialEmpresas() {
      try {
        const response = await api.empresas.list();
        setEmpresas(response.data);
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadInitialEmpresas();
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
        await api.empresas.update(editingId, form);
        setMessage("Empresa actualizada correctamente");
      } else {
        await api.empresas.create(form);
        setMessage("Empresa creada correctamente");
      }

      resetForm();
      await loadEmpresas();
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
      await api.empresas.remove(id);
      setMessage("Empresa eliminada correctamente");
      await loadEmpresas();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function editEmpresa(empresa) {
    setEditingId(empresa.id_empresa);
    setForm({
      nombre: empresa.nombre || "",
      telefono: empresa.telefono || "",
      direccion: empresa.direccion || "",
      correo: empresa.correo || "",
      estado: empresa.estado ?? 1,
    });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-title">
        <span>Administracion</span>
        <h1>Empresas</h1>
        <p>Registra y actualiza las empresas que usaran ToolsPrint.</p>
      </div>

      {message && <div className="notice">{message}</div>}

      <section className="dashboard-grid">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <Building2 size={24} />
            <h2>{editingId ? "Editar empresa" : "Nueva empresa"}</h2>
          </div>

          <label>
            Nombre
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>

          <label>
            Telefono
            <input name="telefono" value={form.telefono} onChange={handleChange} />
          </label>

          <label>
            Correo
            <input name="correo" type="email" value={form.correo} onChange={handleChange} />
          </label>

          <label>
            Direccion
            <textarea name="direccion" rows="4" value={form.direccion} onChange={handleChange} />
          </label>

          <div className="form-actions">
            <button className="primary-action" type="submit" disabled={loading}>
              <Plus size={18} />
              {editingId ? "Guardar cambios" : "Crear empresa"}
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
          <h2>Empresas registradas</h2>
          <div className="data-table">
            {empresas.map((empresa) => (
              <article className="data-row" key={empresa.id_empresa}>
                <div>
                  <strong>{empresa.nombre}</strong>
                  <span>{empresa.correo || "Sin correo"} · {empresa.telefono || "Sin telefono"}</span>
                </div>
                <div className="row-actions">
                  <button type="button" onClick={() => editEmpresa(empresa)} title="Editar">
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(empresa.id_empresa)}
                    title="Eliminar"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}

            {!empresas.length && <p className="empty-state">Aun no hay empresas registradas.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EmpresasPage;
