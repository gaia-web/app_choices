import { STORAGE_KEYS } from "./constant";
import { appStorage } from "./storage";

export type SavedConfig = {
  type: "random" | "pick";
  name: string;
} & Record<string, unknown>;

export type AppData = {
  savedConfigs: SavedConfig[];
};

export const INITIAL_APP_DATA: AppData = {
  savedConfigs: [],
};

export async function initializeAppData() {
  const appData = await appStorage.get(STORAGE_KEYS.APP_DATA);
  if (!appData) {
    await appStorage.set(STORAGE_KEYS.APP_DATA, INITIAL_APP_DATA);
  }
}
