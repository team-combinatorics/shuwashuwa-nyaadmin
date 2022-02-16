<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'
  import { zhCN, dateZhCN } from 'naive-ui'

// auto-detect dark theme support
const prefersDark = usePreferredDark()

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components

const icon = computed(() => {
    return prefersDark.value ? '/shuwashuwa-text-dark.png': '/shuwashuwa-text-light.png'
})

useHead({
  title: '修哇修哇',
  meta: [
    {
      property: 'og:locale:alternate',
      content: 'zh',
      key: 'zh',
    },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: icon},
  ],
})
</script>


<template>
  <n-config-provider
    :locale="zhCN" 
    :date-locale="dateZhCN"
    :theme="prefersDark ? darkTheme : null"
  >
    <router-view />
  </n-config-provider>
</template>

<style>

/* overriding naive-ui's default styles */

.n-card.chart-card > .n-card-header {
    @apply p-0;
}

.table-header {
    @apply flex justify-between items-center;
}

.n-h.table-header-text.n-h--prefix-bar::before {
    background-color: #555;
}

.n-h:first-child.table-header-text {
    @apply flex items-center ml-2;
    margin: 15px;
    margin-left: 23px;
    flex: none;
}

.table-header-btn {
    @apply flex items-center;
    margin: 15px;
    gap: 15px;
    flex: none;
}

.drawer-btn {
    width: 100%;
    text-align: center;
}

.text-my-0 {
    @apply my-0;
}
</style>
