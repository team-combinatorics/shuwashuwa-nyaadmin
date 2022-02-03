<script setup lang="ts">

// auto-detect dark theme support
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'
const prefersDark = usePreferredDark()

import { NLayout } from 'naive-ui';

</script>

<template>
  <n-config-provider :theme="prefersDark ? darkTheme : null">
    <n-layout class="default-layout">
      <router-view />
    </n-layout>

    <div class="shadow-meta">
      <!-- Layout: Default -->
    </div>
  </n-config-provider>
</template>
