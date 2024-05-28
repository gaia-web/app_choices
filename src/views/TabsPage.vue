<template>
  <ion-page>
    <Suspense>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="rondom" href="/tabs/random">
            <ion-icon aria-hidden="true" :icon="triangle" />
            <ion-label>Random</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="comparison" href="/tabs/comparison">
            <ion-icon aria-hidden="true" :icon="ellipse" />
            <ion-label>Comparison</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="saved" href="/tabs/saved">
            <ion-icon aria-hidden="true" :icon="square" />
            <ion-label>Saved</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </Suspense>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from "@ionic/vue";
import { ellipse, square, triangle } from "ionicons/icons";
</script>
