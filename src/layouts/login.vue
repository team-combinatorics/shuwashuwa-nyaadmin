<script setup lang="ts">

// auto-detect dark theme support
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'
import { NLayout, NNotificationProvider, NMessageProvider } from 'naive-ui';

const prefersDark = usePreferredDark()

</script>

<template>
  <n-config-provider :theme="prefersDark ? darkTheme : null">
    
    <n-layout class="default-layout">
      <n-notification-provider>
      <n-message-provider>
        <router-view />
      </n-message-provider>
      </n-notification-provider>
    </n-layout>

    <div class="shadow-meta">
      <!-- Layout: Login -->
    </div>
  </n-config-provider>
</template>
