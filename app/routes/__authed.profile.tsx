import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import useUser from "~/hooks/useUser";
import ProfileForm from "~/modules/Profile/ProfileForm";
import { userIdFromRequest } from "~/server/auth.server";
import { updateUser } from "~/server/data/users/index.server";

export type ProfileRouteActionType = SerializeFrom<typeof action>;

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
    <Card className="max-w-lg w-full mx-auto flex items-center justify-center">
      <ProfileForm errors={actionData?.errors} mode="update" user={user} />
    </Card>
  );
}
