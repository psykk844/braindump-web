const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/i;

const TODO_PATTERNS = [
  /^(make|add|fix|build|create|set up|setup|install|remove|update|send|finish|check|test|deploy|push|pull|write|review|schedule)\b/i,
  /\b(need to|must|should|have to|gotta|todo|to-do|action item)\b/i,
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  marketing: ["linkedin", "outreach", "podcast", "seo", "content", "social media", "audience"],
  development: ["api", "code", "deploy", "bug", "feature", "sandbox", "n8n", "apify", "github", "app"],
  research: ["perplexity", "reddit", "appsumo", "compare", "explore", "look into"],
  personal: ["cruise", "shopping", "lunch", "dinner", "health", "pool", "backwash"],
  ai: ["ai", "llm", "gpt", "claude", "agent", "openswarm", "notebooklm"],
};

export interface ClassificationResult {
  type: "link" | "idea" | "todo";
  url: string | null;
  category: string;
}

export function classifyMessage(text: string): ClassificationResult {
  const urlMatch = text.match(URL_REGEX);
  const url = urlMatch ? urlMatch[0] : null;

  // If there's a URL, it's a link
  if (url) {
    return { type: "link", url, category: categorize(text) };
  }

  // Check for todo patterns
  for (const pattern of TODO_PATTERNS) {
    if (pattern.test(text)) {
      return { type: "todo", url: null, category: categorize(text) };
    }
  }

  // Default to idea
  return { type: "idea", url: null, category: categorize(text) };
}

function categorize(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = "uncategorized";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}
