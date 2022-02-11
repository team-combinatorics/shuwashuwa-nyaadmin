<script setup lang="ts">

import { NCard, NIcon, NH3 } from 'naive-ui';
import { ActivityInfo } from '~/models/activity';
import ActivityCard from './ActivityCard.vue';

import { ListOutline } from '@vicons/ionicons5';

const props = defineProps({
    activities: {
        type: Object as ()=> ActivityInfo[],
        required: true,
    }
})

</script>

<template>
    <div class="showcase-header">
        <div class="activity-logo flex items-center">
            <n-h3 prefix="bar" align-text class="logo-text flex items-center ml-2" type="primary">
                <n-icon class="activity-icon" size="20">
                    <list-outline />
                </n-icon>进行中活动
            </n-h3>
        </div>
    </div>
    <div class="activity-showcase">
        <li v-for="item in props.activities" :key="item.id">
            <ActivityCard :activity="item" />
        </li>
    </div>
</template>

<style scoped>
.showcase-header {
    @apply flex justify-between items-center my-1;
}

.activity-showcase {
    display: flex;
    flex-wrap: wrap;
    justify-content: start;
    list-style-type: none;
    gap: 16px;
}

.activity-logo {
    margin: 15px;
    flex: none;
}

.activity-icon {
    @apply mx-2;
}
</style>

<style> /* overriding styles */
.activity-logo .n-h.n-h--prefix-bar::before {
    background-color: #555;
}
</style>