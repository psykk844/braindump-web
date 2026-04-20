import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { checkAuth } from "@/lib/auth";

describe("checkAuth", () => {
  it("returns null when API token is not configured", () => {
    delete process.env.BRAINDUMP_API_TOKEN;
    const request = new NextRequest("http://localhost/api/tasks");

    const result = checkAuth(request);

    expect(result).toBeNull();
  });

  it("returns 401 when token is configured and authorization is missing", async () => {
    process.env.BRAINDUMP_API_TOKEN = "expected-token";
    const request = new NextRequest("http://localhost/api/tasks");

    const result = checkAuth(request);

    expect(result?.status).toBe(401);
    await expect(result?.json()).resolves.toEqual({ error: "Unauthorized" });

    delete process.env.BRAINDUMP_API_TOKEN;
  });

  it("returns null when authorization matches configured token", () => {
    process.env.BRAINDUMP_API_TOKEN = "expected-token";
    const request = new NextRequest("http://localhost/api/tasks", {
      headers: { Authorization: "Bearer expected-token" },
    });

    const result = checkAuth(request);

    expect(result).toBeNull();

    delete process.env.BRAINDUMP_API_TOKEN;
  });
});
