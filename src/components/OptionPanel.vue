<script setup lang="ts">

import { NDrawer, NDrawerContent } from 'naive-ui';

import PasswordCard from './optionpanel/PasswordCard.vue';
import CacheCard from './optionpanel/CacheCard.vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: true,
    },
    width: {
        type: Number,
        default: 400,
    },
});

</script>

<template>
    <n-drawer placement="right" :width="props.width" :auto-focus="false">
        <n-drawer-content title="选项">
            <CacheCard class="mb-4"/>
            <PasswordCard />
        </n-drawer-content>
    </n-drawer>
</template>