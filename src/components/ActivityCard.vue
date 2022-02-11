<script setup lang="ts">

import { NCard, NIcon, NH3 } from 'naive-ui';
import { ActivityInfo } from '~/models/activity';

const props = defineProps({
    activity: {
        type: Object as ()=> ActivityInfo,
        required: true,
    }
})

const activityUrl = computed(() => '/activity/' + props.activity.id);

</script>

<template>
    <router-link :to="activityUrl" :title="props.activity.activityName">
        <n-card class="activity-card" title="props.activity.activityName">
        </n-card>
    </router-link>
</template>

<style>
</style>