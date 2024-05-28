<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Random</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveConfig">
            <ion-icon slot="icon-only" :icon="save"></ion-icon
          ></ion-button>
          <ion-button @click="roll">
            <ion-icon slot="icon-only" :icon="dice"></ion-icon
          ></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Random</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item v-for="item in items" :key="item.name">
          {{ item.name }}
          <ion-note slot="end">(weight: {{ item.weight ?? 1 }})</ion-note>
          <ion-button
            slot="end"
            fill="clear"
            @click="
              $event.stopPropagation();
              removeItem(item);
            "
          >
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="addItem">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  alertController,
  IonList,
  IonItem,
  IonButton,
  IonNote,
  onIonViewDidEnter,
} from "@ionic/vue";
import { add, dice, save, trash } from "ionicons/icons";
import { ref } from "vue";
import { deepUnref } from "vue-deepunref";
import { appStorage } from "../utils/storage";
import { rollItems } from "../utils/roll";
import { STORAGE_KEYS } from "@/utils/constant";
import { useRoute } from "vue-router";
import { AppData, SavedConfig } from "@/utils/app-data";

type Item = { name: string | number; weight: number };

const route = useRoute();

const items = ref<{ name: string | number; weight: number }[]>([]);

onIonViewDidEnter(async () => {
  if (route.query?.name) {
    const appData = (await appStorage.get(STORAGE_KEYS.APP_DATA)) as
      | AppData
      | undefined;
    if (!appData) {
      return;
    }
    const config = appData.savedConfigs.find(
      (config: SavedConfig) => config.name === route.query.name
    );
    if (!config) {
      return;
    }
    items.value = deepUnref(config.items) as Item[];
  }
});

async function addItem() {
  const alert = await alertController.create({
    header: "Add item",
    inputs: [
      {
        name: "name",
        type: "text",
        placeholder: "Item name",
      },
      {
        name: "weight",
        type: "number",
        placeholder: "Weight (default: 1)",
      },
    ],
    buttons: [
      {
        text: "Cancel",
      },
      {
        text: "Add",
        handler: async (data) => {
          if (!data.name) {
            await (
              await alertController.create({
                header: "Error",
                message: "Item name is required.",
                buttons: ["OK"],
              })
            ).present();
            return;
          }
          if (items.value.find((i) => i.name === data.name)) {
            await (
              await alertController.create({
                header: "Error",
                message: `Item "${data.name}" already exists.`,
                buttons: ["OK"],
              })
            ).present();
            return;
          }
          items.value.push({ name: data.name, weight: +data.weight || 1 });
        },
      },
    ],
  });
  await alert.present();
}

function removeItem(item: unknown) {
  items.value = items.value.filter((i) => i !== item);
}

async function roll() {
  const alert = await alertController.create({
    header: "How many items do you want to roll?",
    inputs: [
      {
        name: "count",
        type: "number",
        placeholder: "Count (default: 1)",
        value: 1,
        min: 1,
        max: items.value.length,
      },
    ],
    buttons: [
      {
        text: "Cancel",
      },
      {
        text: "Roll",
        handler: async (data) => {
          const resultCount = data.count || 1;
          const rolledItems = rollItems<Item>(items.value, resultCount);
          await (
            await alertController.create({
              header: "Rolled items",
              message: rolledItems.map((item) => item.name).join(", "),
              buttons: ["OK"],
            })
          ).present();
        },
      },
    ],
  });
  await alert.present();
}

async function saveConfig() {
  const alert = await alertController.create({
    header: "Save the current configuration",
    inputs: [
      {
        name: "name",
        type: "text",
        placeholder: "Config Name",
      },
    ],
    buttons: [
      {
        text: "Cancel",
      },
      {
        text: "Save",
        role: "confirm",
        handler: async (data) => {
          if (!data.name) {
            await (
              await alertController.create({
                header: "Error",
                message: "Config name is required.",
                buttons: ["OK"],
              })
            ).present();
            return;
          }
          const config = {
            type: "random",
            name: data.name,
            items: deepUnref(items),
          };
          const appData = await appStorage.get(STORAGE_KEYS.APP_DATA);
          if (!appData) {
            return;
          }
          const existingConfig = appData.savedConfigs.find(
            (savedConfig: SavedConfig) => savedConfig.name === data.name
          );
          if (existingConfig) {
            await (
              await alertController.create({
                header: "Error",
                message: `Config "${data.name}" already exists.`,
                buttons: ["OK"],
              })
            ).present();
            return;
          }
          appData.savedConfigs.push(config);
          await appStorage.set(STORAGE_KEYS.APP_DATA, appData);
          await (
            await alertController.create({
              header: "Config saved",
              buttons: ["OK"],
            })
          ).present();
        },
      },
    ],
  });
  await alert.present();
}
</script>
