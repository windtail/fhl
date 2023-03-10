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
          <ion-item button :detail=false @click="initPoem">
            <ion-icon :icon="enterOutline" slot="start"></ion-icon>
            初始化
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>导入导出（仅测试了坚果云）</ion-label>
          </ion-item-divider>

          <ion-item button :detail=false @click="importPoems">
            <ion-icon :icon="enterOutline" slot="start"></ion-icon>
            导入
          </ion-item>
          <ion-item button :detail=false @click="exportPoems">
            <ion-icon :icon="exitOutline" slot="start"></ion-icon>
            导出
          </ion-item>
          <ion-item button :detail=false @click="configImportExport">
            <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
            设置
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
      <ion-list ref="mainList">

        <ion-item-sliding v-for="(poem, index) in poems" :key="poem.id">
          <ion-item>
            <ion-label button @click="onPoemClick(poem)">
              {{ poem.no }}. {{ poem.title }} ({{ poem.dynasty }} {{ poem.author }})
              <template v-if="search.keys">
                <br/>
                <span v-html="poem.searchPreview"></span>
              </template>
            </ion-label>
            <ion-buttons slot="end">
              <ion-button @click="onPoemToggleFavorClick(poem)">
                <ion-icon :icon="poem.favor ? star : starOutline" slot="icon-only"/>
              </ion-button>
            </ion-buttons>
          </ion-item>

          <ion-item-options>

            <ion-item-option color="danger" @click="onPoemDeleteClick(index, poem)">
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
  IonItemGroup,
  IonItemDivider,
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
  loadingController,
  alertController,
} from '@ionic/vue';
import {ref, watch} from 'vue';
import {
  add,
  enterOutline,
  exitOutline,
  pencil,
  searchOutline,
  settingsOutline,
  star,
  starOutline,
  trash
} from 'ionicons/icons';
import {Preferences} from '@capacitor/preferences';

import PoemModal from '@/components/PoemModal.vue';
import PoemDetailModal from "@/components/PoemDetailModal.vue";

import {Search} from '@/types/search.types';
import {UserPoem} from "@/types/userpoem.types";
import {Poem} from '@/entity/Poem'
import PoemDataSource from '@/data-source';
import sqliteConnection from '@/database';
import {Capacitor, HttpResponse} from '@capacitor/core';
import AdvanceSearchModal from "@/components/AdvanceSearchModal.vue";
import {ObjectLiteral} from "typeorm";
import {Segment} from "@/entity/Segment";
import {CapacitorHttp} from '@capacitor/core';
import myInitPoems from './poems.json';
import {ImportExportConfig} from "@/types/io.types";
import IoConfigModal from "@/components/IoConfigModal.vue";

const mainList = ref(null)

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

async function persist(refreshMode: "always" | "if-searching" | "never" = "always") {
  const platform = Capacitor.getPlatform()
  if (platform === 'web') {
    await sqliteConnection.saveToStore(PoemDataSource.options.database as string);
  }

  if (refreshMode == "always") {
    refresh.value += 1
  } else if (refreshMode == "if-searching") {
    if (!search.value.empty) {
      refresh.value += 1
    }
  }
}

watch([favorOnly, search, refresh], async () => {
  const loading = await loadingController.create({
    message: '正在加载...',
  });
  await loading.present();

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
    q.leftJoinAndSelect(
        "poem.segments",
        "segment"
    )
    const {where, parameters} = conditions[0]
    q.where(where, parameters)
    for (const {where, parameters} of conditions.slice(1)) {
      q.andWhere(where, parameters)
    }
    q.orderBy("segment.id", "ASC")
    const poems_ = await q.getMany()
    if (keys) {
      for (const p of poems_) {
        p.updateSearchPreview(keys)
        console.log("search preview", p.searchPreview)
      }
    }

    poems.value = poems_
  }

  await loading.dismiss()
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
  await modal.present();

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
  await modal.present();

  const {data, role} = await modal.onWillDismiss();

  if (role === 'confirm') {
    const poem = data as Poem
    if (poem.no == 0) {
      poem.no = await getNextNo()
    }
    poem.generateSegments()

    await poem.save()
    await persist()
  }
}

