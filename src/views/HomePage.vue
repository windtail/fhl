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

        <ion-item-sliding v-for="poem in poems" :key="poem.id">
          <ion-item>
            <ion-label button @click="onPoemClick(poem)">
              {{ poem.no }}. {{ poem.title }} ({{ poem.dynasty }} {{ poem.author }})
            </ion-label>
            <ion-buttons slot="end">
              <ion-button @click="onPoemToggleFavorClick(poem)">
                <ion-icon :icon="poem.favor ? star : starOutline" slot="icon-only"/>
              </ion-button>
            </ion-buttons>
          </ion-item>

          <ion-item-options>

            <ion-item-option color="danger" @click="onPoemDeleteClick(poem)">
              <ion-icon :icon="trash" slot="start"/>
              删除
            </ion-item-option>

            <ion-item-option @click="onPoemEditClick(poem)">
              <ion-icon :icon="pencil" slot="start"/>
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
import {ref, watch} from 'vue';
import {trash, add, pencil, enter, exit, star, starOutline} from 'ionicons/icons';

import PoemModal from '@/components/PoemModal.vue';
import {Search} from '@/types/poem.types';
import {Poem} from '@/entity/Poem'
import PoemDataSource from '@/data-source';
import sqliteConnection from '@/database';
import {Capacitor} from '@capacitor/core';

const poems = ref<Poem[]>([])

const favorOnly = ref<boolean>(false)
const search = ref<Search>(new Search())
const refresh = ref(0)

async function persist() {
  const platform = Capacitor.getPlatform()
  if (platform === 'web') {
    await sqliteConnection.saveToStore(PoemDataSource.options.database as string);
  }

  refresh.value += 1
}

watch([favorOnly, search, refresh], async () => {
  const q = PoemDataSource.getRepository(Poem).createQueryBuilder('poem')
  if (favorOnly.value) {
    q.where('poem.favor = :favor', {favor: 1})
  }

  const {no, title, dynasty, author, keys} = search.value
  if (no) {
    q.where('poem.no = :no', {no})
  }

  if (title) {
    q.where('poem.title LIKE %:title%', {title})
  }

  if (dynasty) {
    q.where('poem.dynasty LIKE %:dynasty%', {dynasty})
  }

  if (author) {
    q.where('poem.author LIKE %:author%', {author})
  }

  if (keys) {
    for (const [index, key] of keys.entries()) {
      const name = `key${index}`
      const params: any = {}
      params[name] = key
      q.where(`poem.author LIKE %:${name}%`, params)
    }
  }

  poems.value = await q.getMany()
}, {
  immediate: true
})

async function getNextNo(): Promise<number> {
  const query = PoemDataSource.getRepository(Poem).createQueryBuilder('poem');
  query.select("MAX(poem.no)", "max");
  const result = await query.getRawOne();
  const no = result ? result.max : 0;
  return no + 1;
}

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

  const {data, role} = await modal.onWillDismiss();

  if (role === 'confirm') {
    const poem = data as Poem
    if (poem.no == 0) {
      poem.no = await getNextNo()
    }

    await poem.save()
    await persist()
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

  const {role} = await actionSheet.onDidDismiss();
  if (role === 'destructive') {
    await poem.remove()
    await persist()
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

  const {data, role} = await modal.onWillDismiss();

  if (role === 'confirm') {
    const editedPoem = data as Poem

    editedPoem.id = poem.id
    editedPoem.favor = poem.favor

    await editedPoem.save()
    await persist()
  }
}

async function onPoemToggleFavorClick(poem: Poem) {
  poem.favor = !poem.favor
  await poem.save()
  await persist()
}

</script>

<style scoped>
</style>
