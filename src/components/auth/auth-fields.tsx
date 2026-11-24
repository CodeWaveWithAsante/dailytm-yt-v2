"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {visible ? (
          <EyeOffIcon className="size-4" aria-hidden />
        ) : (
          <EyeIcon className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

/** 0–4. Length and character variety; a hint, not a policy. */
export function passwordScore(value: string): number {
  if (!value) return 0;
  let score = value.length >= 8 ? 1 : 0;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const STRENGTH = [
  { label: "Too short", color: "bg-destructive" },
  { label: "Weak", color: "bg-destructive" },
  { label: "Fair", color: "bg-warning" },
  { label: "Good", color: "bg-success" },
  { label: "Strong", color: "bg-success" },
];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = passwordScore(value);
  const { label, color } = STRENGTH[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "bg-muted h-1 flex-1 rounded-full transition-colors duration-(--duration-normal)",
              step <= Math.max(score, 1) && color,
            )}
          />
        ))}
      </div>
      <span className="text-muted-foreground w-16 text-right text-xs">
        {label}
      </span>
    </div>
  );
}

export type SocialProviders = { github: boolean; google: boolean };

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.87-3A7.2 7.2 0 0 1 5.3 14.3H1.3v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.43-3.43A12 12 0 0 0 1.3 6.6l4 3.1A7.17 7.17 0 0 1 12 4.77Z"
      />
    </svg>
  );
}

export function SocialButtons({
  providers,
  callbackURL,
}: {
  providers: SocialProviders;
  callbackURL: string;
}) {
  const [pending, setPending] = useState<"github" | "google" | null>(null);
  const enabled = (["github", "google"] as const).filter((p) => providers[p]);
  if (enabled.length === 0) return null;

  async function go(provider: "github" | "google") {
    setPending(provider);
    const { error } = await authClient.signIn.social({ provider, callbackURL });
    if (error) {
      setPending(null);
      toast.error(error.message ?? "Could not reach that provider");
    }
  }

  return (
    <>
      <div className={cn("grid gap-2", enabled.length === 2 && "grid-cols-2")}>
        {enabled.map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="h-10"
            disabled={pending !== null}
            onClick={() => void go(provider)}
          >
            {pending === provider ? (
              <Spinner className="size-4" />
            ) : provider === "github" ? (
              <GitHubIcon />
            ) : (
              <GoogleIcon />
            )}
            {provider === "github" ? "GitHub" : "Google"}
          </Button>
        ))}
      </div>
      <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        or continue with email
        <span className="bg-border h-px flex-1" />
      </div>
    </>
  );
}
