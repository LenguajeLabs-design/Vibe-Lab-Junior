import { FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedProject } from "@/lib/saved-projects";

interface SavedProjectsProps {
  projects: SavedProject[];
  onOpen: (project: SavedProject) => void;
  onDelete: (project: SavedProject) => void;
}

function formatSavedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function SavedProjects({
  projects,
  onOpen,
  onDelete,
}: SavedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="w-full mt-8" aria-labelledby="saved-projects-title">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2
            id="saved-projects-title"
            className="text-xl font-bold text-foreground"
          >
            My saved projects
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Saved only on this device. Nothing is uploaded.
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2"
        data-testid="saved-projects-list"
      >
        {projects.map((project) => (
          <article
            key={project.id}
            className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col gap-3"
            data-testid={`saved-project-${project.id}`}
          >
            <div className="min-w-0">
              <h3
                className="font-bold text-foreground truncate"
                title={project.title}
              >
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Saved {formatSavedDate(project.updatedAt)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={() => onOpen(project)}
                data-testid={`button-open-saved-${project.id}`}
              >
                <FolderOpen aria-hidden="true" />
                Open
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label={`Delete ${project.title}`}
                onClick={() => onDelete(project)}
                data-testid={`button-delete-saved-${project.id}`}
              >
                <Trash2 aria-hidden="true" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
