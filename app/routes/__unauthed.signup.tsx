import type { LoaderFunctionArgs } from "react-router";
import { redirect, useActionData } from "react-router";
import { Card } from "~/components/ui/card";
import ProfileForm from "~/modules/Profile/ProfileForm";
import { authenticate, userFromRequest } from "~/server/auth.server";
import { UsersService } from "~/server/data/users.server";
import { type GenericDataError } from "~/server/data/utils/types";

export const meta = () => [
  {
    title: "Login | AI Food Log",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await userFromRequest(request);

  if (user) return redirect("/diary");

  return null;
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const result = await UsersService.create(form);

  if (result.errors) return result.errors;

  return authenticate(result.data, { rememberMe: result.data.rememberMe });
};

export default function SignUp() {
  const errors = useActionData<GenericDataError>();

  return (
    <Card className="md:w-xl w-full">
      <ProfileForm errors={errors} mode="create" />
    </Card>
  );
}
