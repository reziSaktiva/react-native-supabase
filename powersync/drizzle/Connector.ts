import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/react-native";

import { SupabaseClient, createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
const powersyncUrl = process.env.EXPO_PUBLIC_POWERSYNC_URL as string;

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export class Connector implements PowerSyncBackendConnector {
  client: SupabaseClient;

  constructor() {
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
      },
    });
  }

  async login(username: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      throw error;
    }
  }

  async signUp(username: string, password: string) {
    const {
      error,
      data: { session },
    } = await this.client.auth.signUp({
      email: username,
      password: password,
    });

    if (!session) {
      throw new Error("No session returned from signUp");
    }

    if (error) {
      throw error;
    }

    return { session, error };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async userId() {
    const {
      data: { session },
    } = await this.client.auth.getSession();

    return session?.user.id;
  }

  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    console.log(session.access_token);

    return {
      client: this.client,
      endpoint: powersyncUrl,
      token: session.access_token ?? "",
      // token:
      //   "eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy1kZXYtMzIyM2Q0ZTMifQ.eyJzdWIiOiJEZXYiLCJpYXQiOjE3MzYyNDMxNzQsImlzcyI6Imh0dHBzOi8vcG93ZXJzeW5jLWFwaS5qb3VybmV5YXBwcy5jb20iLCJhdWQiOiJodHRwczovLzY3N2NkNDUyMWQ0YjdjNjNlZmQ0MzVkNi5wb3dlcnN5bmMuam91cm5leWFwcHMuY29tIiwiZXhwIjoxNzM2Mjg2Mzc0fQ.sdUwoZVj9uvHhkMcpyLWnnhpK2eBLnO7nhJT33ybV0Cmi_nEvo8JahqIJBAlr8dfxBVqzSfprxuaOFPYi5sgon3NNVo4b4CkMuJNsjPbc7WYI3F9sdihr2Vkx3C5VfAdkLnygfWhqNqvhEU5KzDi9WFJIntSDCh-Tl4i8Sn-GUscncJjHPW_Bsc6tzEvqh70WglHnM3tycoYZQgR0o6j-f85UIYFr5hbTPl6WCxyudgJePwmjsGhokJYKosmXWy7ZIk6sswAizdXoAhVAeYKYcDanuMGZWEipeXSTRI4vFuJTHLW_sigSVaHu-rSYQwIC8txZAVAH01R5S1RPGcdgA",
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000)
        : undefined,
      userID: session.user.id,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    try {
      // Note: If transactional consistency is important, use database functions
      // or edge functions to process the entire transaction in a single call.
      for (const op of transaction.crud) {
        lastOp = op;
        const table = this.client.from(op.table);
        let result: any = null;
        switch (op.op) {
          case UpdateType.PUT:
            // eslint-disable-next-line no-case-declarations
            const record = { ...op.opData, id: op.id };
            result = await table.upsert(record);
            break;
          case UpdateType.PATCH:
            result = await table.update(op.opData).eq("id", op.id);
            break;
          case UpdateType.DELETE:
            result = await table.delete().eq("id", op.id);
            break;
        }

        if (result.error) {
          console.error(result.error);
          result.error.message = `Could not ${
            op.op
          } data to Supabase error: ${JSON.stringify(result)}`;
          throw result.error;
        }
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (
        typeof ex.code == "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
      ) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw ex;
      }
    }
  }
}
