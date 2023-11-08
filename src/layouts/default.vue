<script setup lang="ts">

// auto-detect dark theme support
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'
import { NLayout, NNotificationProvider, NMessageProvider, NLoadingBarProvider } from 'naive-ui';

const prefersDark = usePreferredDark()

</script>

<template>
<n-config-provider :theme="prefersDark ? darkTheme : null">
  <n-layout class="default-layout">
    <n-loading-bar-provider>
    <n-notification-provider>
    <n-message-provider>
      <Header />
      <div class="layout-content">
        <router-view />
      </div>
    </n-message-provider>
    </n-notification-provider>
    </n-loading-bar-provider>

    <div class="shadow-meta">
      <!-- Layout: Default -->
    </div>
    </n-layout>
</n-config-provider>
</template>


<style>

.default-layout {
  min-height: 100vh;
  padding-bottom: 1em;
}

/* really wide screens */
@media screen and (min-width: 1250px) {
  .layout-content {
        width: 80%;
        margin: auto;
    }
}

</style>
