import React, { useState } from "react";
import {
  Project,
  useGenerateProject,
  ProjectGenerationRequestAction,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { ProjectViewer } from "@/components/project-viewer";
import { LearningExplanation } from "@/components/learning-notes";
import { SavedProjects } from "@/components/saved-projects";
import {
  deleteSavedProject,
  getSavedProjects,
  saveProject,
  type SavedProject,
} from "@/lib/saved-projects";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Info,
  RefreshCw,
  Lightbulb,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

const EXAMPLES = [
  "A game where a cat catches stars",
  "A quiz about ocean animals",
  "A space button that makes planets move",
];

type UpdateAction = Exclude<
  (typeof ProjectGenerationRequestAction)[keyof typeof ProjectGenerationRequestAction],
  "create"
>;

type Confirmation =
  | { kind: "delete"; project: SavedProject }
  | { kind: "start-over" };

const UPDATE_COPY: Record<
  UpdateAction,
  { title: string; prompt: string; emoji: string }
> = {
  add: {
    title: "Add something",
    prompt: "What should we add?",
    emoji: "➕",
  },
  change: {
    title: "Change something",
    prompt: "What should we change?",
    emoji: "🎨",
  },
  fix: {
    title: "Fix something",
    prompt: "What is not working yet?",
    emoji: "🔧",
  },
};

const LOADING_MESSAGES = [
  "Gathering pixels...",
  "Teaching computers to be fun...",
  "Mixing the colors...",
  "Sprinkling some magic dust...",
  "Waking up the hamsters...",
  "Almost there!",
];

const LOGO_URL = `${import.meta.env.BASE_URL}logo-vlj.png`;

export default function Home() {
  const { toast } = useToast();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [updateIdea, setUpdateIdea] = useState("");
  const [selectedAction, setSelectedAction] = useState<UpdateAction | null>(
    null,
  );
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const generateProject = useGenerateProject({
    mutation: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status;
        const isTransient = status == null || status >= 500;
        return isTransient && failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),
    },
  });
  const isGenerating = generateProject.isPending;

  React.useEffect(() => {
    setSavedProjects(getSavedProjects());
  }, []);

  // Cycle loading messages
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !currentProject) {
      interval = setInterval(() => {
        setLoadingStep((s) => (s + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, currentProject]);

  const handleCreate = () => {
    if (!idea.trim()) return;

    generateProject.mutate(
      {
        data: {
          action: ProjectGenerationRequestAction.create,
          idea,
        },
      },
      {
        onSuccess: (res) => {
          setCurrentProject(res.project);
          setSavedProjectId(null);
          if (res.warnings && res.warnings.length > 0) {
            toast({
              title: "Note",
              description: res.warnings[0],
              duration: 5000,
            });
          }
        },
        onError: () => {
          toast({
            title: "The helper needs another try",
            description:
              "I couldn’t make that project yet. Try saying it another way.",
            action: (
              <ToastAction
                altText={`Use example: ${EXAMPLES[0]}`}
                onClick={() => setIdea(EXAMPLES[0])}
              >
                Use example
              </ToastAction>
            ),
          });
        },
      },
    );
  };

  const handleUpdate = (action: UpdateAction, updateIdea: string) => {
    if (!updateIdea.trim() || !currentProject) return;

    generateProject.mutate(
      {
        data: {
          action,
          idea: updateIdea,
          currentProject,
        },
      },
      {
        onSuccess: (res) => {
          setCurrentProject(res.project);
          setUpdateIdea("");
          setSelectedAction(null);
          if (res.warnings && res.warnings.length > 0) {
            toast({
              title: "Note",
              description: res.warnings[0],
              duration: 5000,
            });
          }
        },
        onError: () => {
          toast({
            title: "Your project is still safe",
            description: `I couldn’t make that update yet. Try something simple, like “Add a score counter.”`,
          });
        },
      },
    );
  };

  const handleSave = () => {
    if (!currentProject) return;

    try {
      const saved = saveProject(currentProject, savedProjectId ?? undefined);
      setSavedProjectId(saved.id);
      setSavedProjects(getSavedProjects());
      toast({
        title: "Saved on this device",
        description: "Nothing is uploaded.",
        duration: 4000,
      });
    } catch {
      toast({
        title: "This project could not be saved",
        description: "You can keep playing it. Nothing was uploaded.",
        duration: 5000,
      });
    }
  };

  const handleOpenSaved = (saved: SavedProject) => {
    setCurrentProject({
      title: saved.title,
      summary: saved.summary,
      html: saved.html,
      css: saved.css,
      js: saved.js,
      learningNotes: saved.learningNotes,
    });
    setSavedProjectId(saved.id);
    setSelectedAction(null);
    setUpdateIdea("");
    setExplanationVisible(false);
  };

  const handleDeleteSaved = (saved: SavedProject) => {
    setConfirmation({ kind: "delete", project: saved });
  };

  const confirmDeleteSaved = (saved: SavedProject) => {
    try {
      deleteSavedProject(saved.id);
      setSavedProjects(getSavedProjects());
      if (savedProjectId === saved.id) setSavedProjectId(null);
      toast({
        title: "Project deleted",
        description: "It was removed from this device.",
        duration: 4000,
      });
    } catch {
      toast({
        title: "The project is still saved",
        description: "I could not update the saved projects on this device.",
        duration: 5000,
      });
    }
    setConfirmation(null);
  };

  const startOver = () => {
    setConfirmation({ kind: "start-over" });
  };

  const confirmStartOver = () => {
    setCurrentProject(null);
    setSavedProjectId(null);
    setIdea("");
    setUpdateIdea("");
    setSelectedAction(null);
    setExplanationVisible(false);
    setConfirmation(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background w-full flex flex-col font-sans selection:bg-primary/20">
      <AnimatePresence mode="wait">
        {!currentProject && !isGenerating && (
          <motion.div
            key="create-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6 max-w-3xl mx-auto w-full"
          >
            <div className="text-center space-y-3 mb-8">
              <h1>
                <img
                  src={LOGO_URL}
                  alt="Vibe Lab Junior"
                  className="w-full max-w-[380px] h-auto mx-auto"
                  data-testid="img-brand-logo"
                />
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 font-medium">
                Turn your ideas into tiny, playable projects.
              </p>
            </div>

            <div className="w-full bg-card rounded-3xl shadow-sm p-5 sm:p-6 md:p-7 border border-card-border relative">
              <label
                htmlFor="idea"
                className="block text-xl font-bold text-foreground"
              >
                What should we make?
              </label>
              <p id="idea-help" className="mt-2 mb-3 text-sm text-muted-foreground">
                Start with something you want to play with, like a cat catching stars.
              </p>
              <Textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="A piano you can play with your mouse..."
                aria-describedby="idea-help"
                className="text-lg p-4 sm:p-5 mb-4 rounded-2xl border"
                data-testid="input-idea"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.metaKey || e.ctrlKey)
                  ) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
              <Button
                size="lg"
                className="w-full h-14 text-xl rounded-xl shadow-sm"
                onClick={handleCreate}
                disabled={!idea.trim() || isGenerating}
                data-testid="button-make-it"
              >
                <Wand2 className="w-8 h-8 mr-2" />✨ Make it
              </Button>

              <div className="mt-6 pt-6 border-t border-border/70">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Need inspiration? Try these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setIdea(ex)}
                      className="min-h-11 text-left bg-muted/60 hover:bg-accent/40 hover:text-accent-foreground text-foreground text-sm font-medium px-4 py-2.5 rounded-full transition-colors border border-transparent hover:border-accent/50"
                      data-testid={`example-${i}`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <SavedProjects
              projects={savedProjects}
              onOpen={handleOpenSaved}
              onDelete={handleDeleteSaved}
            />

            <p className="mt-8 text-sm font-medium text-muted-foreground text-center flex items-center justify-center gap-2">
              <Info className="w-4 h-4" />
              Your idea is sent to the app’s helper. Nothing is saved unless you
              choose to save a project.
            </p>
          </motion.div>
        )}

        {!currentProject && isGenerating && (
          <motion.div
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-busy="true"
            data-testid="full-screen-loading"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="w-32 h-32 bg-card rounded-3xl shadow-xl border-4 border-primary/20 flex items-center justify-center relative z-10 animate-bounce">
                <Wand2 className="w-16 h-16 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="mt-12 text-3xl font-bold text-foreground">
              {LOADING_MESSAGES[loadingStep]}
            </h2>
            <p className="mt-3 text-lg font-medium text-muted-foreground">
              Making your project — this may take a moment.
            </p>
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {currentProject && (
          <motion.div
            key="project-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col w-full h-[100dvh] overflow-hidden"
          >
            <DialogPrimitive.Root
              open={explanationVisible}
              onOpenChange={setExplanationVisible}
            >
              <header className="flex-none p-4 md:px-6 bg-white border-b-2 border-border shadow-sm flex items-center justify-between z-20">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={LOGO_URL}
                    alt=""
                    className="h-9 sm:h-11 w-auto max-w-[180px] object-contain object-left"
                    data-testid="img-header-logo"
                  />
                  <div>
                    <h1 className="sr-only md:not-sr-only text-xl font-bold text-foreground leading-tight truncate">
                      {currentProject.title}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startOver}
                    className="font-bold border-2 rounded-xl"
                    data-testid="button-start-over"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Start over</span>
                  </Button>
                </div>
              </header>

              <main className="flex-1 relative p-3 sm:p-4 lg:p-6 bg-muted/30 overflow-y-auto flex flex-col gap-4 lg:gap-6">
                {/* Project display */}
                <div className="flex-none w-full h-[clamp(300px,42vh,400px)] md:h-[clamp(480px,55vh,620px)] relative">
                  <ProjectViewer
                    project={currentProject}
                    isUpdating={isGenerating}
                  />
                </div>

                {/* Toolbar */}
                <div className="flex-none w-full flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-3xl border-2 border-border shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b-2 border-border/50">
                    <p className="text-sm font-medium text-muted-foreground">
                      Saved only on this device. Nothing is uploaded.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto rounded-xl font-bold focus-visible:ring-4 focus-visible:ring-ring/40"
                      onClick={handleSave}
                      disabled={isGenerating}
                      data-testid="button-save-project"
                    >
                      <Save aria-hidden="true" />
                      {savedProjectId ? "Save changes" : "Save project"}
                    </Button>
                  </div>
                  {!selectedAction ? (
                    <>
                      <div className="flex flex-col gap-3">
                        <div>
                          <h2 className="text-lg font-bold text-foreground">
                            What next?
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Keep your project moving with one small idea.
                          </p>
                        </div>
                        <Button
                          variant="default"
                          className="w-full min-h-14 justify-center rounded-xl font-bold focus-visible:ring-4 focus-visible:ring-ring/40"
                          onClick={() => setSelectedAction("change")}
                          disabled={isGenerating}
                          data-testid="button-change"
                        >
                          <span className="text-lg" aria-hidden="true">
                            {UPDATE_COPY.change.emoji}
                          </span>
                          Make a change
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full font-bold"
                          onClick={() => setSelectedAction("add")}
                          disabled={isGenerating}
                          data-testid="button-add"
                        >
                          <span aria-hidden="true">{UPDATE_COPY.add.emoji}</span>
                          {UPDATE_COPY.add.title}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full font-bold"
                          onClick={() => setSelectedAction("fix")}
                          disabled={isGenerating}
                          data-testid="button-fix"
                        >
                          <span aria-hidden="true">{UPDATE_COPY.fix.emoji}</span>
                          {UPDATE_COPY.fix.title}
                        </Button>
                        <DialogPrimitive.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full font-bold text-muted-foreground"
                            disabled={isGenerating}
                            data-testid="button-see-how"
                          >
                            <Lightbulb aria-hidden="true" />
                            How it works
                          </Button>
                        </DialogPrimitive.Trigger>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedAction(null);
                          setUpdateIdea("");
                        }}
                        data-testid="button-back-actions"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Pick another action
                      </button>
                      <div>
                        <p className="text-sm font-bold text-primary mb-1">
                          {UPDATE_COPY[selectedAction].emoji}{" "}
                          {UPDATE_COPY[selectedAction].title}
                        </p>
                        <label
                          htmlFor="update-idea"
                          className="text-lg font-bold text-foreground"
                        >
                          {UPDATE_COPY[selectedAction].prompt}
                        </label>
                      </div>
                      <Textarea
                        id="update-idea"
                        value={updateIdea}
                        onChange={(e) => setUpdateIdea(e.target.value)}
                        placeholder="Tell the helper one small change..."
                        className="min-h-[120px] text-base resize-none rounded-2xl"
                        data-testid="input-update"
                        disabled={isGenerating}
                        autoFocus
                      />
                      <Button
                        className="w-full rounded-xl font-bold"
                        onClick={() => handleUpdate(selectedAction, updateIdea)}
                        disabled={!updateIdea.trim() || isGenerating}
                        data-testid="button-update-project"
                      >
                        Update my project
                      </Button>
                    </div>
                  )}
                </div>
              </main>

              {/* Explanation Modal */}
              <LearningExplanation project={currentProject} />
            </DialogPrimitive.Root>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialogPrimitive.Root
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      >
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-card-border bg-card p-6 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <AlertDialogPrimitive.Title className="text-xl font-bold text-foreground">
              {confirmation?.kind === "delete"
                ? "Delete this project?"
                : "Start a new project?"}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {confirmation?.kind === "delete"
                ? "This removes the saved copy from this device. Your other projects will stay safe."
                : "Your current project will close. Save it first if you want to keep a copy."}
            </AlertDialogPrimitive.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogPrimitive.Cancel asChild>
                <Button type="button" variant="ghost" className="rounded-xl">
                  Keep it
                </Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button
                  type="button"
                  variant={confirmation?.kind === "delete" ? "destructive" : "default"}
                  className="rounded-xl"
                  onClick={() => {
                    if (confirmation?.kind === "delete") {
                      confirmDeleteSaved(confirmation.project);
                    } else {
                      confirmStartOver();
                    }
                  }}
                >
                  {confirmation?.kind === "delete" ? "Delete project" : "Start over"}
                </Button>
              </AlertDialogPrimitive.Action>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    </div>
  );
}
