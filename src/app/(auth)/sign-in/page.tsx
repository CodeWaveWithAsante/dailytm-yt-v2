import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectIfSignedIn } from "@/lib/authentication";
import React from "react";

const SignInPage = async () => {
  await redirectIfSignedIn();

  return <SignInForm />;
};

export default SignInPage;
