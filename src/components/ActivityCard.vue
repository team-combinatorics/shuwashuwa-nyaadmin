<script setup lang="ts">

import { NCard, NIcon, NH3 } from 'naive-ui';
import { ActivityInfo } from '~/models/activity';

import { ArrowRight } from '@vicons/carbon';

import { parseDate } from '~/composables/date';

const props = defineProps({
    activity: {
        type: Object as ()=> ActivityInfo,
        required: true,
    }
})

const activityUrl = computed(() => '/activity/' + props.activity.id);

const activityType = computed(() => {
    const act = props.activity;
    if (parseDate(act.endTime) < Date.now()) {
        /* finished */
        return 'warning';
    } else if (parseDate(act.startTime) < Date.now()) {
        /* in progress */
        return 'success';
    } else {
        /* upcoming */
        return 'info'
    }
})

</script>

<template>
    <router-link :to="activityUrl" :title="props.activity.activityName">
        <n-card class="activity-card">
        <template #header>
            <n-h3 prefix="bar" align-text class="logo-text flex items-center ml-2" :type="activityType">
                {{ props.activity.activityName }}
            </n-h3>
        </template>
        <template #header-extra>
            {{ props.activity.location }}
        </template>

        <div class="activity-card-content">
            <time>{{ props.activity.startTime }}</time>
            <n-icon class="mx-1">
                <arrow-right />
            </n-icon>
            <time>{{ props.activity.endTime }}</time>
        </div>
        </n-card>
    </router-link>
</template>

<style>
.activity-card-content {
    @apply flex justify-between items-center;
    width: 100%;
}
</style>