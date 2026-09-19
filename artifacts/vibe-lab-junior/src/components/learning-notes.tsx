import React from 'react';
import { Project } from '@workspace/api-client-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, Code, Lightbulb, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface LearningExplanationProps {
  project: Project;
}

export function LearningExplanation({ project }: LearningExplanationProps) {
  const [expandedCode, setExpandedCode] = React.useState<boolean>(false);

  return (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-3 sm:inset-4 md:inset-y-6 md:left-auto md:right-6 md:w-[min(520px,calc(100vw-3rem))] bg-card rounded-3xl shadow-xl border-4 border-card-border z-50 flex min-h-0 flex-col overflow-hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          data-testid="learning-explanation-modal"
          aria-labelledby="how-it-works-title"
          aria-describedby="how-it-works-summary"
        >
          <div className="flex-none bg-accent/20 p-4 border-b border-accent/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-accent text-accent-foreground p-2 rounded-full">
                <Lightbulb className="w-6 h-6" />
              </div>
              <DialogPrimitive.Title id="how-it-works-title" className="text-xl font-bold text-foreground">
                How it works
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent/30 text-foreground"
                data-testid="button-close-explanation"
                aria-label="Close how it works"
              >
                <X className="w-6 h-6" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-6 p-5 sm:p-6 pr-7">
              <DialogPrimitive.Description id="how-it-works-summary" className="text-lg text-foreground font-medium">
                {project.summary}
              </DialogPrimitive.Description>
          
              <div className="space-y-4">
                {project.learningNotes.map((note, index) => (
                  <div key={index} className="bg-card border-2 border-border p-4 rounded-2xl" data-testid={`learning-note-${index}`}>
                    <h3 className="font-bold text-primary flex items-center gap-2 text-lg mb-2">
                      <Sparkles className="w-5 h-5" />
                      {note.label}
                    </h3>
                    <p className="text-foreground/80 font-medium">
                      {note.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-border/50">
                <button
                  onClick={() => setExpandedCode(!expandedCode)}
                  className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors text-left"
                  data-testid="button-toggle-code"
                  aria-expanded={expandedCode}
                  aria-controls="code-sections"
                >
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Code className="w-5 h-5 text-secondary" />
                    Peek at the Code
                  </span>
                  <ChevronDown className={`w-5 h-5 text-foreground transition-transform duration-300 ${expandedCode ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {expandedCode && (
                    <motion.div
                      id="code-sections"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 space-y-4"
                      data-testid="code-sections"
                    >
                      <CodeSection title="HTML (The Structure)" code={project.html} language="html" />
                      <CodeSection title="CSS (The Style)" code={project.css} language="css" />
                      <CodeSection title="JavaScript (The Action)" code={project.js} language="javascript" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function CodeSection({ title, code, language }: { title: string, code: string, language: string }) {
  if (!code || code.trim() === '') return null;
  
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="bg-muted px-4 py-2 font-bold text-sm text-muted-foreground">
        {title}
      </div>
      <pre className="bg-[#1e1e24] p-4 overflow-x-auto text-sm text-[#d4d4d4] font-mono leading-relaxed" data-testid={`code-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
