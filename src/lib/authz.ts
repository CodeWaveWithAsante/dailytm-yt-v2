import "server-only";

import { TRPCError } from "@trpc/server";
import { OrgContext, ProtectedContext } from "./validations/auth";
import db from "./db";

export const AuthzCause = {
  NO_ACTIVE_ORGANIZATION: "no_active_organization",
  NOT_A_MEMBER: "not_a_member",
} as const;

export async function resolveOrgContext(
  ctx: ProtectedContext,
): Promise<OrgContext> {
  const organizationId = ctx.session.session.activeOrganizationId;

  if (!organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Select an organization to continue",
      cause: AuthzCause.NO_ACTIVE_ORGANIZATION,
    });
  }

  const member = await db.member.findFirst({
    where: { organizationId, userId: ctx.userId },
    select: {
      id: true,
      role: true,
      userId: true,
      organizationId: true,
      createdAt: true,
    },
  });

  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are no longer a member of this organization",
      cause: AuthzCause.NOT_A_MEMBER,
    });
  }

  return {
    ...ctx,
    orgId: member.organizationId,
    role: member.role,
    member,
  };
}
