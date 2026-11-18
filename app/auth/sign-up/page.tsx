import { SignUpForm } from "@/features/auth";

import { AuthShell } from "../auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUpForm />
    </AuthShell>
  );
}
