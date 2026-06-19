import {
  BarChart3,
  CheckCircle,
  ClipboardList,
  FileText,
  FolderOpen,
  Image,
  Package,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const heroFeatures = ["Fotos Polaroid", "PDF automatico", "Proceso masivo"];

const features = [
  {
    icon: FolderOpen,
    title: "Carpetas completas",
    text: "Carga una carpeta de fotografias y prepara lotes sin repetir tareas.",
  },
  {
    icon: FileText,
    title: "PDF listo para imprimir",
    text: "Genera documentos ordenados, con margenes y tamanos pensados para tu flujo.",
  },
  {
    icon: Image,
    title: "Formato Polaroid",
    text: "Ajusta imagenes automaticamente en composiciones limpias y consistentes.",
  },
];

const comparison = [
  {
    className: "old-way",
    title: "Antes",
    items: [
      "Preparar foto por foto",
      "Acomodar todo a mano",
      "Revisar cada pagina",
      "Perder tiempo antes de imprimir",
    ],
    time: "Tarda varios minutos",
  },
  {
    className: "new-way",
    title: "Ahora",
    items: [
      "Subes tus fotos",
      "Escoges el papel",
      "Ves la vista previa",
      "Descargas el PDF listo",
    ],
    time: "Listo en segundos",
  },
];

const modules = [
  { icon: Package, title: "Inventario" },
  { icon: ClipboardList, title: "Pedidos" },
  { icon: BarChart3, title: "Reportes" },
];

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={16} />
            Automatiza tu impresion fotografica
          </div>

          <h1>Convierte fotos en PDFs listos para imprimir</h1>

          <p>
            Selecciona tus imagenes, elige el formato y deja que ToolsPrint
            organice el trabajo pesado para tu papeleria o negocio fotografico.
          </p>

          <div className="hero-features">
            {heroFeatures.map((feature) => (
              <span key={feature}>
                <CheckCircle size={18} />
                {feature}
              </span>
            ))}
          </div>

          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">
              Probar ahora
            </Link>

            <Link to="/como-funciona" className="btn-secondary">
              Ver proceso
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-mockup">
            <img src="/img1.jpg" alt="Muestra de impresion Polaroid" />
          </div>
        </div>
      </section>

      <section className="funcionalidades">
        <div className="section-title">
          <span>Funciones clave</span>
          <h2>Herramientas para imprimir mas rapido</h2>
          <p>Menos pasos manuales, mas control sobre cada pedido.</p>
        </div>

        <div className="cards-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature-card" key={title}>
              <Icon size={38} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="video-section">
        <div className="section-title">
          <span>Demo</span>
          <h2>Mira ToolsPrint en accion</h2>
          <p>Un espacio preparado para integrar tu video demostrativo.</p>
        </div>

        <div className="video-placeholder">
          <PlayCircle size={78} />
          <span>Video demo</span>
        </div>
      </section>

      <section className="comparison">
        {comparison.map((item) => (
          <article className={`comparison-card ${item.className}`} key={item.title}>
            <h3>{item.title}</h3>
            <ul>
              {item.items.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            <strong>{item.time}</strong>
          </article>
        ))}
      </section>

      <section className="modules">
        <div className="section-title">
          <span>Gestion</span>
          <h2>Modulos para ordenar el negocio</h2>
        </div>

        <div className="cards-grid">
          {modules.map(({ icon: Icon, title }) => (
            <article className="feature-card module-card" key={title}>
              <Icon size={38} />
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Empieza a imprimir con menos friccion</h2>
        <p>Reduce tiempos, organiza pedidos y prepara tus PDFs en segundos.</p>
        <Link to="/login" className="btn-primary">
          Iniciar sesion
        </Link>
      </section>
    </div>
  );
}

export default Home;
