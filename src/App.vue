<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components
useHead({
  title: '修哇修哇',
  meta: [
    { name: 'description', content: 'Opinionated Vite Starter Template' },
  ],
})

// auto-detect dark theme support
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'

const prefersDark = usePreferredDark()

</script>

<template>
  <n-config-provider
    :theme="prefersDark ? darkTheme : null"
  >
    <router-view />
  </n-config-provider>
</template>
