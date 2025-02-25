import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { useActionData } from "react-router";
import { Card } from "~/components/ui/card";
import ProfileForm from "~/modules/Profile/ProfileForm";
import { authenticate, userFromRequest } from "~/server/auth.server";
import { createUser } from "~/server/data/users/index.server";
import { type GenericDataError } from "~/server/data/utils/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await userFromRequest(request);

  if (user) return redirect("/diary");

  return null;
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const result = await createUser(form);

  if (result.errors) return result.errors;

  return authenticate(result.data, { rememberMe: result.data.rememberMe });
};

export const meta: MetaFunction = () => [
  {
    title: "Sign up",
  },
];

export default function SignUp() {
  const errors = useActionData<GenericDataError>();

  return (
    <div className="my-8 min-w-96">
      <Card>
        <ProfileForm errors={errors} mode="create" />
      </Card>
    </div>
  );
}
