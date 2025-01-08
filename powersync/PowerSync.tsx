import "@azure/core-asynciterator-polyfill";
import "react-native-url-polyfill/auto";

import { SupabaseConnector } from "./SupabaseConnector";
import {
  AbstractPowerSyncDatabase,
  RNQSPowerSyncDatabaseOpenFactory,
} from "@powersync/react-native";
import { Kysely, wrapPowerSyncWithKysely } from "@powersync/kysely-driver";
import { AppSchema, Database } from "./AppSchema";
import { createContext, useContext } from "react";

export class System {
  supabaseConnector: SupabaseConnector;
  powersync: AbstractPowerSyncDatabase | undefined;
  db: Kysely<Database> | undefined;

  constructor() {
    const factory = new RNQSPowerSyncDatabaseOpenFactory({
      schema: AppSchema,
      dbFilename: "app.sqlite",
    });

    this.supabaseConnector = new SupabaseConnector();
    this.powersync = factory.getInstance();
    this.db = wrapPowerSyncWithKysely(this.powersync);
  }
  async init() {
    await this.powersync?.init();
    await this.powersync?.connect(this.supabaseConnector);
  }
}

export const system = new System();
export const SystemContext = createContext(system);
export const useSystem = () => useContext(SystemContext);
