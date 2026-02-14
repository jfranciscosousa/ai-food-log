import { useSearchParams } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { UserWithoutPassword } from "~/server/data/users.server";
import { SettingsHealthTab } from "./SettingsHealthTab";
import { SettingsAccountTab } from "./SettingsAccountTab";

interface SettingsFormProps {
  user: UserWithoutPassword;
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "health";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health">Health & Exercise</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-6">
            <SettingsHealthTab user={user} />
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <SettingsAccountTab user={user} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
