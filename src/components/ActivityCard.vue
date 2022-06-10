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
            <!-- make it look nice on small screens -->
            <n-h3 prefix="bar" align-text class="flex items-center text-my-0 pr-2" :type="activityType">
                {{ props.activity.activityName }}
            </n-h3>
        </template>
        <template #header-extra>
            <div class="text-right">
                {{ props.activity.location }}
            </div>
        </template>

        <div class="activity-card-content">
            <time >{{ props.activity.startTime }}</time>
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
    @apply flex justify-between items-center text-center;
    width: 100%;
}

@media screen and (max-width: 768px) {
    .activity-card .n-card-header {
        @apply flex-col;
    }

    .activity-card .n-card-header__extra .text-right {
        text-align: center;
        margin-top: 20px;
    }
}
</style>