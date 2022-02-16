<script setup lang="ts">

// auto-detect dark theme support
import { usePreferredDark } from '@vueuse/core'
import { NConfigProvider, darkTheme } from 'naive-ui'
import { NLayout, NNotificationProvider, NMessageProvider, NLoadingBarProvider } from 'naive-ui';

const prefersDark = usePreferredDark()

</script>

<template>
<n-config-provider :theme="prefersDark ? darkTheme : null">
  <n-layout>
    <n-loading-bar-provider>
    <n-notification-provider>
    <n-message-provider>
      <Header />
      <div class="default-layout">
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
  height: 100vh;
}

/* really wide screens */
@media screen and (min-width: 1250px) {
  .default-layout {
        width: 80%;
        margin: auto;
    }
}

</style>
