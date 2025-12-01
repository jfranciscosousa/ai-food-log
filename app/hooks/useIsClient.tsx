import { useEffect, useState } from "react";

export function useIsClient() {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // This is an exception, we only want to set the state in an effect to make sure we are client-side
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient(true);
  }, []);

  return isClient;
}
