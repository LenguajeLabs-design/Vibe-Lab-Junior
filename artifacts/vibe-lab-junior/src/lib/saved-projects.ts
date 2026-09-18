import type { Project } from "@workspace/api-client-react";

const STORAGE_KEY = "vlj:saved-projects:v1";
const MAX_SAVED_PROJECTS = 20;

export type SavedProject = Project & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBoundedString(
  value: unknown,
  min: number,
  max: number,
): value is string {
  return (
    typeof value === "string" && value.length >= min && value.length <= max
  );
}

function isSafeProject(project: unknown): project is Project {
  if (!isRecord(project)) return false;
  if (!isBoundedString(project.title, 1, 60)) return false;
  if (!isBoundedString(project.summary, 1, 240)) return false;
  if (!isBoundedString(project.html, 1, 20_000)) return false;
  if (!isBoundedString(project.css, 0, 20_000)) return false;
  if (!isBoundedString(project.js, 0, 40_000)) return false;
  if (
    !Array.isArray(project.learningNotes) ||
    project.learningNotes.length < 1 ||
    project.learningNotes.length > 5
  ) {
    return false;
  }

  return project.learningNotes.every(
    (note) =>
      isRecord(note) &&
      isBoundedString(note.label, 1, 40) &&
      isBoundedString(note.explanation, 1, 180),
  );
}

function hasUnsafeCode(project: Project): boolean {
  const combined = `${project.html}\n${project.css}\n${project.js}`;
  const blockedPatterns = [
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bsendBeacon\b/i,
    /\bWebSocket\b/i,
    /\beval\s*\(/i,
    /\bnew\s+Function\b/i,
    /\bimport\s*\(/i,
    /\b(localStorage|sessionStorage|indexedDB)\b/i,
    /\bdocument\.cookie\b/i,
    /\bserviceWorker\b/i,
    /\b(?:window\s*\.\s*)?(?:parent|opener|top)\s*\./i,
    /\b(?:window\s*\.\s*open|(?:window\s*\.\s*)?location\s*(?:=|\.))/i,
    /https?:\/\//i,
    /@import\b/i,
    /\burl\s*\(/i,
    /<\s*\/?\s*(script|style|iframe|frame|object|embed|form|textarea|select|link|meta|base)\b/i,
    /\son[a-z]+\s*=/i,
  ];

  return blockedPatterns.some((pattern) => pattern.test(combined));
}

export function isSavedProject(value: unknown): value is SavedProject {
  if (!isRecord(value)) return false;
  if (!isBoundedString(value.id, 1, 120)) return false;
  if (!isBoundedString(value.createdAt, 1, 80)) return false;
  if (!isBoundedString(value.updatedAt, 1, 80)) return false;
  return isSafeProject(value) && !hasUnsafeCode(value);
}

export function getSavedProjects(): SavedProject[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isSavedProject)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveProject(
  project: Project,
  existingId?: string,
): SavedProject {
  if (!isSafeProject(project) || hasUnsafeCode(project)) {
    throw new Error("unsafe-project");
  }

  const projects = getSavedProjects();
  const existing = existingId
    ? projects.find((item) => item.id === existingId)
    : undefined;
  const now = new Date().toISOString();
  const saved: SavedProject = {
    ...project,
    id: existing?.id ?? makeId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = [
    saved,
    ...projects.filter((item) => item.id !== saved.id),
  ].slice(0, MAX_SAVED_PROJECTS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error("storage-unavailable");
  }

  return saved;
}

export function deleteSavedProject(id: string): void {
  const next = getSavedProjects().filter((project) => project.id !== id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error("storage-unavailable");
  }
}
