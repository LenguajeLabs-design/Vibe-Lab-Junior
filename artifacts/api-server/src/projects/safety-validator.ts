import type { PlayableProject } from "./types";

const blockedPatterns: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\bfetch\s*\(/i, reason: "network requests" },
  { pattern: /\bXMLHttpRequest\b/i, reason: "network requests" },
  { pattern: /\bsendBeacon\b/i, reason: "network requests" },
  { pattern: /\bWebSocket\b/i, reason: "network requests" },
  { pattern: /\beval\s*\(/i, reason: "dynamic code execution" },
  { pattern: /\bnew\s+Function\b/i, reason: "dynamic code execution" },
  { pattern: /\bimport\s*\(/i, reason: "dynamic imports" },
  { pattern: /\b(localStorage|sessionStorage|indexedDB)\b/i, reason: "browser storage" },
  { pattern: /\bdocument\.cookie\b/i, reason: "cookies" },
  { pattern: /\bserviceWorker\b/i, reason: "service workers" },
  { pattern: /\b(?:window\s*\.\s*)?(?:parent|opener|top)\s*\./i, reason: "parent window access" },
  { pattern: /\b(?:window\s*\.\s*open|(?:window\s*\.\s*)?location\s*(?:=|\.))/i, reason: "navigation or popups" },
  { pattern: /https?:\/\//i, reason: "external URLs" },
  { pattern: /(?:src|href)\s*=\s*["']\s*\/\//i, reason: "external resources" },
  { pattern: /@import\b/i, reason: "external style imports" },
  { pattern: /\burl\s*\(/i, reason: "external CSS resources" },
  { pattern: /<\s*\/?\s*script\b/i, reason: "script element injection" },
  { pattern: /<\s*\/?\s*style\b/i, reason: "style element injection" },
];

const blockedHtml = [
  "script",
  "iframe",
  "frame",
  "object",
  "embed",
  "form",
  "textarea",
  "select",
  "link",
  "meta",
  "base",
];

export function validateProjectSafety(project: PlayableProject): string[] {
  const issues: string[] = [];
  const combined = `${project.html}\n${project.css}\n${project.js}`;

  for (const { pattern, reason } of blockedPatterns) {
    if (pattern.test(combined)) issues.push(reason);
  }

  for (const tag of blockedHtml) {
    if (new RegExp(`<\\s*${tag}\\b`, "i").test(project.html)) {
      issues.push(`blocked <${tag}> element`);
    }
  }

  if (/\son[a-z]+\s*=/i.test(project.html)) {
    issues.push("inline event handlers");
  }

  return [...new Set(issues)];
}