<template>
  <ion-menu content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>筱筱飞花</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding-top">
      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>操作</ion-label>
          </ion-item-divider>

          <ion-item button :detail=false @click="openAdvancedSearch">
            <ion-icon :icon="searchOutline" slot="start"></ion-icon>
            高级搜索
          </ion-item>
          <ion-item button :detail=false @click="addPoem">
            <ion-icon :icon="add" slot="start"></ion-icon>
            添加
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>暂不支持</ion-label>
          </ion-item-divider>

          <ion-item button :detail=false @click="importPoems">
            <ion-icon :icon="enterOutline" slot="start"></ion-icon>
            导入
          </ion-item>
          <ion-item button :detail=false @click="exportPoems">
            <ion-icon :icon="exitOutline" slot="start"></ion-icon>
            导出
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-page id="main-content">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-searchbar :debounce="500" placeholder="搜索" v-model="userSearch"></ion-searchbar>

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
  actionSheetController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  menuController,
  modalController,
  toastController,
} from '@ionic/vue';
import {ref, watch} from 'vue';
import {
  add,
  enterOutline,
  exitOutline,
  pencil,
  searchOutline,
  star,
  starOutline,
  trash
} from 'ionicons/icons';
import {Directory, Encoding, Filesystem} from '@capacitor/filesystem';

import PoemModal from '@/components/PoemModal.vue';
import PoemDetailModal from "@/components/PoemDetailModal.vue";

import {Search} from '@/types/search.types';
import {UserPoem} from "@/types/userpoem.types";
import {Poem} from '@/entity/Poem'
import PoemDataSource from '@/data-source';
import sqliteConnection from '@/database';
import {Capacitor} from '@capacitor/core';
import AdvanceSearchModal from "@/components/AdvanceSearchModal.vue";
import {ObjectLiteral} from "typeorm";

const poems = ref<Poem[]>([])
const userSearch = ref("")
const favorOnly = ref<boolean>(false)
const refresh = ref(0)

const search = ref<Search>(new Search())
watch(userSearch, () => {
  const newSearch = Search.fromString(userSearch.value)
  if (!newSearch.equals(search.value)) {
    search.value = newSearch
  }
})

async function persist() {
  const platform = Capacitor.getPlatform()
  if (platform === 'web') {
    await sqliteConnection.saveToStore(PoemDataSource.options.database as string);
  }

  refresh.value += 1
}

watch([favorOnly, search, refresh], async () => {
  const conditions: { where: string, parameters?: ObjectLiteral }[] = []

  if (favorOnly.value) {
    conditions.push({where: 'poem.favor = :favor', parameters: {favor: 1}})
  }

  const {no, title, dynasty, author, keys} = search.value
  if (no) {
    conditions.push({where: 'poem.no = :no', parameters: {no}})
  }

  if (title) {
    conditions.push({where: 'poem.title LIKE :title', parameters: {title: `%${title}%`}})
  }

  if (dynasty) {
    conditions.push({where: 'poem.dynasty LIKE :dynasty', parameters: {dynasty: `%${dynasty}%`}})
  }

  if (author) {
    conditions.push({where: 'poem.author LIKE :author', parameters: {author: `%${author}%`}})
  }

  if (keys) {
    for (const [index, key] of keys.entries()) {
      const name = `key${index}`
      const parameters: ObjectLiteral = {}
      parameters[name] = `%${key}%`
      conditions.push({where: `poem.content LIKE :${name}`, parameters})
    }
  }

  if (conditions.length == 0) {
    poems.value = await Poem.find()
  } else {
    const q = PoemDataSource.getRepository(Poem).createQueryBuilder('poem')
    const {where, parameters} = conditions[0]
    q.where(where, parameters)
    for (const {where, parameters} of conditions.slice(1)) {
      q.andWhere(where, parameters)
    }
    poems.value = await q.getMany()
  }
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

async function openAdvancedSearch() {
  await menuController.close()

  const modal = await modalController.create({
    component: AdvanceSearchModal,
    componentProps: {
      search: search.value
    }
  });
  modal.present();

  const {data, role} = await modal.onWillDismiss();

  if (role === 'confirm') {
    userSearch.value = (data as Search).toString()
  }
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

async function msg(message: string, duration = 1500) {
  const toast = await toastController.create({
    message,
    duration,
    position: "middle"
  });
  await toast.present();
}

const IMPORT_EXPORT_PATH = 'poems.json'

async function importPoems() {
  await menuController.close()

  const result = await Filesystem.getUri({
    path: IMPORT_EXPORT_PATH,
    directory: Directory.External,
  });

  const actionSheet = await actionSheetController.create({
    header: '导入将删除所有诗词，是否继续？',
    subHeader: `将从 ${result.uri} 导入`,
    buttons: [
      {
        text: '导入',
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
  if (role !== 'destructive') {
    return
  }

  try {
    const content = await Filesystem.readFile({
      path: IMPORT_EXPORT_PATH,
      directory: Directory.External,
      encoding: Encoding.UTF8,
    });

    const userPoems = JSON.parse(content.data) as UserPoem[]
    const poemRepository = PoemDataSource.getRepository(Poem)
    await poemRepository.clear()

    const poems = userPoems.map(userPoem => Poem.fromUserPoem(userPoem))
    await poemRepository.manager.transaction(async (mgr) => {
      await mgr.save(poems)
    })

    await persist()

    await msg(`导入成功`)
  } catch (e) {
    await msg(`导入失败：${e}`)
  }
}

async function exportPoems() {
  await menuController.close()

  const result = await Filesystem.getUri({
    path: IMPORT_EXPORT_PATH,
    directory: Directory.External,
  });

  const actionSheet = await actionSheetController.create({
    header: '即将导出，是否继续？',
    subHeader: `将导出到 ${result.uri}`,
    buttons: [
      {
        text: '导出',
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
  if (role !== 'destructive') {
    return
  }

  const poems = await Poem.find()
  const userPoems = poems.map(poem => poem.toUserPoem())

  await Filesystem.writeFile({
    path: IMPORT_EXPORT_PATH,
    data: JSON.stringify(userPoems),
    directory: Directory.External,
    encoding: Encoding.UTF8,
    recursive: true,
  })

  await msg('导出成功')
}

async function onPoemClick(poem: Poem) {
  const modal = await modalController.create({
    component: PoemDetailModal,
    componentProps: {
      poem: poem,
      search: search.value,
    }
  });
  modal.present();

  await modal.onWillDismiss();
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
