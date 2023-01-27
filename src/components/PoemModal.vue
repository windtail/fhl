<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click='cancel'>取消</ion-button>
      </ion-buttons>
      <ion-title>{{ titleText }}</ion-title>
      <ion-buttons slot="end">
        <ion-button :strong="true" @click="confirm">{{ confirmText }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="stacked">请输入序号</ion-label>
      <ion-input ref="no" type="number" placeholder="序号(自增)" :value="poem?.no"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">请输入标题</ion-label>
      <ion-input ref="title" type="text" placeholder="标题" :value="poem?.title"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">请输入朝代</ion-label>
      <ion-input ref="dynasty" type="text" placeholder="未知" :value="poem?.dynasty"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">请输入作者</ion-label>
      <ion-input ref="author" type="text" placeholder="佚名" :value="poem?.author"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">请输入内容</ion-label>
      <ion-textarea ref="content" placeholder="内容" :auto-grow=true :value="poem?.content"></ion-textarea>
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
} from '@ionic/vue';
import { ref } from 'vue';
import { Poem } from '@/entity/Poem';

const props = defineProps<{
  titleText: string,
  confirmText: string,
  poem?: Poem,
}>()

const no = ref<any>(null)
const title = ref<any>(null)
const dynasty = ref<any>(null)
const author = ref<any>(null)
const content = ref<any>(null)

function cancel() {
  modalController.dismiss(null, 'cancel')
}

function nonEmptyOr(s: string, default_: string) : string {
  const ss = s.trim()
  if (ss.length == 0) {
    return default_
  } else {
    return ss
  }
}

function validOr(no: number, default_: number) : number {
  const n = Math.trunc(no)
  if (n <= 0) {
    return default_
  } else {
    return n
  }
}

function confirm() {
  const poem = props.poem

  const p = new Poem()
  p.no = validOr(no.value.$el.value, poem ? poem.no : 0)
  p.title = nonEmptyOr(title.value.$el.value, "未知")
  p.dynasty = nonEmptyOr(dynasty.value.$el.value, "未知")
  p.author = nonEmptyOr(author.value.$el.value, "佚名")
  p.content = nonEmptyOr(content.value.$el.value, "")
  p.favor = poem ? poem.favor : false

  modalController.dismiss(p, 'confirm')
}

</script>

<style scoped>

</style>
