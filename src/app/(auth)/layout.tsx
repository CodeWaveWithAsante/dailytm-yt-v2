import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { Logo, LogoMark } from "@/components/marketing/logo";

const TASKS = [
  {
    title: "Draft the Q1 roadmap",
    tag: "Planning",
    color: "bg-project-violet",
  },
  { title: "Review onboarding flow", tag: "Design", color: "bg-project-teal" },
  {
    title: "Ship billing webhooks",
    tag: "Engineering",
    color: "bg-project-amber",
  },
];

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Brand panel — fixed dark indigo in both themes, see `--brand-panel`. */}
      <aside className="bg-brand-panel text-brand-panel-foreground relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 size-[32rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.62_0.17_277/0.55),transparent)] blur-2xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(to_right,var(--brand-panel-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--brand-panel-line)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_30%_40%,#000,transparent_70%)] opacity-60"
        />

        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-2 font-semibold tracking-[var(--tracking-heading)] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none rounded-md"
        >
          <LogoMark />
          DailyTM
        </Link>

        <div className="relative max-w-md">
          {/* A loop of tasks being ticked off — the product's one promise. */}
          <div aria-hidden className="mb-12 space-y-2.5">
            {TASKS.map((task, index) => (
              <div
                key={task.title}
                style={{ "--i": index } as CSSProperties}
                className="auth-task flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
              >
                <span className="auth-check grid size-5 place-items-center rounded-full border border-white/30">
                  <CheckIcon className="size-3" strokeWidth={3} />
                </span>
                <span className="auth-title flex-1 text-sm">{task.title}</span>
                <span className="text-brand-panel-muted flex items-center gap-1.5 text-xs">
                  <span className={`size-1.5 rounded-full ${task.color}`} />
                  {task.tag}
                </span>
              </div>
            ))}
          </div>

          <h2 className="text-4xl leading-[1.1] font-semibold tracking-[var(--tracking-display)] text-balance">
            Your day, in focus.
          </h2>
          <p className="text-brand-panel-muted mt-4 text-base leading-relaxed text-pretty">
            Boards, lists and a dashboard that stay in sync — so the whole team
            knows what matters today, and what can wait.
          </p>
        </div>

        <p className="text-brand-panel-muted relative text-sm">
          © {new Date().getFullYear()} DailyTM
        </p>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
