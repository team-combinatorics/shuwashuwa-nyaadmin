<script setup lang="ts">

import type { Ref } from 'vue';
import type { ActivityInfo } from '~/models/activity';

/* wave background */
import WavesBackground from '~/components/Waves.vue';
import Header from '~/components/Header.vue';
import ActivityCard from '~/components/ActivityCard.vue';

/* primary color */
import { useThemeVars, useMessage } from 'naive-ui';
import { NButton, NGi, NGrid, NIcon } from 'naive-ui';

import { getActivityList } from '~/api/activity';
import { handleError } from '~/composables/error';

import { useSwipe } from '@vueuse/core';

import { ChevronBack, ChevronForward } from '@vicons/ionicons5';
import { Edit as EditIcon, GroupPresentation, ToolKit as ToolKitIcon, ChartRiver } from '@vicons/carbon';

const themeVars = useThemeVars();

const message = useMessage();
const router = useRouter();

const activityList: Ref<ActivityInfo[]> = ref([]);
const activityListLoading = ref(false);

const currentActivityIndex: Ref<number> = ref(0);
const currentActivity = computed(() => activityList.value[currentActivityIndex.value]);

const goPrevActivity = () => currentActivityIndex.value === 0 ? null : currentActivityIndex.value--;
const prevActivityDisabled = computed(() => currentActivityIndex.value === 0);
const goNextActivity = () => currentActivityIndex.value === activityList.value.length - 1 ? null : currentActivityIndex.value++;
const nextActivityDisabled = computed(() => currentActivityIndex.value === activityList.value.length - 1);

const getActivityListAsync = async () => {
    if (activityListLoading.value) return;  /* skip repeated requests */
    activityListLoading.value = true;
    try {
        const list = await getActivityList();
        activityList.value = list;
        console.log('activity list refreshed', list);
        activityList.value.sort((a, b) => b.id - a.id);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityListLoading.value = false;
    }
}

/* swipe */
const swipeRef = ref(null);
const { direction } = useSwipe(swipeRef);

watch (direction, (newVal) => {
    console.log('swipe', newVal);
  if (newVal === "LEFT") {
    goNextActivity();
  } else if (newVal === "RIGHT") {
    goPrevActivity();
  }
});

/* shortcuts */
const editUrl = computed(() => '/activity?activity=' + currentActivity.value.id);
const goToEdit = () => router.push(editUrl.value);

const activityUrl = computed(() => '/activity/' + currentActivity.value.id);
const goToActivity = () => router.push(activityUrl.value);

const serviceUrl = computed(() => '/service?activity=' + currentActivity.value.id);
const goToService = () => router.push(serviceUrl.value);

const statsUrl = computed(() => '/stats?activity=' + currentActivity.value.id);
const goToStats = () => router.push(statsUrl.value);

/* get activity list on setup */
getActivityListAsync();

</script>

<template>
    <Header />
    <!-- activity showcase -->
    <section class="h-80vh flex items-center justify-center">
        <div v-if="currentActivity" class="activity-showcase" ref="swipeRef">
            <div>
                <n-button
                    @click="goPrevActivity"
                    quaternary
                    circle
                    size="large"
                    :disabled="prevActivityDisabled"
                    class="mr-5"
                >
                    <n-icon size="32">
                        <chevron-back />
                    </n-icon>
                </n-button>
            </div>
            <div>
                <ActivityCard :activity="currentActivity" />
                <n-grid cols="1 300:2 600:4" x-gap="15" y-gap="15" class="p-5 pt-3vh">
                    <n-gi class="showcase-btn">
                        <n-button @click="goToEdit" quaternary size="large">
                            <template #icon>
                                <n-icon>
                                    <edit-icon />
                                </n-icon>
                            </template>
                            编辑活动
                        </n-button>
                    </n-gi>
                    <n-gi class="showcase-btn">
                        <n-button @click="goToActivity" quaternary size="large">
                            <template #icon>
                                <n-icon>
                                    <group-presentation />
                                </n-icon>
                            </template>
                            活动页面
                        </n-button>
                    </n-gi>
                    <n-gi class="showcase-btn">
                        <n-button @click="goToService" quaternary size="large">
                            <template #icon>
                                <n-icon>
                                    <tool-kit-icon />
                                </n-icon>
                            </template>
                            查看维修
                        </n-button>
                    </n-gi>
                    <n-gi class="showcase-btn">
                        <n-button @click="goToStats" quaternary size="large">
                            <template #icon>
                                <n-icon>
                                    <chart-river />
                                </n-icon>
                            </template>
                            统计数据
                        </n-button>
                    </n-gi>
                </n-grid>
            </div>
            <div>
                <n-button
                    @click="goNextActivity"
                    quaternary
                    circle
                    size="large"
                    :disabled="nextActivityDisabled"
                    class="ml-5"
                >
                    <n-icon size="32">
                        <chevron-forward />
                    </n-icon>
                </n-button>
            </div>
        </div>
        <bounce-loading v-if="activityListLoading" :color="themeVars.primaryColor" />
    </section>

    <waves-background :color="themeVars.primaryColor" class="w-100vw" />
</template>

<style scoped>
.activity-showcase {
    @apply flex justify-center items-center;
    height: 80vh;
    gap: 3vh;
}

.showcase-btn {
    @apply flex justify-center items-center;
}
</style>

<route lang="yaml">
meta:
    layout: login
</route>