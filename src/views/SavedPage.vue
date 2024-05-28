<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Saved</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Saved</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item
          v-for="config in appData?.savedConfigs ?? []"
          :key="config.name"
          button
          @click="loadConfig(deepUnref(config))"
        >
          {{ config.name }}
          <ion-button
            slot="end"
            fill="clear"
            @click="
              $event.stopPropagation();
              removeItem(deepUnref(config));
            "
          >
            <ion-icon slot="icon-only" :icon="trash"></ion-icon> </ion-button
        ></ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { AppData, SavedConfig } from "@/utils/app-data";
import { STORAGE_KEYS } from "@/utils/constant";
import { appStorage } from "@/utils/storage";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  alertController,
  onIonViewDidEnter,
} from "@ionic/vue";
import { trash } from "ionicons/icons";
import { ref } from "vue";
import { deepUnref } from "vue-deepunref";
import { useRouter } from "vue-router";

const router = useRouter();

const appData = ref<AppData>();

onIonViewDidEnter(async () => {
  appData.value = await appStorage.get(STORAGE_KEYS.APP_DATA);
});

function loadConfig(config: SavedConfig) {
  router.push({ name: config.type, query: { name: config.name } });
}

async function removeItem(config: SavedConfig) {
  const alert = await alertController.create({
    header: "Are you sure?",
    message: `Are you sure you want to remove the saved config: ${config.name}?`,
    buttons: [
      {
        text: "Cancel",
      },
      {
        text: "Remove",
        role: "destructive",
        handler: async () => {
          if (!appData.value) {
            await (
              await alertController.create({
                message: "Internal Error: No app data",
              })
            ).present();
            return;
          }
          appData.value.savedConfigs = appData.value?.savedConfigs.filter(
            (_config) => _config.name !== config.name
          );
          await appStorage.set(STORAGE_KEYS.APP_DATA, deepUnref(appData));
        },
      },
    ],
  });
  await alert.present();
}
</script>
