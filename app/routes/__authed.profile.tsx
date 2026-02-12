import { Card } from "~/components/ui/card";
import useUser from "~/hooks/useUser";
import ProfileForm from "~/modules/Profile/ProfileForm";

export const meta = () => [
  {
    title: "Profile | AI Food Log",
  },
];

export default function Profile() {
  const user = useUser();

  return (
    <Card>
      <ProfileForm mode="update" user={user} />
    </Card>
  );
}
