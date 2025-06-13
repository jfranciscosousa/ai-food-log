import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useActionData } from "react-router";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import useUser from "~/hooks/useUser";
import ProfileForm from "~/modules/Profile/ProfileForm";
import { userIdFromRequest } from "~/server/auth.server";
import { UsersService } from "~/server/data/users.server";
import type { Route } from "./+types/__authed.profile";

export const meta = () => [
  {
    title: "Profile | AI Food Log",
  },
];

export type ProfileRouteActionType = Route.ComponentProps["actionData"];

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await userIdFromRequest(request);
  const form = await request.formData();

  return UsersService.update(userId, form);
};

export default function Profile() {
  const actionData = useActionData<ProfileRouteActionType>();
  const { toast } = useToast();
  const user = useUser();

  useEffect(() => {
    if (actionData?.errors) {
      toast({ title: "Failed to update profile!", variant: "destructive" });
    } else if (actionData?.data) toast({ title: "Updated profile!" });
  }, [actionData, toast]);

  return (
    <Card>
      <ProfileForm errors={actionData?.errors} mode="update" user={user} />
    </Card>
  );
}
