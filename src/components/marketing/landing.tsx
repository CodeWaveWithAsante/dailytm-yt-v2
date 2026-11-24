import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  FolderKanbanIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  LockIcon,
  MousePointer2Icon,
  PanelRightOpenIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LandingEffects } from "./landing-effects";
import { Logo, LogoMark } from "./logo";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Landing({ signedIn }: { signedIn: boolean }) {
  const primaryHref = signedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = signedIn ? "Open DailyTM" : "Start for free";

  return (
    // The marketing site is dark in both themes — it is a printed surface,
    // like the auth brand panel, not a preference-driven app screen.
    <div className="dark bg-background text-foreground relative isolate min-h-svh overflow-x-clip">
      <LandingEffects />

      <Nav signedIn={signedIn} />

      <main>
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="relative px-5 pt-20 pb-10 sm:pt-28">
          <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
          <div
            aria-hidden
            className="absolute top-[-12rem] left-1/2 -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.16_277/0.35),transparent)] blur-2xl"
          />

          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Link
              href={primaryHref}
              data-reveal
              className="shine-border group text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="bg-primary/15 text-accent-foreground rounded-full px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase">
                New
              </span>
              Board and list views, with a details sheet
              <ChevronRightIcon
                aria-hidden
                className="size-3.5 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
              />
            </Link>

            <h1
              data-reveal
              style={delay(80)}
              className="mt-6 bg-linear-to-b from-white via-white to-white/55 bg-clip-text text-5xl leading-[1.04] font-semibold tracking-[var(--tracking-display)] text-balance text-transparent sm:text-7xl"
            >
              Plan the day.
              <br />
              Ship the work.
            </h1>

            <p
              data-reveal
              style={delay(160)}
              className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed text-pretty sm:text-lg"
            >
              DailyTM is the calm, fast task manager for individuals and teams.
              Custom workflows, boards and lists that stay in sync, and a
              dashboard that tells you what is slipping before it slips.
            </p>

            <div
              data-reveal
              style={delay(240)}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
            >
              <Button asChild size="lg" className="group h-11 px-5">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRightIcon
                    aria-hidden
                    className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
              {signedIn ? null : (
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground h-11 px-5"
                >
                  <Link href="/sign-in">I already have an account</Link>
                </Button>
              )}
            </div>
          </div>

          <div
            data-reveal
            style={delay(360)}
            className="mx-auto mt-16 max-w-6xl sm:mt-20"
          >
            <div className="hero-tilt">
              <ProductMock />
            </div>
          </div>
        </section>

        {/* ─── Built for strip ─────────────────────────────────── */}
        <section
          aria-label="Who it is for"
          className="border-border/60 mx-auto max-w-6xl border-y px-5 py-8"
        >
          <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <span className="text-foreground/80 font-medium">Built for</span>
            {[
              "Solo makers",
              "Product teams",
              "Engineering",
              "Design studios",
              "Agencies",
              "Operations",
            ].map((label, index) => (
              <span
                key={label}
                data-reveal
                style={delay(index * 60)}
                className="inline-flex items-center gap-2"
              >
                <span className="bg-primary/70 size-1 rounded-full" />
                {label}
              </span>
            ))}
          </p>
        </section>

        {/* ─── Features ────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-20 px-5 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Features"
              title="Everything a task needs. Nothing it doesn't."
              description="The pieces you reach for every day, designed to get out of the way the moment you are done with them."
            />

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <FeatureCard
                className="md:col-span-2"
                index={0}
                Icon={WorkflowIcon}
                title="Your workflow, your columns"
                description="Name, colour and order the statuses your team actually uses. Drag a card across the board and the list, dashboard and project progress follow."
              >
                <MiniBoard />
              </FeatureCard>

              <FeatureCard
                index={1}
                Icon={PanelRightOpenIcon}
                title="Every detail, one click away"
                description="Open any task in a side sheet without losing your place. Edit status, priority, assignee and dates inline."
              >
                <MiniSheet />
              </FeatureCard>

              <FeatureCard
                index={2}
                Icon={UsersIcon}
                title="Roles that make sense"
                description="Owners, admins, members and viewers — each sees and does exactly what they should."
              >
                <MiniRoles />
              </FeatureCard>

              <FeatureCard
                index={3}
                Icon={LockIcon}
                title="Private when it needs to be"
                description="Open projects for the whole organization, restricted ones for the people you add."
              >
                <MiniVisibility />
              </FeatureCard>

              <FeatureCard
                index={4}
                Icon={TrendingUpIcon}
                title="Know what's slipping"
                description="A dashboard of what is open, due, overdue and done — per person and per project."
              >
                <MiniChart />
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* ─── How it works ────────────────────────────────────── */}
        <section
          id="workflow"
          className="border-border/60 scroll-mt-20 border-t px-5 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="How it works"
              title="From sign-up to shipping in three steps"
            />

            <ol
              data-reveal
              className="relative mt-16 grid gap-10 md:grid-cols-3"
            >
              <span
                aria-hidden
                className="draw-line via-primary/60 absolute top-5 right-[16%] left-[16%] hidden h-px bg-linear-to-r from-transparent to-transparent md:block"
              />
              {[
                {
                  Icon: LayoutDashboardIcon,
                  title: "Create your organization",
                  body: "Everything lives inside one — projects, tasks and the people you share them with. A General project is ready on day one.",
                },
                {
                  Icon: FolderKanbanIcon,
                  title: "Shape your projects",
                  body: "Pick a colour and icon, set visibility, and tune the workflow columns until they match how work really moves.",
                },
                {
                  Icon: CheckIcon,
                  title: "Plan, track, ship",
                  body: "Capture tasks in seconds, move them across the board, and let the dashboard keep score.",
                },
              ].map(({ Icon, title, body }, index) => (
                <li
                  key={title}
                  className="relative flex flex-col items-center text-center"
                >
                  <span className="bg-background ring-border text-accent-foreground relative grid size-10 place-items-center rounded-full ring-1">
                    <Icon aria-hidden className="size-4" />
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 grid size-4 place-items-center rounded-full font-mono text-[9px] font-semibold">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 text-base font-medium">{title}</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────── */}
        <section className="px-5 pb-24 sm:pb-32">
          <div
            data-reveal
            className="spotlight border-border bg-card relative mx-auto max-w-6xl overflow-hidden rounded-3xl border px-6 py-16 text-center sm:py-24"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 -bottom-40 -z-10 mx-auto h-80 w-[48rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.16_277/0.4),transparent)] blur-2xl"
            />
            <LogoMark className="animate-float mx-auto size-12" />
            <h2 className="mx-auto mt-8 max-w-2xl text-3xl font-semibold tracking-[var(--tracking-display)] text-balance sm:text-5xl">
              Your team&apos;s day, finally in one place.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md text-pretty">
              Free to start. Bring your team when you are ready.
            </p>
            <Button asChild size="lg" className="group mt-9 h-11 px-6">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-border/60 border-t px-5 py-10">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <Logo className="text-foreground" />
          <p>© {new Date().getFullYear()} DailyTM. Plan the day.</p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link
              className="hover:text-foreground transition-colors"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="hover:text-foreground transition-colors"
              href="/sign-up"
            >
              Create account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Nav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="nav-scrolled bg-background/70 sticky top-0 z-40 border-b border-transparent backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Logo />
        <nav
          aria-label="Primary"
          className="text-muted-foreground hidden items-center gap-6 text-sm md:flex"
        >
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="hover:text-foreground transition-colors"
          >
            How it works
          </a>
        </nav>
        <span className="flex-1" />
        {signedIn ? (
          <Button asChild size="sm">
            <Link href="/dashboard">Open app</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div data-reveal className="mx-auto max-w-2xl text-center">
      <p className="text-accent-foreground font-mono text-xs tracking-[0.2em] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[var(--tracking-display)] text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-5 text-base leading-relaxed text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function FeatureCard({
  Icon,
  title,
  description,
  children,
  className,
  index,
}: {
  Icon: typeof WorkflowIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  index: number;
}) {
  return (
    <article
      data-reveal
      style={delay((index % 3) * 90)}
      className={cn(
        "spotlight group border-border bg-card/60 hover:border-foreground/15 flex flex-col overflow-hidden rounded-2xl border transition-colors duration-(--duration-normal)",
        className,
      )}
    >
      <div
        aria-hidden
        className="relative flex h-52 items-center justify-center overflow-hidden px-6 pt-6 [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
      >
        {children}
      </div>
      <div className="p-6 pt-2">
        <h3 className="flex items-center gap-2 font-medium">
          <Icon aria-hidden className="text-accent-foreground size-4" />
          {title}
        </h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}

/* ─── Product mock ────────────────────────────────────────────────────────
   HTML rather than a screenshot: it stays sharp at every density, follows the
   tokens, and costs no image bytes. Purely decorative, so hidden from AT. */

const MOCK_ROWS = [
  {
    title: "Finalize launch checklist",
    status: "progress",
    pri: 3,
    due: "Today",
    who: "AK",
  },
  {
    title: "Review onboarding copy",
    status: "progress",
    pri: 2,
    due: "Nov 26",
    who: "MJ",
  },
  {
    title: "Migrate billing webhooks",
    status: "todo",
    pri: 3,
    due: "Nov 28",
    who: "SR",
  },
  {
    title: "Design empty states",
    status: "todo",
    pri: 1,
    due: "Dec 2",
    who: "LT",
  },
  {
    title: "Write release notes",
    status: "todo",
    pri: 2,
    due: "Dec 3",
    who: "AK",
  },
  {
    title: "Set up status page",
    status: "done",
    pri: 1,
    due: "Nov 20",
    who: "MJ",
  },
] as const;

function StatusIcon({ status }: { status: "todo" | "progress" | "done" }) {
  if (status === "done")
    return <CheckIcon className="text-project-indigo size-3.5" />;
  if (status === "progress")
    return <CircleDotIcon className="text-project-amber size-3.5" />;
  return <CircleIcon className="text-muted-foreground size-3.5" />;
}

function Bars({ level }: { level: number }) {
  return (
    <span className="flex items-end gap-px">
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-[3px] rounded-[1px] bg-current",
            bar === 1 && "h-1.5",
            bar === 2 && "h-2",
            bar === 3 && "h-2.5",
            bar > level && "opacity-25",
          )}
        />
      ))}
    </span>
  );
}

