import { webSession } from "../auth/web-session.ts";
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
  getAccessToken?: () => string | null;
  clearSession?: () => void;
  fetchFn?: FetchLike;
};

export class ApiClient {
  private readonly baseUrl: string | undefined;
  private readonly getAccessToken: () => string | null;
  private readonly clearSession: () => void;
  private readonly fetchFn: FetchLike;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    this.getAccessToken = options.getAccessToken ?? (() => webSession.read()?.accessToken ?? null);
    this.clearSession = options.clearSession ?? webSession.clear;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const baseUrl = this.requireBaseUrl();
    const { body, headers: suppliedHeaders, ...requestInit } = options;
    const headers = new Headers(suppliedHeaders);
    headers.set("Accept", "application/json");

    const accessToken = this.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      response = await this.fetchFn(`${baseUrl}${normalizePath(path)}`, {
        ...requestInit,
        headers,
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
