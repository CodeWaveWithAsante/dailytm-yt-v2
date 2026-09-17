import { requireActiveOrganization } from "@/lib/authentication";
import React from "react";
import * as projectService from "@/server/services/project.service";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/app-header";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ProjectWorkspace } from "@/components/project/prohect-workspace";
import { nextCursor } from "@/lib/task.queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SettingsIcon } from "lucide-react";

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

  prefetch(
    trpc.task.list.infiniteQueryOptions({}, { getNextPageParam: nextCursor }),
  );

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

      <div className="flex min-h-0 flex-1 flex-col ">
        <HydrateClient>
          <ProjectWorkspace projectId={projectId} />
        </HydrateClient>
      </div>
    </>
  );
};

export default ProjectDetailsPage;
