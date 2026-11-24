import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  redirectIfSignedIn,
  safeNext,
  socialProviders,
} from "@/lib/authentication";

export const metadata: Metadata = { title: "Sign in · DailyTM" };

const SignInPage = async ({ searchParams }: PageProps<"/sign-in">) => {
  const { next } = await searchParams;
  await redirectIfSignedIn(next);

  return <SignInForm next={safeNext(next)} providers={socialProviders()} />;
};

export default SignInPage;
