import { describe, it, expect } from "vitest";
import { classifyMessage } from "../src/lib/classify";

describe("classifyMessage", () => {
  it("classifies a URL as link", () => {
    const result = classifyMessage("https://github.com/unohee/OpenSwarm");
    expect(result.type).toBe("link");
    expect(result.url).toBe("https://github.com/unohee/OpenSwarm");
  });

  it("classifies text with URL as link and extracts URL", () => {
    const result = classifyMessage("Check this out https://example.com/cool-tool for automation");
    expect(result.type).toBe("link");
    expect(result.url).toBe("https://example.com/cool-tool");
  });

  it("classifies action words as todo", () => {
    const result = classifyMessage("Make sandbox know what tools I have access to");
    expect(result.type).toBe("todo");
    expect(result.url).toBeNull();
  });

  it("classifies imperative sentences as todo", () => {
    const result = classifyMessage("Add x to AI News");
    expect(result.type).toBe("todo");
  });

  it("classifies general thoughts as idea", () => {
    const result = classifyMessage("App that knows daily frustrations and what you're working on");
    expect(result.type).toBe("idea");
  });

  it("classifies multi-line with URL as link", () => {
    const result = classifyMessage("N8n or apify for transcript app\nhttps://perplexity.ai/search/something");
    expect(result.type).toBe("link");
    expect(result.url).toBe("https://perplexity.ai/search/something");
  });

  it("returns category based on keywords", () => {
    const result = classifyMessage("LinkedIn outreach for podcast");
    expect(result.category).toBe("marketing");
  });

  it("returns uncategorized for generic text", () => {
    const result = classifyMessage("random thought about stuff");
    expect(result.category).toBe("uncategorized");
  });
});
