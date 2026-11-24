import requireSession from "@/lib/authentication";
import * as organizationService from "@/server/services/organization";
import { redirect } from "next/navigation";
import { MailWarningIcon } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { NewOrganization } from "@/components/organization/create-org";
import { Logo } from "@/components/marketing/logo";

export const dynamic = "force-dynamic";

const OnboardingPage = async () => {
  const session = await requireSession("/onboarding");

  const organizations = await organizationService.listForUser({
    session,
    userId: session.user.id,
  });
  if (organizations.length > 0) redirect("/dashboard");

  return (
    <div className="bg-background relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute top-[-14rem] left-1/2 -z-10 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.16_277/0.22),transparent)] blur-2xl"
      />

      <div className="animate-in fade-in-0 slide-in-from-bottom-2 w-full max-w-md duration-500">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="bg-card rounded-2xl border p-8 shadow-lg">
          <p className="text-muted-foreground mb-4 font-mono text-[11px] tracking-[0.18em] uppercase">
            Step 1 of 1 · Setup
          </p>

          {session.user.emailVerified ? (
            <AuthCard
              title="Create your organization"
              description="Everything in DailyTM lives inside an organization — projects, tasks, and the people you share them with."
            >
              <NewOrganization defaultName={session.user.name} />
            </AuthCard>
          ) : (
            <AuthCard
              title="Verify your email first"
              description={`Open the link we sent to ${session.user.email} to unlock workspace creation, then come back here.`}
            >
              <div className="border-warning/40 bg-warning/10 flex gap-3 rounded-lg border p-3 text-sm">
                <MailWarningIcon
                  className="text-warning mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                Organizations can only be created by verified accounts.
              </div>
            </AuthCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
