function authToken(): string | undefined {
  return process.env.NEXT_PUBLIC_BRAINDUMP_API_TOKEN;
}

export function buildApiHeaders(headers?: HeadersInit): Headers {
  const mergedHeaders = new Headers(headers);
  const token = authToken();

  if (token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  return mergedHeaders;
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: buildApiHeaders(init.headers),
  });
}
