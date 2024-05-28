<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Comparison</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveConfig">
            <ion-icon slot="icon-only" :icon="save"></ion-icon
          ></ion-button>
          <ion-button @click="compare">
            <ion-icon slot="icon-only" :icon="dice"></ion-icon
          ></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Comparison</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item v-for="item in items" :key="item.name">
          {{ item.name }}
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
  onIonViewDidEnter,
} from "@ionic/vue";
import { add, dice, save, trash } from "ionicons/icons";
import { ref } from "vue";
import { deepUnref } from "vue-deepunref";
import { appStorage } from "../utils/storage";
import { STORAGE_KEYS } from "@/utils/constant";
import { useRoute } from "vue-router";
import { AppData, SavedConfig } from "@/utils/app-data";

type Item = { name: string | number };

const route = useRoute();

const items = ref<Item[]>([]);

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
          items.value.push({ name: data.name });
        },
      },
    ],
  });
  await alert.present();
}

function removeItem(item: unknown) {
  items.value = items.value.filter((i) => i !== item);
}

async function compare() {
  if (items.value.length < 1) {
    await (
      await alertController.create({
        header: "Error",
        message: "Please add at least one item.",
        buttons: ["OK"],
      })
    ).present();
  }
  const shuffledItems = [...items.value].sort(() => Math.random() - 0.5);
  let first = shuffledItems[0];
  while (shuffledItems.length > 1) {
    const second = shuffledItems.pop();
    if (!second) {
      continue;
    }
    first = await compareTwo(first, second);
  }
  const alert = await alertController.create({
    header: "Final Result",
    message: first.name.toString(),
    buttons: ["OK"],
  });
  await alert.present();
}

async function compareTwo(item1: Item, item2: Item): Promise<Item> {
  return new Promise((resolve) => {
    alertController
      .create({
        header: "Which one you prefer more?",
        message: `${item1.name} or ${item2.name}?`,
        buttons: [
          {
            text: item1.name.toString(),
            handler: () => resolve(item1),
          },
          {
            text: item2.name.toString(),
            handler: () => resolve(item2),
          },
        ],
      })
      .then((alert) => alert.present());
  });
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
            type: "comparison",
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
