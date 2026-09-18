import { Router, type IRouter } from "express";
import {
  GenerateProjectBody,
  GenerateProjectResponse,
} from "@workspace/api-zod";
import { generateWithProvider } from "../projects/ai-client";
import { getDemoResult } from "../projects/demo-projects";
import { validateProjectSafety } from "../projects/safety-validator";
import type { GenerationInput, GenerationResult } from "../projects/types";

const router: IRouter = Router();
const attemptsByClient = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

function isRateLimited(client: string): boolean {
  const now = Date.now();
  const current = attemptsByClient.get(client);
  if (!current || current.resetAt <= now) {
    attemptsByClient.set(client, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

router.post("/projects/generate", async (req, res): Promise<void> => {
  const client = req.ip ?? "unknown";
  if (isRateLimited(client)) {
    res.status(429).json({ error: "Let’s give the helper a short rest, then try again." });
    return;
  }

  const parsed = GenerateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Tell me one small thing you want to make." });
    return;
  }

  const input = parsed.data as GenerationInput;
  const useDemo = process.env.DEMO_MODE === "true" || !process.env.MODEL_API_KEY;
  let candidate: GenerationResult | undefined;

  if (!useDemo) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        candidate = GenerateProjectResponse.parse(await generateWithProvider(input)) as GenerationResult;
        const safetyIssues = validateProjectSafety(candidate.project);
        if (safetyIssues.length > 0) {
          candidate = undefined;
          throw new Error(`Rejected generated project: ${safetyIssues.join(", ")}`);
        }
        break;
      } catch (error) {
        req.log.warn(
          {
            attempt: attempt + 1,
            errorId: "project-generation-rejected",
            reason: error instanceof Error ? error.message : "Unknown provider error",
          },
          "Project generation attempt failed",
        );
      }
    }
  }

  if (!candidate) {
    candidate = getDemoResult(input);
  }

  const safetyIssues = validateProjectSafety(candidate.project);
  if (safetyIssues.length > 0) {
    req.log.error({ errorId: "unsafe-demo-project" }, "Project safety validation failed");
    res.status(500).json({ error: "I couldn’t make that project safely yet. Try another idea." });
    return;
  }

  res.json(GenerateProjectResponse.parse(candidate));
});

export default router;