async function initPoem() {
  await menuController.close()

  const actionSheet = await actionSheetController.create({
    header: '初始化将删除所有诗词，是否继续？',
    buttons: [
      {
        text: '初始化',
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

  const loading = await loadingController.create({
    message: '正在初始化...',
  });
  await loading.present();

  try {
    const userPoems = myInitPoems as UserPoem[]
    const poemRepository = PoemDataSource.getRepository(Poem)
    await poemRepository.clear()

    const poems = userPoems.map(userPoem => Poem.fromUserPoem(userPoem))
    await poemRepository.manager.transaction(async (mgr) => {
      await mgr.save(poems)
    })

    await persist()

    await loading.dismiss()
    await msg(`导入成功`)
  } catch (e) {
    await loading.dismiss()
    await msg(`导入失败：${e}`)
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

class IoConfig implements ImportExportConfig {
  password: string;
  url: string;
  username: string;

  constructor() {
    this.username = ""
    this.password = ""
    this.url = "https://dav.jianguoyun.com/dav/poems/poems.json"
  }

  static WEBDAV_KEY = "webdav"

  async load() {
    const result = await Preferences.get({key: IoConfig.WEBDAV_KEY})
    if (result.value) {
      const config = JSON.parse(result.value) as ImportExportConfig

      this.username = config.username
      this.password = config.password
      this.url = config.url
    }
  }

  async doStoreConfig(config: ImportExportConfig) {
    await Preferences.set({key: IoConfig.WEBDAV_KEY, value: JSON.stringify(config)})
  }

  async store() {
    await this.doStoreConfig(this)
  }

  authorization(): string {
    return "Basic " + btoa(`${this.username}:${this.password}`)
  }
}


class ImportExport {

  static async import_(config: IoConfig) {
    const response: HttpResponse = await CapacitorHttp.get({
      url: config.url,
      headers: {Authorization: config.authorization()}
    });

    const data = JSON.parse(response.data)

    const userPoems = data as UserPoem[]
    const poemRepository = PoemDataSource.getRepository(Poem)
    await poemRepository.clear()

    const poems = userPoems.map(userPoem => Poem.fromUserPoem(userPoem))
    await poemRepository.manager.transaction(async (mgr) => {
      await mgr.save(poems)
    })

    await persist()
  }

  static async export_(config: IoConfig) {
    const poems = await Poem.find()
    const userPoems = poems.map(poem => poem.toUserPoem())

    await CapacitorHttp.put({
      url: config.url,
      data: userPoems,
      headers: {
        "Content-Type": "application/json",
        Authorization: config.authorization()
      }
    });
  }

}

async function importPoems() {
  await menuController.close()
  const config = new IoConfig()
  await config.load()

  const actionSheet = await actionSheetController.create({
    header: '导入将删除所有诗词，是否继续？',
    subHeader: `将从 ${config.url} 导入`,
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

  const loading = await loadingController.create({
    message: '正在导入...',
  });
  await loading.present();

  try {
    await ImportExport.import_(config)

    await loading.dismiss()
    await msg("导入成功")
  } catch (e) {
    await loading.dismiss()
    await msg(`导入失败：${e}`)
  }
}

async function exportPoems() {
  await menuController.close()
  const config = new IoConfig()
  await config.load()

  const actionSheet = await actionSheetController.create({
    header: '即将导出，是否继续？',
    subHeader: `将导出到 ${config.url}`,
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

  const loading = await loadingController.create({
    message: '正在导出...',
  });
  await loading.present();

  try {
    await ImportExport.export_(config)
    await loading.dismiss()
    await msg('导出成功')
  } catch (e) {
    await loading.dismiss()
    await msg(`导出失败：${e}`)
  }
}

async function configImportExport() {
  await menuController.close()

  const config = new IoConfig()
  await config.load()

  const modal = await modalController.create({
    component: IoConfigModal,
    componentProps: {
      config
    }
  });
  await modal.present();

  const {data, role} = await modal.onWillDismiss();

  if (role === 'confirm') {
    await config.doStoreConfig(data as ImportExportConfig)
  }
}

async function onPoemClick(poem: Poem) {
  const modal = await modalController.create({
    component: PoemDetailModal,
    componentProps: {
      poem: poem,
      search: search.value,
    }
  });
  await modal.present();

  await modal.onWillDismiss();
}

async function onPoemDeleteClick(index: number, poem: Poem) {
  await mainList.value.$el.closeSlidingItems()

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
    poems.value.splice(index, 1)
    await persist("never")
  }
}

async function onPoemEditClick(poem: Poem) {
  await mainList.value.$el.closeSlidingItems()

  const modal = await modalController.create({
    component: PoemModal,
    componentProps: {
      titleText: "编辑诗词",
      confirmText: "保存",
      poem: poem,
    }
  });
  await modal.present();

  const {data, role} = await modal.onWillDismiss();

  if (role === 'confirm') {
    poem.syncFromEdited(data as Poem)

    await PoemDataSource
        .getRepository(Segment)
        .createQueryBuilder('segment')
        .delete()
        .from(Segment)
        .where("segment.poemId = :poemId", {poemId: poem.id})
        .execute()

    poem.generateSegments()
    await poem.save()
    await persist("if-searching") // 编辑后可能不再匹配搜索
  }
}

async function onPoemToggleFavorClick(poem: Poem) {
  poem.favor = !poem.favor
  await poem.save()
  await persist("never")
}

</script>

<style scoped>
</style>
