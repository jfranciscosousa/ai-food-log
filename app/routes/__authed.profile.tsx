import { Card } from "~/components/ui/card";
import ProfileForm from "~/modules/Profile/ProfileForm";
import { trpc } from "~/utils/trpc";

export const meta = () => [
  {
    title: "Profile | AI Food Log",
  },
];

export default function Profile() {
  const { data: user } = trpc.auth.me.useQuery();

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <Card>
      <ProfileForm mode="update" user={user} />
    </Card>
  );
}
