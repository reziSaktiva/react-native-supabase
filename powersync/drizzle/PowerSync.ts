import { createContext, useContext } from "react";
import { Connector } from "./Connector";
import { PowerSyncDatabase } from "@powersync/react-native";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { AppSchema } from "../AppSchema";

const supabaseConnector = new Connector();
const powersync = new PowerSyncDatabase({
  database: {
    dbFilename: "test.sqlite",
  },
  schema: AppSchema,
});
const db = wrapPowerSyncWithDrizzle(powersync);

export const initSystem = async (): Promise<void> => {
  await powersync.init();
  await powersync.connect(supabaseConnector);
};

export const SystemContext = createContext({
  supabaseConnector,
  powersync,
  db,
});

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystem must be used within a SystemContext.Provider");
  }
  return context;
};
