import "server-only";

import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";
import { OrgContext } from "./validations/auth";
import * as organizationService from "@/server/services/organization";
import { cache } from "react";
import { resolveOrgContext } from "./authz";

/** One session read per request, however many layouts and pages ask. */
export const getSession = cache(async function getSession() {
  return auth.api.getSession({ headers: await headers() });
});

/** Only same-origin paths, so `?next=` cannot bounce a visitor off-site. */
export function safeNext(next: string | string[] | undefined | null) {
  const value = Array.isArray(next) ? next[0] : next;
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function redirectIfSignedIn(next?: string | string[]) {
  const session = await getSession();
  if (session?.user) redirect(safeNext(next));
}

export default async function requireSession(redirectTo: string) {
  const session = await getSession();
  if (!session?.user) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    redirect("/sign-in" + next);
  }

  return session;
}

export type ActiveOrganization = {
  session: Awaited<ReturnType<typeof requireSession>>;
  organization: Awaited<ReturnType<typeof organizationService.bySlug>>;
  ctx: OrgContext;
};

/**
 * Keyed on the slug alone. The layout and the page both call this with
 * different `path`s; keying on the path too ran the body twice per request,
 * and both copies raced to switch the active organization and redirect.
 */
const activateOrganization = cache(async function activateOrganization(
  orgSlug: string,
): Promise<ActiveOrganization> {
  // Already signed in — `requireActiveOrganization` checked before calling.
  const session = (await getSession())!;
  const protectedCtx = { session, userId: session.user.id };

  const organization = await organizationService
    .bySlug(protectedCtx, { slug: orgSlug })
    .catch(() => null);

  if (!organization) notFound();

  if (session.session.activeOrganizationId !== organization.id) {
    // Persists on the session row, which is what every later request (and
    // every tRPC call) reads. No redirect: the old code redirected to an
    // `x-pathname` header nothing sets, which dumped deep links on `/{org}`.
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: organization.id },
    });
    session.session.activeOrganizationId = organization.id;
  }

  return {
    session,
    organization,
    ctx: await resolveOrgContext(protectedCtx),
  };
});

export async function requireActiveOrganization(
  orgSlug: string,
  path: string,
): Promise<ActiveOrganization> {
  await requireSession(path);
  return activateOrganization(orgSlug);
}
