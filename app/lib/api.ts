import { MOCKS_ENABLED, mockRequest } from "@/app/lib/mockApi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "ismp-token";

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Role adapter ──────────────────────────────────────────────────────────────

export type BackendRole = "ADMIN" | "DOCENTE" | "ESTUDIANTE";
export type FrontendRole = "admin" | "docente" | "estudiante";

export function toFrontendRole(role: BackendRole): FrontendRole {
  return role.toLowerCase() as FrontendRole;
}

export function toBackendRole(role: FrontendRole): BackendRole {
  return role.toUpperCase() as BackendRole;
}

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Modo mock (NEXT_PUBLIC_USE_MOCKS=1): resolvemos sin tocar el backend.
  if (MOCKS_ENABLED) {
    try {
      return await mockRequest<T>(path, init);
    } catch (err) {
      const status = (err as { status?: number }).status ?? 500;
      throw new ApiError(status, (err as Error).message);
    }
  }

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = Array.isArray(body.message)
        ? body.message.join(", ")
        : (body.message ?? message);
    } catch {
      // ignore JSON parse errors
    }

    // Only redirect on 401 when not already on the login page, to avoid loops.
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      clearToken();
      window.location.href = "/login";
    }

    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
