<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components
useHead({
  title: '修哇修哇',
  meta: [
    { name: '修哇修哇', content: '超管平台' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.webp' },
  ],
})

// auto-detect dark theme support
const prefersDark = usePreferredDark()
</script>


<template>
  <n-config-provider
    :theme="prefersDark ? darkTheme : null"
  >
    <router-view />
  </n-config-provider>
</template>
