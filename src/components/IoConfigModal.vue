<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click='cancel'>
          <ion-icon :icon="arrowBack" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>导入导出配置</ion-title>
      <ion-buttons slot="end">
        <ion-button :strong="true" @click="confirm">保存</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="stacked">URL</ion-label>
      <ion-textarea v-model="url" type="text" placeholder="https://your-webdav-file-url" :auto-grow=true></ion-textarea>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">用户名</ion-label>
      <ion-input v-model="username" type="text" placeholder="用户名"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">密码</ion-label>
      <ion-input v-model="password" type="password" placeholder="密码"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label class="ion-text-wrap">文件夹需要手动创建，如果使用坚果云和默认的url，应在坚果云根目录创建poems文件夹</ion-label>
    </ion-item>
  </ion-content>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonItem,
  IonTitle,
  IonButtons,
  IonButton,
  IonToolbar,
  IonTextarea,
  IonLabel,
  IonInput,
  modalController,
  IonIcon,
} from '@ionic/vue';
import {ref, onMounted} from 'vue';
import {arrowBack} from 'ionicons/icons';
import {ImportExportConfig} from "@/types/io.types";

const props = defineProps<{
  config: ImportExportConfig,
}>()

const url = ref("")
const username = ref("")
const password = ref("")

onMounted(() => {
  const {url: url_, username: username_, password: password_} = props.config

  url.value = url_
  username.value = username_
  password.value = password_
})

function cancel() {
  modalController.dismiss(null, 'cancel')
}

function confirm() {
  modalController.dismiss({
    url: url.value,
    username: username.value,
    password: password.value
  }, 'confirm')
}

</script>

<style scoped>

</style>
