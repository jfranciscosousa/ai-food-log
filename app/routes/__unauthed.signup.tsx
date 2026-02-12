import { Card } from "~/components/ui/card";
import ProfileForm from "~/modules/Profile/ProfileForm";

export const meta = () => [
  {
    title: "Sign Up | AI Food Log",
  },
];

export default function SignUp() {
  return (
    <Card className="md:w-xl w-full">
      <ProfileForm mode="create" />
    </Card>
  );
}
