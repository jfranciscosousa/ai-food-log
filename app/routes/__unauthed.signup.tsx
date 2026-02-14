import { useState } from "react";
import { Onboarding } from "~/components/Onboarding";
import type { OnboardingData } from "~/components/Onboarding/Onboarding";
import { Card } from "~/components/ui/card";
import { toast } from "~/hooks/use-toast";
import {
  extractTrpcFormErrors,
  extractZodClientErrors,
} from "~/server/trpc/errors";
import { signupSchema } from "~/server/trpc/schemas/auth";
import { trpc } from "~/utils/trpc";

export const meta = () => [
  {
    title: "Welcome | AI Food Log",
  },
];

export default function SignUp() {
  const utils = trpc.useUtils();
  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      utils.auth.invalidate();
      setClientErrors({});
    },
    onError: () =>
      toast({
        title: "Error creating account!",
        variant: "destructive",
      }),
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const formErrors = extractTrpcFormErrors(signup.error);
  const allErrors = { ...clientErrors, ...formErrors };

  function onComplete(data: OnboardingData) {
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      setClientErrors(extractZodClientErrors(result.error));
      return;
    }

    setClientErrors({});
    signup.mutate(result.data);
  }

  return (
    <Card className="md:w-xl w-full">
      <Onboarding
        onComplete={onComplete}
        isLoading={signup.isPending}
        errors={allErrors}
      />
    </Card>
  );
}
