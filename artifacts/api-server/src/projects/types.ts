export type ProjectAction = "create" | "add" | "change" | "fix";

export type LearningNote = {
  label: string;
  explanation: string;
};

export type PlayableProject = {
  title: string;
  summary: string;
  html: string;
  css: string;
  js: string;
  learningNotes: LearningNote[];
};

export type GenerationInput = {
  action: ProjectAction;
  idea: string;
  currentProject?: PlayableProject | null;
};

export type GenerationResult = {
  project: PlayableProject;
  warnings: string[];
};