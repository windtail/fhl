<template>
  <ion-menu content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>筱筱飞花</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding-top">
      <ion-list>
        <ion-item button :detail=false @click="addPoem">
          <ion-icon :icon="add" slot="start"></ion-icon>
          添加
        </ion-item>
        <ion-item button :detail=false @click="importPoems">
          <ion-icon :icon="enter" slot="start"></ion-icon>
          导入
        </ion-item>
        <ion-item button :detail=false @click="exportPoems">
          <ion-icon :icon="exit" slot="start"></ion-icon>
          导出
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-page id="main-content">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-searchbar :debounce="500" placeholder="搜索"
          @ion-change="search = Search.fromString($event.target.value!)"></ion-searchbar>

        <ion-buttons slot="end">
          <ion-button fill="clear" shape="round" @click="favorOnly = !favorOnly">
            <ion-icon :icon="favorOnly ? star : starOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 主要内容 -->
      <ion-list>

        <ion-item-sliding v-for="poem in filteredPoems" :key="poem.id">
          <ion-item>
            <ion-label button @click="onPoemClick(poem)">
              {{ poem.no }}. {{ poem.title }} ({{ poem.dynasty }} {{ poem.author }})
            </ion-label>
            <ion-buttons slot="end">
              <ion-button @click="onPoemToggleFavorClick(poem)">
                <ion-icon :icon="poem.favor ? star : starOutline" slot="icon-only" />
              </ion-button>
            </ion-buttons>
          </ion-item>

          <ion-item-options>

            <ion-item-option color="danger" @click="onPoemDeleteClick(poem)">
              <ion-icon :icon="trash" slot="start" />
              删除
            </ion-item-option>

            <ion-item-option @click="onPoemEditClick(poem)">
              <ion-icon :icon="pencil" slot="start" />
              编辑
            </ion-item-option>

          </ion-item-options>
        </ion-item-sliding>

      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonTitle,
  IonButtons,
  IonMenu,
  IonMenuButton,
  IonButton,
  IonSearchbar,
  IonToolbar,
  IonIcon,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  modalController,
  actionSheetController,
  menuController,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { trash, add, pencil, enter, exit, star, starOutline } from 'ionicons/icons';

import PoemModal from '@/components/PoemModal.vue';
import { Poem, Search } from '@/types/poem.types';


const poems = ref<Poem[]>([
  {
    id: 0,
    no: 1,
    title: "静夜思",
    dynasty: "唐代",
    author: "李白",
    content: "测试测试测试",
    favor: false
  },
  {
    id: 0,
    no: 2,
    title: "静夜思2",
    dynasty: "唐代",
    author: "李白",
    content: "测试测试测试",
    favor: true,
  },
])

const favorOnly = ref<boolean>(false)
const search = ref<Search>(new Search())

const filteredPoems = computed(() => {
  if (search.value.empty()) {
    return poems.value.filter(poem => {
      if (favorOnly.value) {
        if (!poem.favor) {
          return false
        }
      }

      return true
    })
  } else {
    return poems.value.filter(poem => {
      if (favorOnly.value) {
        if (!poem.favor) {
          return false
        }
      }

      return search.value.match(poem)
    })
  }
})

async function addPoem() {
  await menuController.close()

  const modal = await modalController.create({
    component: PoemModal,
    componentProps: {
      titleText: "添加诗词",
      confirmText: "添加",
    }
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm') {
    // TODO add
    console.log("add", data)
  }
}

function importPoems() {
  console.log("import")
}

function exportPoems() {
  console.log("export")
}

function onPoemClick(poem: Poem) {
  console.log("detail", poem)
}

async function onPoemDeleteClick(poem: Poem) {
  const actionSheet = await actionSheetController.create({
    header: `删除 ${poem.title} (${poem.dynasty} ${poem.author}) ？`,
    subHeader: '删除后不可恢复',
    buttons: [
      {
        text: '删除',
        role: 'destructive',
        data: {
          action: 'delete',
        },
      },
      {
        text: '取消',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ],
  });

  await actionSheet.present();

  const { role } = await actionSheet.onDidDismiss();
  if (role === 'destructive') {
    // TODO delete poem
    console.log("delete", poem)
  }
}

async function onPoemEditClick(poem: Poem) {
  const modal = await modalController.create({
    component: PoemModal,
    componentProps: {
      titleText: "编辑诗词",
      confirmText: "保存",
      poem: poem,
    }
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm') {
    // TODO save changes
    console.log("old", poem)
    console.log("new", data)
  }
}

function onPoemToggleFavorClick(poem: Poem) {
  poem.favor = !poem.favor
  // TODO save it
}

</script>

<style scoped>
</style>
