import { Download, Eye, FileText, Heart, Images, Printer, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import "../styles/dashboardPages.css";

const frameColors = [
  { label: "Blanco", value: "blanco", color: "#ffffff" },
  { label: "Negro", value: "negro", color: "#111111" },
  { label: "Rosado", value: "rosado", color: "#f9a8d4" },
  { label: "Beige", value: "beige", color: "#f2e3c6" },
];

const textColors = [
  { label: "Negro", value: "negro", color: "#111111" },
  { label: "Blanco", value: "blanco", color: "#ffffff" },
  { label: "Rosado", value: "rosado", color: "#e11d74" },
  { label: "Rojo", value: "rojo", color: "#e11d48" },
];

const captionIcons = [
  { label: "Ninguno", value: "ninguno", icon: null },
  { label: "Corazon", value: "corazon", icon: Heart },
  { label: "Estrella", value: "estrella", icon: Star },
  { label: "Brillo", value: "brillo", icon: Sparkles },
];

function buildFormData(paperSize, mode, polaroidOptions, files) {
  const formData = new FormData();
  formData.append("paperSize", paperSize);
  formData.append("mode", mode);
  formData.append("frameColor", polaroidOptions.frameColor);
  formData.append("captionText", polaroidOptions.captionText);
  formData.append("captionIcon", polaroidOptions.captionIcon);
  formData.append("textColor", polaroidOptions.textColor);

  files.forEach((file) => {
    formData.append("imagenes", file);
  });

  return formData;
}

function GeneradorPage() {
  const [papeles, setPapeles] = useState([]);
  const [paperSize, setPaperSize] = useState("4x6-horizontal");
  const [mode, setMode] = useState("polaroid");
  const [polaroidOptions, setPolaroidOptions] = useState({
    frameColor: "blanco",
    captionText: "",
    captionIcon: "ninguno",
    textColor: "negro",
  });
  const [layout, setLayout] = useState(null);
  const [files, setFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const activeLayout = useMemo(() => {
    if (mode === "foto-completa") {
      return {
        grid: {
          photosPerPage: 1,
        },
      };
    }

    return layout;
  }, [layout, mode]);

  const totalPages = useMemo(() => {
    if (!activeLayout?.grid.photosPerPage || !files.length) return 0;
    return Math.ceil(files.length / activeLayout.grid.photosPerPage);
  }, [activeLayout, files.length]);

  useEffect(() => {
    async function loadPapeles() {
      const response = await api.herramientas.papeles();
      setPapeles(response.data);
    }

    loadPapeles().catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (mode === "foto-completa") {
      return;
    }

    async function loadLayout() {
      const response = await api.herramientas.layout(paperSize);
      setLayout(response.data);
    }

    loadLayout().catch((error) => setMessage(error.message));
  }, [paperSize, mode]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFiles(event) {
    setFiles(Array.from(event.target.files || []));
    setMessage("");
  }

  function updatePolaroidOption(name, value) {
    setPolaroidOptions((current) => ({ ...current, [name]: value }));
  }

  async function handlePreview() {
    if (!files.length) {
      setMessage("Selecciona al menos una imagen");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const pdfBlob = await api.herramientas.preview(
        buildFormData(paperSize, mode, polaroidOptions, files)
      );

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(pdfBlob));
      setMessage("Vista previa generada correctamente");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!files.length) {
      setMessage("Selecciona al menos una imagen");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const pdfBlob = await api.herramientas.pdf(
        buildFormData(paperSize, mode, polaroidOptions, files)
      );
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = mode === "foto-completa" ? "toolsprint-fotos.pdf" : "toolsprint-polaroid.pdf";
      link.click();
      URL.revokeObjectURL(url);
      setMessage("PDF descargado correctamente");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-title">
        <span>Herramientas</span>
        <h1>Generador de PDF</h1>
        <p>Selecciona una herramienta, carga fotos y genera una vista previa en PDF.</p>
      </div>

      {message && <div className="notice">{message}</div>}

      <section className="generator-grid">
        <div className="dashboard-form">
          <div className="form-heading">
            <Printer size={24} />
            <h2>Configuracion</h2>
          </div>

          <label>
            Herramienta
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="polaroid">Fotos tipo Polaroid</option>
              <option value="foto-completa">Fotos completas sin borde</option>
            </select>
          </label>

          <label>
            Tamano de papel
            <select value={paperSize} onChange={(event) => setPaperSize(event.target.value)}>
              {papeles.map((papel) => (
                <option key={papel.id} value={papel.id}>
                  {papel.label}
                </option>
              ))}
            </select>
          </label>

          {mode === "polaroid" && (
            <div className="polaroid-options">
              <div className="option-group">
                <span>Color del marco</span>
                <div className="color-options">
                  {frameColors.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`color-swatch ${
                        polaroidOptions.frameColor === item.value ? "selected" : ""
                      }`}
                      onClick={() => updatePolaroidOption("frameColor", item.value)}
                      title={item.label}
                    >
                      <span style={{ background: item.color }} />
                    </button>
                  ))}
                </div>
              </div>

              <label>
                Texto inferior
                <input
                  type="text"
                  value={polaroidOptions.captionText}
                  onChange={(event) => updatePolaroidOption("captionText", event.target.value)}
                  placeholder="Fecha, frase o nombre"
                  maxLength="38"
                />
              </label>

              <div className="option-group">
                <span>Icono</span>
                <div className="icon-options">
                  {captionIcons.map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={polaroidOptions.captionIcon === value ? "selected" : ""}
                      onClick={() => updatePolaroidOption("captionIcon", value)}
                      title={label}
                    >
                      {Icon ? <Icon size={18} /> : "Sin"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <span>Color de letra</span>
                <div className="color-options">
                  {textColors.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`color-swatch ${
                        polaroidOptions.textColor === item.value ? "selected" : ""
                      }`}
                      onClick={() => updatePolaroidOption("textColor", item.value)}
                      title={item.label}
                    >
                      <span style={{ background: item.color }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <label className="file-picker">
            <Images size={26} />
            <strong>Seleccionar imagenes</strong>
            <span>JPG, PNG o WEBP, puedes seleccionar varias a la vez.</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFiles}
            />
          </label>

          <div className="layout-summary">
            <article>
              <strong>{activeLayout?.grid.photosPerPage || 0}</strong>
              <span>{mode === "foto-completa" ? "Foto por pagina" : "Fotos por pagina"}</span>
            </article>
            <article>
              <strong>{files.length}</strong>
              <span>Imagenes</span>
            </article>
            <article>
              <strong>{totalPages}</strong>
              <span>Paginas</span>
            </article>
          </div>

          <div className="form-actions">
            <button className="primary-action" type="button" onClick={handlePreview} disabled={loading}>
              <Eye size={18} />
              Vista previa
            </button>
            <button className="secondary-action" type="button" onClick={handleDownload} disabled={loading}>
              <Download size={18} />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="preview-panel">
          <div className="form-heading">
            <FileText size={24} />
            <h2>Vista previa</h2>
          </div>

          {previewUrl ? (
            <iframe className="pdf-preview" src={previewUrl} title="Vista previa PDF" />
          ) : (
            <div className="preview-empty">
              <FileText size={42} />
              <p>Genera una vista previa para ver como quedaran las fotos.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default GeneradorPage;
