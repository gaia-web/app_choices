import { Storage } from "@ionic/storage";
import { initializeAppData } from "./app-data";

export const appStorage = await new Storage({
  name: "app-storage",
}).create();

initializeAppData();
