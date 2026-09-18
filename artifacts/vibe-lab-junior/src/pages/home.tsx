import React, { useState } from 'react';
import { 
  Project, 
  useGenerateProject, 
  ProjectGenerationRequestAction 
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ProjectViewer } from '@/components/project-viewer';
import { LearningExplanation } from '@/components/learning-notes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Info, RefreshCw, Lightbulb, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EXAMPLES = [
  "A game where a cat catches stars",
  "A quiz about ocean animals",
  "A space button that makes planets move"
];

type UpdateAction = Exclude<
  typeof ProjectGenerationRequestAction[keyof typeof ProjectGenerationRequestAction],
  'create'
>;

const UPDATE_COPY: Record<UpdateAction, { title: string; prompt: string; emoji: string }> = {
  add: {
    title: 'Add something',
    prompt: 'What should we add?',
    emoji: '➕',
  },
  change: {
    title: 'Change something',
    prompt: 'What should we change?',
    emoji: '🎨',
  },
  fix: {
    title: 'Fix something',
    prompt: 'What is not working yet?',
    emoji: '🔧',
  },
};

const LOADING_MESSAGES = [
  "Gathering pixels...",
  "Teaching computers to be fun...",
  "Mixing the colors...",
  "Sprinkling some magic dust...",
  "Waking up the hamsters...",
  "Almost there!"
];

const LOGO_URL = `${import.meta.env.BASE_URL}logo-vlj.png`;

export default function Home() {
  const { toast } = useToast();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [idea, setIdea] = useState("");
  const [updateIdea, setUpdateIdea] = useState("");
  const [selectedAction, setSelectedAction] = useState<UpdateAction | null>(null);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
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

  // Cycle loading messages
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !currentProject) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, currentProject]);

  const handleCreate = () => {
    if (!idea.trim()) return;
    
    generateProject.mutate({
      data: {
        action: ProjectGenerationRequestAction.create,
        idea,
      }
    }, {
      onSuccess: (res) => {
        setCurrentProject(res.project);
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
          description: "I couldn’t make that project yet. Try saying it another way.",
        });
      }
    });
  };

  const handleUpdate = (action: UpdateAction, updateIdea: string) => {
    if (!updateIdea.trim() || !currentProject) return;

    generateProject.mutate({
      data: {
        action,
        idea: updateIdea,
        currentProject,
      }
    }, {
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
          description: "I couldn’t make that update yet. Try saying it another way.",
        });
      }
    });
  };

  const startOver = () => {
    if (window.confirm("Are you sure you want to start a new project? This one will be lost!")) {
      setCurrentProject(null);
      setIdea("");
      setUpdateIdea("");
      setSelectedAction(null);
      setExplanationVisible(false);
    }
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
            className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full"
          >
            <div className="text-center space-y-4 mb-10">
              <h1>
                <img
                  src={LOGO_URL}
                  alt="Vibe Lab Junior"
                  className="w-full max-w-[520px] h-auto mx-auto"
                  data-testid="img-brand-logo"
                />
              </h1>
              <p className="text-xl md:text-2xl text-foreground/70 font-medium">
                Turn your ideas into tiny, playable projects.
              </p>
            </div>

            <div className="w-full bg-card rounded-[2rem] shadow-xl p-6 md:p-8 border-4 border-white relative">
              <label htmlFor="idea" className="block text-2xl font-bold text-foreground mb-4">
                What should we make?
              </label>
              <Textarea 
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="A piano you can play with your mouse..."
                className="text-xl p-6 mb-6 rounded-2xl border-4"
                data-testid="input-idea"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
              <Button 
                size="lg" 
                className="w-full h-16 text-2xl rounded-2xl shadow-md"
                onClick={handleCreate}
                disabled={!idea.trim() || isGenerating}
                data-testid="button-make-it"
              >
                <Wand2 className="w-8 h-8 mr-2" />
                ✨ Make it
              </Button>

              <div className="mt-8 pt-8 border-t-2 border-border/50">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Need inspiration? Try these:
                </p>
                <div className="flex flex-col gap-3">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setIdea(ex)}
                      className="text-left bg-muted/30 hover:bg-accent/20 hover:text-accent-foreground text-foreground font-medium p-4 rounded-xl transition-colors border-2 border-transparent hover:border-accent/30"
                      data-testid={`example-${i}`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="mt-12 text-sm font-medium text-muted-foreground text-center flex items-center justify-center gap-2">
              <Info className="w-4 h-4" />
              Your idea is sent to the app’s helper to make your project. Nothing is saved permanently.
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
            data-testid="full-screen-loading"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-primary/20 flex items-center justify-center relative z-10 animate-bounce">
                <Wand2 className="w-16 h-16 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="mt-12 text-3xl font-bold text-foreground">
              {LOADING_MESSAGES[loadingStep]}
            </h2>
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-primary" style={{ animation: `bounce 1s infinite ${i * 0.2}s` }} />
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
            <header className="flex-none p-4 md:px-6 bg-white border-b-2 border-border shadow-sm flex items-center justify-between z-20">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={LOGO_URL}
                  alt=""
                  className="h-9 sm:h-11 w-auto max-w-[180px] object-contain object-left"
                  data-testid="img-header-logo"
                />
                <div>
                  <h1 className="hidden md:block text-xl font-bold text-foreground leading-tight truncate">{currentProject.title}</h1>
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
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => setExplanationVisible(true)}
                  className="font-bold rounded-xl"
                  data-testid="button-see-how"
                >
                  <Lightbulb className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">See how it works</span>
                </Button>
              </div>
            </header>

            <main className="flex-1 relative p-4 md:p-6 bg-muted/30 overflow-hidden flex flex-col md:flex-row gap-6">
              
              {/* Project display */}
              <div className="flex-1 h-full min-h-[40vh] md:min-h-0 relative">
                <ProjectViewer 
                  project={currentProject} 
                  isUpdating={isGenerating} 
                />
              </div>

              {/* Toolbar */}
              <div className="flex-none w-full md:w-80 lg:w-96 flex flex-col gap-4 bg-white p-5 rounded-3xl border-4 border-border shadow-md">
                {!selectedAction ? (
                  <>
                    <h2 className="text-lg font-bold text-foreground">What next?</h2>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {(Object.keys(UPDATE_COPY) as UpdateAction[]).map((action) => (
                        <Button
                          key={action}
                          variant={action === 'change' ? 'accent' : action === 'fix' ? 'outline' : 'default'}
                          className="w-full justify-start rounded-xl font-bold"
                          onClick={() => setSelectedAction(action)}
                          disabled={isGenerating}
                          data-testid={`button-${action}`}
                        >
                          <span className="mr-3 text-lg" aria-hidden="true">{UPDATE_COPY[action].emoji}</span>
                          {UPDATE_COPY[action].title}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setSelectedAction(null);
                        setUpdateIdea('');
                      }}
                      data-testid="button-back-actions"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Pick another action
                    </button>
                    <div>
                      <p className="text-sm font-bold text-primary mb-1">
                        {UPDATE_COPY[selectedAction].emoji} {UPDATE_COPY[selectedAction].title}
                      </p>
                      <label htmlFor="update-idea" className="text-lg font-bold text-foreground">
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
            <AnimatePresence>
              {explanationVisible && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setExplanationVisible(false)}
                  />
                  <LearningExplanation 
                    project={currentProject} 
                    onClose={() => setExplanationVisible(false)} 
                  />
                </>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
