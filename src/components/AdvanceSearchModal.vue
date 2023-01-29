<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click='cancel'>
          <ion-icon :icon="arrowBack" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>高级搜索</ion-title>
      <ion-buttons slot="end">
        <ion-button :strong="true" @click="confirm">搜索</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="stacked">标题包含</ion-label>
      <ion-input v-model="title" type="text" placeholder="标题包含的文字"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">朝代包含</ion-label>
      <ion-input v-model="dynasty" type="text" placeholder="朝代包含的文字"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">作者包含</ion-label>
      <ion-input v-model="author" type="text" placeholder="作者包含的文字"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">内容包含</ion-label>
      <ion-textarea v-model="content" placeholder="内容包含的文字或词，多个用空格分隔" :auto-grow=true></ion-textarea>
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
import {Search} from "@/types/search.types";

const props = defineProps<{
  search: Search,
}>()

const title = ref("")
const dynasty = ref("")
const author = ref("")
const content = ref("")

onMounted(() => {
  const {title: title_, dynasty: dynasty_, author: author_, keys} = props.search

  if (title_) {
    title.value = title_
  }

  if (dynasty_) {
    dynasty.value = dynasty_
  }

  if (author_) {
    author.value = author_
  }

  if (keys) {
    content.value = keys.join(" ")
  }
})

function cancel() {
  modalController.dismiss(null, 'cancel')
}

function nonEmptyOrUndefined(s: string): string | undefined {
  const ss = s.trim()
  if (ss.length == 0) {
    return undefined
  } else {
    return ss
  }
}

function confirm() {
  const search = new Search()

  search.title = nonEmptyOrUndefined(title.value)
  search.dynasty = nonEmptyOrUndefined(dynasty.value)
  search.author = nonEmptyOrUndefined(author.value)

  {
    const keys = content.value.split(/\s+/).filter(key => key.length > 0)
    search.keys = (keys.length > 0) ? keys : undefined
  }

  modalController.dismiss(search, 'confirm')
}

</script>

<style scoped>

</style>
