import {
  Check,
  Download,
  Eye,
  FileText,
  Flower2,
  Heart,
  Images,
  Printer,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import "../styles/dashboardPages.css";

const frameColors = [
  { label: "Blanco", value: "blanco", color: "#ffffff" },
  { label: "Negro", value: "negro", color: "#111111" },
  { label: "Rosado", value: "rosado", color: "#f9a8d4" },
  { label: "Beige", value: "beige", color: "#f2e3c6" },
  { label: "Lavanda", value: "lavanda", color: "#e9d5ff" },
  { label: "Cielo", value: "cielo", color: "#bfdbfe" },
  { label: "Menta", value: "menta", color: "#bbf7d0" },
  { label: "Durazno", value: "durazno", color: "#fed7aa" },
  { label: "Amarillo", value: "amarillo", color: "#fef3c7" },
  { label: "Lila", value: "lila", color: "#f5d0fe" },
];

const textColors = [
  { label: "Negro", value: "negro", color: "#111111" },
  { label: "Blanco", value: "blanco", color: "#ffffff" },
  { label: "Rojo", value: "rojo", color: "#e11d48" },
  { label: "Fucsia", value: "fucsia", color: "#be185d" },
  { label: "Azul", value: "azul", color: "#1d4ed8" },
  { label: "Verde", value: "verde", color: "#15803d" },
  { label: "Morado", value: "morado", color: "#7e22ce" },
  { label: "Naranja", value: "naranja", color: "#c2410c" },
];

const captionIcons = [
  { label: "Ninguno", value: "ninguno", icon: null },
  { label: "Corazon", value: "corazon", icon: Heart },
  { label: "Estrella", value: "estrella", icon: Star },
  { label: "Brillo", value: "brillo", icon: Sparkles },
  { label: "Flor", value: "flor", icon: Flower2 },
];

const fontOptions = [
  { label: "Limpia", value: "helvetica" },
  { label: "Clasica", value: "clasica" },
  { label: "Moderna", value: "moderna" },
  { label: "Redonda", value: "redonda" },
];

function buildFormData(paperSize, mode, polaroidOptions, files) {
  const formData = new FormData();
  formData.append("paperSize", paperSize);
  formData.append("mode", mode);
  formData.append("frameColor", polaroidOptions.frameColor);
  formData.append("captionText", polaroidOptions.captionText);
  formData.append("captionIcon", polaroidOptions.captionIcon);
  formData.append("textColor", polaroidOptions.textColor);
  formData.append("fontFamily", polaroidOptions.fontFamily);

  files.forEach((file) => {
    formData.append("imagenes", file);
  });

  return formData;
}

function GeneradorPage() {
  const [papeles, setPapeles] = useState([]);
  const [paperSize, setPaperSize] = useState("4x6-horizontal");
  const [mode, setMode] = useState("polaroid");
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [polaroidOptions, setPolaroidOptions] = useState({
    frameColor: "blanco",
    captionText: "",
    captionIcon: "ninguno",
    textColor: "negro",
    fontFamily: "helvetica",
  });
  const [layout, setLayout] = useState(null);
  const [files, setFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [successModal, setSuccessModal] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const filteredPapeles = useMemo(() => {
    if (mode === "polaroid") {
      return papeles.filter((papel) => papel.id.endsWith("-horizontal"));
    }

    return papeles;
  }, [mode, papeles]);

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

  function handleFiles(event) {
    setFiles(Array.from(event.target.files || []));
    setMessage("");
  }

  function handleModeChange(event) {
    const nextMode = event.target.value;
    setMode(nextMode);

    if (nextMode === "polaroid") {
      setPaperSize((current) => (current.endsWith("-vertical") ? "4x6-horizontal" : current));
    }
  }

  function handleOutputFormatChange(event) {
    const nextFormat = event.target.value;
    setOutputFormat(nextFormat);

    if (nextFormat !== "pdf" && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  }

  function updatePolaroidOption(name, value) {
    setPolaroidOptions((current) => ({ ...current, [name]: value }));
  }

  async function handlePreview() {
    if (!files.length) {
      setMessage("Selecciona al menos una imagen");
      return;
    }

    setPreviewLoading(true);
    setMessage("");

    try {
      const pdfBlob = await api.herramientas.preview(
        buildFormData(paperSize, mode, polaroidOptions, files)
      );

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(pdfBlob));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPreviewLoading(false);
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
      const fileBlob =
        outputFormat === "pdf"
          ? await api.herramientas.pdf(buildFormData(paperSize, mode, polaroidOptions, files))
          : await api.herramientas.word(buildFormData(paperSize, mode, polaroidOptions, files));
      const extension = outputFormat === "pdf" ? "pdf" : "docx";
      const url = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        mode === "foto-completa"
          ? `toolsprint-fotos.${extension}`
          : `toolsprint-polaroid.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessModal(
        `${outputFormat === "pdf" ? "PDF" : "Documento de Word"} descargado correctamente`
      );
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
        <h1>Generador de impresion</h1>
        <p>Selecciona una herramienta, carga fotos y genera PDF o Word listo para imprimir.</p>
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
            <select value={mode} onChange={handleModeChange}>
              <option value="polaroid">Fotos tipo Polaroid</option>
              <option value="foto-completa">Fotos completas sin borde</option>
            </select>
          </label>

          <label>
            Tamano de papel
            <select value={paperSize} onChange={(event) => setPaperSize(event.target.value)}>
              {filteredPapeles.map((papel) => (
                <option key={papel.id} value={papel.id}>
                  {papel.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de archivo
            <select value={outputFormat} onChange={handleOutputFormatChange}>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
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

              <label>
                Tipo de letra
                <select
                  value={polaroidOptions.fontFamily}
                  onChange={(event) => updatePolaroidOption("fontFamily", event.target.value)}
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
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
            {outputFormat === "pdf" && (
              <button
                className="secondary-action"
                type="button"
                onClick={handlePreview}
                disabled={previewLoading || loading}
              >
                <Eye size={18} />
                Vista previa
              </button>
            )}
            <button className="primary-action" type="button" onClick={handleDownload} disabled={loading}>
              <Download size={18} />
              Descargar {outputFormat === "pdf" ? "PDF" : "Word"}
            </button>
          </div>
        </div>

        <div className="preview-panel">
          <div className="form-heading">
            <FileText size={24} />
            <h2>Archivo listo</h2>
          </div>

          {previewUrl && outputFormat === "pdf" ? (
            <iframe className="pdf-preview" src={previewUrl} title="Vista previa PDF" />
          ) : (
            <div className="preview-empty">
              <FileText size={42} />
              <p>
                {outputFormat === "pdf"
                  ? "Genera una vista previa para revisar el PDF antes de descargar."
                  : "Word se descargara con las fotos listas para imprimir."}
              </p>
            </div>
          )}
        </div>
      </section>

      {successModal && (
        <div className="success-modal-backdrop" role="presentation">
          <div className="success-modal" role="dialog" aria-modal="true">
            <div className="success-modal-icon">
              <Check size={28} />
            </div>
            <h2>{successModal}</h2>
            <button type="button" className="primary-action" onClick={() => setSuccessModal("")}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneradorPage;
