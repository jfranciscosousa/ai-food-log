import useUser from "~/hooks/useUser";
import SettingsForm from "~/domains/Settings/SettingsForm";

export const meta = () => [
  {
    title: "Settings | Vigor",
  },
];

export default function Settings() {
  const user = useUser();

  return <SettingsForm user={user} />;
}
