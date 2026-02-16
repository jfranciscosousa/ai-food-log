import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Card } from "~/components/ui/card";
import { Onboarding } from "~/domains/Onboarding";
import type { OnboardingData } from "~/domains/Onboarding/Onboarding";
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
    onError: () => toast.error("Error creating account"),
  });

  const errors = extractTrpcFormErrors(signup.error);

  function onComplete(data: OnboardingData) {
    signup.mutate(data);
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
