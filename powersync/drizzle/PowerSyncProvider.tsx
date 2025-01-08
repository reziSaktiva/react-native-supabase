import { ReactNode, useMemo } from "react";

import { useSystem, SystemContext } from "../PowerSync";

export const DrizzlePowerSyncProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const value = useSystem();

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  );
};
