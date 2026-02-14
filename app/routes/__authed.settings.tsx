import useUser from "~/hooks/useUser";
import SettingsForm from "~/modules/Settings/SettingsForm";

export const meta = () => [
  {
    title: "Settings | AI Food Log",
  },
];

export default function Settings() {
  const user = useUser();

  return <SettingsForm user={user} />;
}
