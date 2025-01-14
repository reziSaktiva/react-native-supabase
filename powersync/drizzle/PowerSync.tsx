import { createContext, useContext } from "react";
import { PowerSyncSQLiteDatabase, wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { Connector } from "./Connector";
import { PowerSyncDatabase } from "@powersync/react-native";
import { AppSchema, Database } from "./AppSchema";
import * as RNFS from '@dr.pogodin/react-native-fs';

import "@azure/core-asynciterator-polyfill";
import "react-native-url-polyfill/auto";

const dbFilename = "test.sqlite";

export class System {
  supabaseConnector: Connector;
  powersync: PowerSyncDatabase | undefined;
  db: PowerSyncSQLiteDatabase<Database> | undefined;

  constructor() {
    this.powersync = new PowerSyncDatabase({
      database: {
        dbFilename,
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

export const dbPath = RNFS.DocumentDirectoryPath;

export const system = new System();
export const SystemContext = createContext(system);
export const useSystem = () => useContext(SystemContext);