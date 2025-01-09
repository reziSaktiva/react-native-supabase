import { createContext, useContext } from "react";
import { PowerSyncSQLiteDatabase, wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { Connector } from "./Connector";
import { PowerSyncDatabase } from "@powersync/react-native";
import { AppSchema, Database } from "./AppSchema";

import "@azure/core-asynciterator-polyfill";
import "react-native-url-polyfill/auto";

export class System {
  supabaseConnector: Connector;
  powersync: PowerSyncDatabase | undefined;
  db: PowerSyncSQLiteDatabase<Database> | undefined;

  constructor() {
    this.powersync = new PowerSyncDatabase({
      database: {
        dbFilename: "test.sqlite",
      },
      schema: AppSchema,
    });

    this.supabaseConnector = new Connector();
    this.db = wrapPowerSyncWithDrizzle(this.powersync);
  }
  async init() {
    await this.powersync?.init();
    await this.powersync?.connect(this.supabaseConnector);
  }
}

export const system = new System();
export const SystemContext = createContext(system);
export const useSystem = () => useContext(SystemContext);