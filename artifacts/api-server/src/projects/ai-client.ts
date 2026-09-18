import { buildPrompt } from "./prompt";
import type { GenerationInput, GenerationResult } from "./types";

const DEFAULT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5-mini";

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed);
}

export async function generateWithProvider(input: GenerationInput): Promise<unknown> {
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) throw new Error("MODEL_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(process.env.MODEL_API_URL ?? DEFAULT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME ?? DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "Follow the safety and JSON contract exactly. Return no markdown.",
          },
          { role: "user", content: buildPrompt(input) },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Model provider returned ${response.status}`);

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Model provider returned empty content");
    return extractJson(content) as GenerationResult;
  } finally {
    clearTimeout(timeout);
  }
}