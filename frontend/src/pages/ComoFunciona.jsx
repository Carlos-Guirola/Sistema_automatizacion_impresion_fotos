import "../styles/como-funciona.css";

const steps = [
  {
    title: "Selecciona imagenes",
    text: "Carga una carpeta completa con las fotos que necesitas preparar.",
  },
  {
    title: "Elige papel y formato",
    text: "Define tamano de papel, distribucion y tipo de impresion.",
  },
  {
    title: "Genera el PDF",
    text: "ToolsPrint organiza las fotos y crea un documento listo para imprimir.",
  },
  {
    title: "Descarga e imprime",
    text: "Usa el PDF generado sin ajustes extra ni trabajo manual repetitivo.",
  },
  {
    title: "Registra pedidos",
    text: "Mantiene el seguimiento de trabajos, clientes y estados operativos.",
  },
  {
    title: "Controla materiales",
    text: "Consulta inventario, movimientos y recursos desde la misma plataforma.",
  },
];

const managementTools = [
  "Inventario de materiales",
  "Entradas y salidas",
  "Gestion de pedidos",
  "Control de ventas",
  "Clientes",
  "Reportes",
];

const benefits = [
  "PDFs automaticos",
  "Impresion tipo Polaroid",
  "Compatibilidad con varios tamanos",
  "Ahorro de tiempo",
  "Mayor productividad",
  "Mejor control operativo",
];

function ComoFunciona() {
  return (
    <div className="como-funciona-container">
      <section className="funciona-hero">
        <span className="funciona-badge">Como funciona</span>
        <h1>De carpeta de fotos a PDF listo en pocos pasos</h1>
        <p>
          ToolsPrint automatiza la preparacion de fotografias para impresion y
          suma herramientas basicas para administrar tu flujo de trabajo.
        </p>
      </section>

      <section className="pasos-container">
        {steps.map((step, index) => (
          <article className="paso-card" key={step.title}>
            <div className="paso-numero">{String(index + 1).padStart(2, "0")}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </section>

      <section className="modulos-section">
        <h2>Herramientas de gestion incluidas</h2>
        <div className="beneficios-grid">
          {managementTools.map((tool) => (
            <div className="beneficio" key={tool}>
              {tool}
            </div>
          ))}
        </div>
      </section>

      <section className="beneficios">
        <h2>Beneficios de utilizar ToolsPrint</h2>
        <div className="beneficios-grid">
          {benefits.map((benefit) => (
            <div className="beneficio" key={benefit}>
              {benefit}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ComoFunciona;
