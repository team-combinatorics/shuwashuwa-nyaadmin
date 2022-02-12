<script setup lang="ts">

import { NCard, NIcon, NH3 } from 'naive-ui';
import { ServiceEvent } from '~/models/service';

import { ArrowRight } from '@vicons/carbon';

import { parseDate } from '~/composables/date';

const props = defineProps({
    service: {
        type: Object as ()=> ServiceEvent,
        required: true,
    }
})

const serviceUrl = computed(() => '/activity/' + props.service.serviceEventId);

const serviceType = computed(() => {
    switch (props.service.status) {
        case 0:
            return 'info';
        case 5:
            return 'error';
        case 1:
        case 2:
            return 'warning';
        case 3:
        case 4:
            return 'success';
        default:
            console.log('undefined service status', props.service.status);
            return 'default';
    }
});

</script>

<template>
    <router-link :to="serviceUrl" :title="props.service.serviceEventId">
        <n-card class="activity-card">
        <template #header>
            <n-h3 prefix="bar" align-text class="logo-text flex items-center ml-2" :type="serviceType">
                {{ props.service.serviceEventId }}
            </n-h3>
        </template>
        <template #header-extra>
            {{ props.service.computerModel }}
        </template>

        <div class="activity-card-content">
            <time>{{ props.service.problemSummary }}</time>
            <n-icon class="mx-1">
                <arrow-right />
            </n-icon>
            <time>{{ props.service.volunteerName }}</time>
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