function ProductMock() {
  return (
    <div
      aria-hidden
      className="border-border bg-card relative overflow-hidden rounded-xl border shadow-[0_40px_120px_-30px_oklch(0.55_0.16_277/0.45)] sm:rounded-2xl"
    >
      <div className="from-primary/50 absolute inset-x-0 top-0 h-px bg-linear-to-r via-white/40 to-transparent" />
      <div className="grid grid-cols-[13rem_1fr] text-[13px] max-md:grid-cols-1">
        {/* Sidebar */}
        <div className="bg-sidebar border-border hidden flex-col gap-1 border-r p-3 md:flex">
          <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
            <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded text-[10px] font-semibold">
              N
            </span>
            <span className="font-medium">Northstar</span>
          </div>
          {[
            { Icon: LayoutDashboardIcon, label: "Dashboard" },
            { Icon: FolderKanbanIcon, label: "Projects", active: true },
          ].map(({ Icon, label, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </span>
          ))}
          <span className="text-muted-foreground mt-4 px-2 text-[11px]">
            Your projects
          </span>
          {[
            ["bg-project-indigo", "Website relaunch"],
            ["bg-project-teal", "Mobile app"],
            ["bg-project-rose", "Q1 marketing"],
          ].map(([color, name]) => (
            <span
              key={name}
              className="text-muted-foreground flex items-center gap-2 px-2 py-1"
            >
              <span className={cn("size-2 rounded-sm", color)} />
              {name}
            </span>
          ))}
        </div>

        {/* Main */}
        <div className="relative min-w-0">
          <div className="border-border flex h-11 items-center gap-3 border-b px-4">
            <span className="bg-project-indigo/15 text-project-indigo grid size-5 place-items-center rounded">
              <GlobeIcon className="size-3" />
            </span>
            <span className="font-medium">Website relaunch</span>
            <span className="bg-muted ml-2 hidden rounded-md p-0.5 sm:flex">
              <span className="text-muted-foreground rounded px-2 py-0.5">
                Board
              </span>
              <span className="bg-background rounded px-2 py-0.5 shadow-xs">
                List
              </span>
            </span>
            <span className="flex-1" />
            <span className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-[11px] font-medium">
              New task
            </span>
          </div>

          {(["progress", "todo", "done"] as const).map((group) => {
            const rows = MOCK_ROWS.filter((row) => row.status === group);
            const label = {
              progress: "In progress",
              todo: "Todo",
              done: "Done",
            }[group];
            return (
              <div key={group}>
                <div className="bg-muted/40 text-muted-foreground border-border flex items-center gap-2 border-b px-4 py-1.5 text-[11px]">
                  <StatusIcon status={group} />
                  <span className="text-foreground/90 font-medium">
                    {label}
                  </span>
                  <span className="tabular-nums">{rows.length}</span>
                </div>
                {rows.map((row, index) => (
                  <div
                    key={row.title}
                    className={cn(
                      "border-border/60 flex h-10 items-center gap-3 border-b px-4",
                      group === "progress" && index === 0 && "bg-accent/40",
                    )}
                  >
                    <span
                      className={cn(
                        row.pri === 3
                          ? "text-warning"
                          : row.pri === 2
                            ? "text-info"
                            : "text-muted-foreground",
                      )}
                    >
                      <Bars level={row.pri} />
                    </span>
                    {group === "todo" && index === 0 ? (
                      <span className="status-cycle grid w-3.5 place-items-center">
                        <CircleIcon className="text-muted-foreground size-3.5" />
                        <CircleDotIcon className="text-project-amber size-3.5" />
                        <CheckIcon className="text-project-indigo size-3.5" />
                      </span>
                    ) : (
                      <StatusIcon status={group} />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        group === "done" &&
                          "text-muted-foreground line-through decoration-1",
                      )}
                    >
                      {row.title}
                    </span>
                    <span
                      className={cn(
                        "hidden items-center gap-1 text-[11px] sm:flex",
                        row.due === "Today"
                          ? "text-warning"
                          : "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="size-3" />
                      {row.due}
                    </span>
                    <span className="bg-secondary text-secondary-foreground grid size-5 place-items-center rounded-full text-[9px] font-medium">
                      {row.who}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Details sheet peeking in */}
          <div className="border-border bg-popover absolute top-14 right-3 bottom-3 hidden w-64 flex-col gap-3 rounded-lg border p-4 shadow-2xl lg:flex">
            <span className="text-muted-foreground text-[11px]">
              Website relaunch
            </span>
            <span className="text-sm font-medium">
              Finalize launch checklist
            </span>
            <div className="grid grid-cols-[5rem_1fr] gap-y-2.5 text-[12px]">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5">
                <CircleDotIcon className="text-project-amber size-3.5" /> In
                progress
              </span>
              <span className="text-muted-foreground">Priority</span>
              <span className="text-warning flex items-center gap-1.5">
                <Bars level={3} /> High
              </span>
              <span className="text-muted-foreground">Assignee</span>
              <span>Ama K.</span>
              <span className="text-muted-foreground">Due</span>
              <span className="text-warning">Today</span>
            </div>
            <div className="bg-border h-px" />
            <span className="text-muted-foreground text-[12px] leading-relaxed">
              Walk the checklist with design and QA, then flip the DNS.
            </span>
            <div className="mt-auto space-y-1.5">
              {["QA sign-off", "Copy review", "DNS cut-over"].map(
                (item, index) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    {index < 2 ? (
                      <CheckIcon className="text-success size-3.5" />
                    ) : (
                      <CircleDashedIcon className="text-muted-foreground size-3.5" />
                    )}
                    <span
                      className={
                        index < 2 ? "text-muted-foreground line-through" : ""
                      }
                    >
                      {item}
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>

          <MousePointer2Icon className="demo-cursor fill-foreground text-background absolute right-[22rem] bottom-16 hidden size-5 drop-shadow lg:block" />
        </div>
      </div>
    </div>
  );
}

/* ─── Feature visuals ─────────────────────────────────────────────────── */

function MiniBoard() {
  const columns = [
    {
      name: "Todo",
      color: "bg-project-slate",
      cards: ["Audit nav links", "Pricing FAQ"],
    },
    {
      name: "In progress",
      color: "bg-project-amber",
      cards: ["Hero animation", "Signup flow"],
    },
    { name: "Review", color: "bg-project-violet", cards: ["Footer links"] },
    { name: "Done", color: "bg-project-green", cards: ["Brand colours"] },
  ];
  return (
    <div className="grid w-full max-w-xl grid-cols-4 gap-2.5">
      {columns.map((column, columnIndex) => (
        <div key={column.name} className="bg-muted/40 rounded-lg p-2">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px]">
            <span className={cn("size-1.5 rounded-full", column.color)} />
            {column.name}
          </div>
          <div className="space-y-1.5">
            {column.cards.map((card, cardIndex) => (
              <div
                key={card}
                className={cn(
                  "border-border bg-card rounded-md border p-2 text-[10px] leading-snug shadow-xs transition-transform duration-(--duration-slow) ease-(--ease-out-quart)",
                  columnIndex === 1 &&
                    cardIndex === 0 &&
                    "border-primary/40 group-hover:translate-x-[calc(100%+0.625rem)] group-hover:-rotate-2 group-hover:shadow-lg",
                )}
              >
                {card}
                <div className="bg-muted mt-1.5 h-1 w-2/3 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniSheet() {
  return (
    <div className="relative h-full w-full max-w-64">
      <div className="border-border bg-muted/30 absolute inset-x-0 top-4 space-y-2 rounded-lg border p-3">
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="bg-muted h-2 rounded-full"
            style={{ width: `${90 - row * 15}%` }}
          />
        ))}
      </div>
      <div className="border-border bg-popover absolute top-0 right-0 bottom-0 w-3/5 translate-x-4 space-y-2.5 rounded-lg border p-3 shadow-xl transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:translate-x-0">
        <div className="bg-foreground/80 h-2 w-4/5 rounded-full" />
        {["bg-project-amber", "bg-warning", "bg-project-teal"].map((color) => (
          <div key={color} className="flex items-center gap-2">
            <span className="bg-muted h-1.5 w-8 rounded-full" />
            <span className={cn("h-1.5 w-12 rounded-full", color)} />
          </div>
        ))}
        <div className="bg-muted h-1.5 w-full rounded-full" />
        <div className="bg-muted h-1.5 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

function MiniRoles() {
  const roles = [
    ["Owner", "bg-project-indigo", "AK"],
    ["Admin", "bg-project-teal", "MJ"],
    ["Member", "bg-project-amber", "SR"],
    ["Viewer", "bg-project-slate", "LT"],
  ];
  return (
    <div className="w-full max-w-56 space-y-2">
      {roles.map(([role, color, who], index) => (
        <div
          key={role}
          className="border-border bg-card flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-xs transition-transform duration-(--duration-normal) group-hover:translate-x-1"
          style={{ transitionDelay: `${index * 40}ms` }}
        >
          <span
            className={cn(
              "grid size-5 place-items-center rounded-full text-[9px] font-medium text-white",
              color,
            )}
          >
            {who}
          </span>
          <span className="flex-1">{role}</span>
          <ShieldCheckIcon className="text-muted-foreground size-3.5" />
        </div>
      ))}
    </div>
  );
}

function MiniVisibility() {
  return (
    <div className="w-full max-w-56 space-y-2.5">
      <div className="border-border bg-card flex items-center gap-2.5 rounded-lg border p-2.5 text-xs">
        <GlobeIcon className="text-project-teal size-4" />
        <span className="flex-1">
          Open
          <span className="text-muted-foreground block text-[10px]">
            Everyone in the org
          </span>
        </span>
      </div>
      <div className="border-primary/40 bg-card flex items-center gap-2.5 rounded-lg border p-2.5 text-xs shadow-[0_0_0_4px_oklch(0.55_0.16_277/0.12)]">
        <LockIcon className="text-accent-foreground size-4 transition-transform duration-(--duration-normal) group-hover:-rotate-12" />
        <span className="flex-1">
          Restricted
          <span className="text-muted-foreground block text-[10px]">
            Only people you add
          </span>
        </span>
        <CheckIcon className="text-accent-foreground size-3.5" />
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [8, 12, 10, 16, 14, 22, 19, 26, 24, 31];
  const max = 34;
  const path = points
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${(index / (points.length - 1)) * 200},${80 - (value / max) * 80}`,
    )
    .join(" ");
  return (
    <div className="w-full max-w-60">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">31</span>
        <span className="text-success text-xs">+24% this week</span>
      </div>
      <svg viewBox="0 0 200 80" className="h-20 w-full overflow-visible">
        <defs>
          <linearGradient id="mini-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--chart-1)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L200,80 L0,80 Z`} fill="url(#mini-area)" />
        <path
          d={path}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
