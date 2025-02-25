import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useActionData } from "react-router";
import { useEffect } from "react";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import useUser from "~/hooks/useUser";
import ProfileForm from "~/modules/Profile/ProfileForm";
import { userIdFromRequest } from "~/server/auth.server";
import { updateUser } from "~/server/data/users/index.server";
import type { Info } from "./+types/__authed.profile";

export type ProfileRouteActionType = Info["actionData"];

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await userIdFromRequest(request);
  const form = await request.formData();

  return updateUser(userId, form);
};

export const meta: MetaFunction = () => [
  {
    title: "Profile",
  },
];

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
