<script setup lang="ts">

import { NDrawer, NDrawerContent } from 'naive-ui';

import PasswordCard from './PasswordCard.vue';
import CacheCard from './CacheCard.vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: true,
    },
    width: {
        type: Number,
        default: 400,
    },
    placement: {
        type: String,
        default: "right",
    }
});

const emit = defineEmits(['update:show']);
const showVal = ref(props.show);
const handleUpdate = () => emit('update:show', showVal.value);

</script>

<template>
    <n-drawer
        placement="right"
        :width="props.width"
        :auto-focus="false"
        :show="props.show"
        :on-update:show="handleUpdate"
        close-on-esc
    >
        <n-drawer-content title="选项">
            <CacheCard class="mb-4" />
            <PasswordCard />
        </n-drawer-content>
    </n-drawer>
</template>