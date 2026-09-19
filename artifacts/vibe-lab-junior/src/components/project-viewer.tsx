import React, { useRef, useEffect, useState } from 'react';
import { Project } from '@workspace/api-client-react';

interface ProjectViewerProps {
  project: Project;
  isUpdating?: boolean;
}

export function ProjectViewer({ project, isUpdating }: ProjectViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const getSrcDoc = (p: Project) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none';">
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            ${p.css}
          </style>
        </head>
        <body>
          ${p.html}
          <script>
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              console.error('Project Error: ', msg, error);
              return false;
            };
            try {
              ${p.js}
            } catch (e) {
              console.error('Project JS Error:', e);
            }
          </script>
        </body>
      </html>
    `;
  };

  useEffect(() => {
    setLoading(true);
  }, [project]);

  return (
    <div 
      className="relative w-full h-full bg-white rounded-3xl overflow-hidden border-2 border-white shadow-[0px_6px_18px_rgba(35,50,80,0.09)] isolate"
      aria-busy={loading || isUpdating}
      data-testid="project-viewer-container"
    >
      <iframe
        ref={iframeRef}
        title={project.title}
        srcDoc={getSrcDoc(project)}
        sandbox="allow-scripts"
        className="w-full h-full border-0 bg-white"
        onLoad={() => setLoading(false)}
        data-testid="project-iframe"
      />

      {loading && !isUpdating && (
        <div
          className="absolute inset-0 bg-card flex flex-col items-center justify-center gap-3"
          role="status"
          aria-live="polite"
          data-testid="project-loading-state"
        >
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
          <p className="text-sm font-semibold text-muted-foreground">Opening your project…</p>
        </div>
      )}
      
      {isUpdating && (
        <div 
          className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in duration-300"
          role="status"
          aria-live="polite"
          data-testid="project-updating-overlay"
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold text-foreground bg-white/80 px-6 py-2 rounded-full shadow-sm">
            Updating magic...
          </p>
        </div>
      )}
    </div>
  );
}
