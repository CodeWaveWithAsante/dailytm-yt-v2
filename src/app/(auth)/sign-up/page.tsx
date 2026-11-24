import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  redirectIfSignedIn,
  safeNext,
  socialProviders,
} from "@/lib/authentication";

export const metadata: Metadata = { title: "Create account · DailyTM" };

const SignUpPage = async ({ searchParams }: PageProps<"/sign-up">) => {
  const { next } = await searchParams;
  await redirectIfSignedIn(next);

  return <SignUpForm next={safeNext(next)} providers={socialProviders()} />;
};

export default SignUpPage;
