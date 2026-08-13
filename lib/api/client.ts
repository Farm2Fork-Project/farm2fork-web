import { ApiError } from "./contracts.ts";

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
};

type ApiClientOptions = {
  baseUrl?: string;
  clearSession?: () => void;
  fetchFn?: FetchLike;
};

export class ApiClient {
  private readonly baseUrl: string | undefined;
  private readonly clearSession: () => void;
  private readonly fetchFn: FetchLike;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    this.clearSession = options.clearSession ?? (() => undefined);
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const baseUrl = this.requireBaseUrl();
    const { body, headers: suppliedHeaders, ...requestInit } = options;
    const headers = new Headers(suppliedHeaders);
    headers.set("Accept", "application/json");

    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    if (isUnsafeMethod(requestInit.method)) {
      headers.set("X-Farm2Fork-CSRF", "1");
    }

    let response: Response;
    try {
      response = await this.fetchFn(`${baseUrl}${normalizePath(path)}`, {
        ...requestInit,
        headers,
        credentials: "include",
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      throw new ApiError(0, "Network request failed.");
    }

    const responseBody = await readResponseBody(response);
    if (!response.ok) {
      if (response.status === 401) {
        this.clearSession();
        throw new ApiError(401, "Your session has expired.", responseBody);
      }

      throw new ApiError(
        response.status,
        getErrorMessage(responseBody, response.status),
        responseBody,
      );
    }

    return responseBody as T;
  }

  private requireBaseUrl(): string {
    const baseUrl = this.baseUrl?.trim().replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL must be configured.");
    }
    return baseUrl;
  }
}

function isUnsafeMethod(method: string | undefined): boolean {
  return ["DELETE", "PATCH", "POST", "PUT"].includes(
    (method ?? "GET").toUpperCase(),
  );
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text || null;
}

function getErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message?: unknown };
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === "string");
      if (messages.length > 0) return messages.join("; ");
    }
  }

  return `Request failed with status ${status}.`;
}
