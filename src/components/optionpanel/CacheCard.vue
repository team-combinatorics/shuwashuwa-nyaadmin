<script setup lang="ts">
import { NCard, NButton, NIcon, NText, NInputNumber, NPopconfirm } from 'naive-ui';
import { SaveOutline, TrashBinOutline } from '@vicons/ionicons5';


import { handleError } from '~/composables/error';

import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';

import { getCacheSize, deleteCache } from '~/api/cache';

const router = useRouter();
const message = useMessage();

/* cache */
const cacheSize = ref(-1);

const doGetCacheSize = async () => {
    try {
        const size = await getCacheSize();
        cacheSize.value = size;
    } catch (e) {
        handleError(e, message, router)
    }
};

doGetCacheSize();

const cacheBeforeDays = ref(30);

const doDeleteCache = async () => {
    try {
        await deleteCache(cacheBeforeDays.value);
        message.success('清除缓存成功');
        doGetCacheSize();
    } catch (e) {
        handleError(e, message, router);
    }
}

</script>

<template>
    <n-card title="图片存储">
        <div class="flex justify-between items-center">
            <div class="flex justify-between items-center">
                <n-icon size="20" class="mr-3">
                    <SaveOutline />
                </n-icon>
                <n-text class="text-size-1.25rem">
                    当前存储的图片
                </n-text>
            </div>
            <n-text class="text-size-1.25rem">{{ cacheSize }} 张</n-text>
        </div>

        <template #action>
            <div class="mb-10px">清除 {{ cacheBeforeDays }} 天前上传的图片</div>
            <div class="flex flex-row justify-between">
                <n-input-number
                    min="0"
                    placeholder="清除N天前的图片"
                    v-model:value="cacheBeforeDays"
                    step="5"
                    class="cache-input"
                />
                <n-popconfirm @positive-click="doDeleteCache" positive-text="确定" negative-text="取消">
                    <template #trigger>
                        <n-button secondary class="cache-btn">
                            <n-icon size="24" class="mr-2">
                                <TrashBinOutline />
                            </n-icon>清除
                        </n-button>
                    </template>
                    数据一去不复还，确定要清除 {{ cacheBeforeDays }} 天前的图片吗?
                </n-popconfirm>
            </div>
        </template>
    </n-card>
</template>

<style scoped>

.cache-btn {
    @apply flex-none;
}
</style>