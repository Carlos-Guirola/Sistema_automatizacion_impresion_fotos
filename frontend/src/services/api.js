const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || "Error en la solicitud");
    }

    throw new Error("Error en la solicitud");
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.blob();
}

function jsonOptions(method, body) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export const api = {
  health: () => request("/health"),

  auth: {
    login: (data) => request("/auth/login", jsonOptions("POST", data)),
  },

  registros: {
    create: (data) => request("/registros", jsonOptions("POST", data)),
    list: () => request("/registros"),
    approve: (id, data) => request(`/registros/${id}/aprobar`, jsonOptions("POST", data)),
  },

  empresas: {
    list: () => request("/empresas"),
    create: (data) => request("/empresas", jsonOptions("POST", data)),
    update: (id, data) => request(`/empresas/${id}`, jsonOptions("PUT", data)),
    remove: (id) => request(`/empresas/${id}`, { method: "DELETE" }),
  },

  usuarios: {
    list: () => request("/usuarios"),
    create: (data) => request("/usuarios", jsonOptions("POST", data)),
    update: (id, data) => request(`/usuarios/${id}`, jsonOptions("PUT", data)),
    remove: (id) => request(`/usuarios/${id}`, { method: "DELETE" }),
  },

  herramientas: {
    papeles: () => request("/herramientas/papeles"),
    layout: (paperSize) => request(`/herramientas/papeles/${paperSize}/layout`),
    preview: (formData) =>
      request("/herramientas/preview", {
        method: "POST",
        body: formData,
      }),
    pdf: (formData) =>
      request("/herramientas/pdf", {
        method: "POST",
        body: formData,
      }),
  },
};
