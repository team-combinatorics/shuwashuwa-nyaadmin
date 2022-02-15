<script setup lang="ts">

import type { Ref } from 'vue';
import type { ActivityInfo } from '~/models/activity';

/* wave background */
import WavesBackground from '~/components/Waves.vue';
import ActivityShowcaseVue from '~/components/ActivityShowcase.vue';

/* primary color */
import { useThemeVars, useMessage } from 'naive-ui';

import { parseDate } from '~/composables/date';
import { getActivityList } from '~/api/activity';
import { handleError } from '~/composables/error';

const themeVars = useThemeVars();

const message = useMessage();
const router = useRouter();

const activityList: Ref<ActivityInfo[]> = ref([]);
const activityLoading = ref(false);
const activityListLoading = ref(false);

const incomingActivityList = computed((): ActivityInfo[] => {
    return activityList.value.filter(activity => parseDate(activity.endTime) > Date.now());
})

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

/* get activity list on setup */
getActivityListAsync();

</script>

<template>
    <!-- activity showcase -->
    <div v-if="incomingActivityList.length > 0">
        <ActivityShowcase :activities="incomingActivityList"></ActivityShowcase>
    </div>
    <waves-background :color="themeVars.primaryColor" class="w-100vw" />
</template>