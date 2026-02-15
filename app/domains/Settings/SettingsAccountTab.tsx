import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { InputField } from "~/components/ui/input-field";
import type { UserWithoutPassword } from "~/server/data/users.server";
import { extractTrpcFormErrors } from "~/server/trpc/errors";
import { trpc } from "~/utils/trpc";

interface SettingsAccountTabProps {
  user: UserWithoutPassword;
}

export function SettingsAccountTab({ user }: SettingsAccountTabProps) {
  const utils = trpc.useUtils();

  const updateAccount = trpc.user.updateAccount.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Account settings updated!");
    },
    onError: () => {
      toast.success("Failed to update account settings!");
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData = {
      email: data.email as string,
      name: data.name as string,
      currentPassword: data.currentPassword as string,
      newPassword: data.newPassword as string,
      passwordConfirmation: data.passwordConfirmation as string,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateAccount.mutate(processedData as any);
  };

  const errors = extractTrpcFormErrors(updateAccount.error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Account Information</h3>

        <InputField
          label="Email"
          name="email"
          type="text"
          required
          placeholder="hello@email.com"
          errors={errors}
          defaultValue={user?.email}
        />

        <InputField
          label="Name"
          name="name"
          type="text"
          required
          placeholder="How you would like to be called"
          errors={errors}
          defaultValue={user?.name}
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Leave password fields blank if you don&apos;t want to change your
          password.
        </p>

        <InputField
          label="Current password"
          name="currentPassword"
          type="password"
          placeholder="**************"
          required
          errors={errors}
        />

        <InputField
          label="New password"
          name="newPassword"
          type="password"
          placeholder="**************"
          errors={errors}
        />

        <InputField
          label="Confirm password"
          name="passwordConfirmation"
          type="password"
          placeholder="**************"
          errors={errors}
        />
      </div>

      <Button
        type="submit"
        className="mt-4"
        isLoading={updateAccount.isPending}
      >
        Save changes
      </Button>
    </form>
  );
}
