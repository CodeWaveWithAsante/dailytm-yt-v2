import { requireActiveOrganization } from "@/lib/authentication";
import React from "react";
import * as projectService from "@/server/services/project.service";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/app-header";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ProjectWorkspace } from "@/components/project/prohect-workspace";
import { nextCursor } from "@/lib/task.queries";
import {
  boardViewInput,
  listViewInput,
  loadTaskViewState,
} from "@/lib/task-view-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import { ProjectGlyph } from "@/components/project/project-client";

const ProjectDetailsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { orgSlug, projectId } = await params;

  const { organization, ctx } = await requireActiveOrganization(
    orgSlug,
    `/${orgSlug}/projects/${projectId}`,
  );

  const project = await projectService
    .byId(ctx, { projectId })
    .catch(() => null);

  if (!project) notFound();

  // Same inputs the client builds from the URL, so the cache keys match and
  // the first paint is the real data rather than a skeleton.
  const viewState = await loadTaskViewState(searchParams);
  prefetch(trpc.workflow.list.queryOptions({ projectId }));
  if (viewState.view === "board") {
    prefetch(trpc.task.list.queryOptions(boardViewInput(projectId, viewState)));
  } else {
    prefetch(
      trpc.task.list.infiniteQueryOptions(
        listViewInput(projectId, viewState, { sort: "dueDate", order: "asc" }),
        { getNextPageParam: nextCursor },
      ),
    );
  }

  return (
    <>
      <AppHeader
        crumbs={[
          { label: organization.name, href: `/${orgSlug}` },
          { label: "Projects", href: `/${orgSlug}/projects` },
          { label: project.name },
        ]}

        actions={
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/${orgSlug}/projects/${projectId}/settings`}
                aria-label="Project settings"
              >
                <SettingsIcon className="size-4" aria-hidden />
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3 border-b px-4 py-4 md:px-6">
        <ProjectGlyph color={project.color} icon={project.icon} size="lg" />

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-[var(--tracking-heading)]">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground truncate text-xs">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col ">
        <HydrateClient>
          <ProjectWorkspace projectId={projectId} />
        </HydrateClient>
      </div>
    </>
  );
};

export default ProjectDetailsPage;
