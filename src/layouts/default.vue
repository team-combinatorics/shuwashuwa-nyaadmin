<script setup lang="ts">

// auto-detect dark theme support
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'

const theme = usePreferredDark() ? darkTheme : undefined

</script>

<template>
  <n-config-provider
    :theme="theme"
  >
    <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
      <router-view />
    </main>
  </n-config-provider>
</template>
