const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    window.location.href = "/";
    return;
  }

  return response;
}

// Ejemplo de uso para obtener usuarios
export async function getUsuarios() {
  const response = await apiCall("/usuarios");
  return response?.json();
}
