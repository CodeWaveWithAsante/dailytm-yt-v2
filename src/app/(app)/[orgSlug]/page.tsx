import { Suspense } from "react";
import { AppHeader } from "@/components/app-shell/app-header";
import { Dashboard, DashboardSkeleton } from "@/components/dashboard/dashboard";
import { requireActiveOrganization } from "@/lib/authentication";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

const DashboardPage = async ({ params }: PageProps<"/[orgSlug]">) => {
  const { orgSlug } = await params;
  const { organization, session } = await requireActiveOrganization(
    orgSlug,
    `/${orgSlug}`,
  );

  prefetch(trpc.dashboard.overview.queryOptions());

  return (
    <>
      <AppHeader
        crumbs={[
          { label: organization.name, href: `/${orgSlug}` },
          { label: "Dashboard" },
        ]}
      />
      <HydrateClient>
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard orgSlug={orgSlug} userName={session.user.name} />
        </Suspense>
      </HydrateClient>
    </>
  );
};

export default DashboardPage;
