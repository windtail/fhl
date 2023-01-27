<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click='cancel'>
          <ion-icon :icon="arrowBack" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>诗词详情</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <h1>{{ no }}. <span v-html="title"></span></h1>
    <p><span v-html="dynasty"></span> <span v-html="author"></span></p>
    <p v-html="content"></p>
  </ion-content>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonButtons,
  IonButton,
  IonToolbar,
  IonIcon,
  modalController,
} from '@ionic/vue';
import {arrowBack} from 'ionicons/icons';
import {Poem} from '@/entity/Poem';
import {Search} from "@/types/poem.types";

const props = defineProps<{
  poem: Poem,
  search: Search,
}>()

function highlight(s: string, key: string): string {
  return s.replaceAll(key, `<span style="color: red">${key}</span>`)
}

const {no, title, dynasty, author, content} = (() => {
  const search = props.search
  let {title, dynasty, author, content} = props.poem
  const {no} = props.poem

  if (search.title) {
    title = highlight(title, search.title)
  }

  if (search.dynasty) {
    dynasty = highlight(dynasty, search.dynasty)
  }

  if (search.author) {
    author = highlight(author, search.author)
  }

  content = content.replaceAll("\n", "<br/>")
  if (search.keys) {
    for (const key of search.keys) {
      content = highlight(content, key)
    }
  }

  return {no, title, dynasty, author, content}
})()


function cancel() {
  modalController.dismiss(null, "cancel")
}

</script>

<style scoped>

</style>
