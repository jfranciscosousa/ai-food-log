import { useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Onboarding } from "~/domains/Onboarding";
import type { OnboardingData } from "~/domains/Onboarding/Onboarding";
import { toast } from "~/hooks/use-toast";
import { extractTrpcFormErrors } from "~/server/trpc/errors";
import { trpc } from "~/utils/trpc";

export const meta = () => [
  {
    title: "Welcome | AI Food Log",
  },
];

export default function SignUp() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      utils.auth.invalidate();
    },
    onError: () =>
      toast({
        title: "Error creating account!",
        variant: "destructive",
      }),
  });

  const errors = extractTrpcFormErrors(signup.error);

  function onComplete(data: OnboardingData) {
    // TODO: improve form type handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signup.mutate(data as any);
  }

  function onExit() {
    navigate("/login");
  }

  return (
    <Card className="md:w-xl w-full">
      <Onboarding
        onComplete={onComplete}
        onExit={onExit}
        isLoading={signup.isPending}
        errors={errors}
      />
    </Card>
  );
}
