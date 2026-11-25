type ApiError = {
  error?: {
    message?: string;
  };
};

const API_BASE_RAW = import.meta.env.VITE_API_URL || "";
const API_BASE = API_BASE_RAW.replace(/^"|"$/g, "").replace(/\/$/, "");

/**
 * Resolve URL gambar dari backend.
 * - Path lokal (/uploads/...) → prepend API_BASE
 * - URL eksternal (http/https) → langsung pakai
 */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (API_BASE) return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  return url;
}

function buildUrl(path: string) {
  if (API_BASE) return `${API_BASE}${path}`;
  return path;
}

export function getAuthToken() {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string | null) {
  if (!token) {
    localStorage.removeItem("auth_token");
    return;
  }
  localStorage.setItem("auth_token", token);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(buildUrl(path), { ...init, headers });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Tidak bisa terhubung ke server";
    throw new Error(
      `Tidak bisa terhubung ke server API. Pastikan backend berjalan di ${API_BASE || "(proxy /api)"}. Detail: ${msg}`,
    );
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text) as ApiError;
          msg = json?.error?.message || msg;
        } catch {
          msg = text;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
