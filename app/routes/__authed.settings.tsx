import useUser from "~/hooks/useUser";
import SettingsForm from "~/domains/Settings/SettingsForm";

export const meta = () => [
  {
    title: "Settings | Vigor",
  },
];

export default function Settings() {
  const user = useUser();

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and customize your health profile
        </p>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}
