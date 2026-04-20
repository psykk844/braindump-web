import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";

describe("apiFetch", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BRAINDUMP_API_TOKEN;
    vi.restoreAllMocks();
  });

  it("adds Authorization bearer token when configured", async () => {
    process.env.NEXT_PUBLIC_BRAINDUMP_API_TOKEN = "secret-token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}"));

    await apiFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New task" }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);

    expect(headers.get("authorization")).toBe("Bearer secret-token");
    expect(headers.get("content-type")).toBe("application/json");
  });

  it("does not add Authorization header when token is absent", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("[]"));

    await apiFetch("/api/items");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);

    expect(headers.has("authorization")).toBe(false);
  });
});
