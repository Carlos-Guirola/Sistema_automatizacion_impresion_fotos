import { Building2, FileText, Printer, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "../styles/dashboardPages.css";

function DashboardHome() {
  const storedUser = localStorage.getItem("toolsprint-user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = Boolean(user?.isAdmin);
  const [status, setStatus] = useState("Conectando...");
  const [stats, setStats] = useState({
    empresas: 0,
    usuarios: 0,
    papeles: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [health, papeles] = await Promise.all([api.health(), api.herramientas.papeles()]);
        const [empresas, usuarios] = isAdmin
          ? await Promise.all([api.empresas.list(), api.usuarios.list()])
          : [{ data: [] }, { data: [] }];

        setStatus(health.message);
        setStats({
          empresas: empresas.data.length,
          usuarios: usuarios.data.length,
          papeles: papeles.data.length,
        });
      } catch (error) {
        setStatus(error.message);
      }
    }

    loadDashboard();
  }, [isAdmin]);

  const adminCards = [
    { icon: Building2, label: "Empresas", value: stats.empresas },
    { icon: Users, label: "Usuarios", value: stats.usuarios },
  ];
  const cards = [
    ...(isAdmin ? adminCards : []),
    { icon: FileText, label: "Tamanos de papel", value: stats.papeles },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-title">
        <span>Panel principal</span>
        <h1>Gestion de ToolsPrint</h1>
        <p>{status}</p>
      </div>

      <div className="stats-grid">
        {cards.map(({ icon: Icon, label, value }) => (
          <article className="stat-card" key={label}>
            <Icon size={26} />
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </div>

      <section className="dashboard-panel">
        <Printer size={28} />
        <div>
          <h2>{isAdmin ? "Panel administrativo" : "Generador Polaroid"}</h2>
          <p>
            {isAdmin
              ? "Puedes gestionar empresas, usuarios y generar PDFs tipo Polaroid."
              : "Tu acceso esta enfocado en generar PDFs tipo Polaroid listos para imprimir."}
          </p>
          {!isAdmin && (
            <Link className="panel-link" to="/dashboard/generador">
              Ir al generador
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
