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
