<script setup lang="ts">
import { NAvatar, NCard, NForm, NFormItem, NButton, NInput, NRadioButton, NRadioGroup, NIcon } from 'naive-ui';

import { SettingsOutline, ChevronBackOutline } from '@vicons/ionicons5';

import { useThemeVars } from 'naive-ui';
const themeVars = useThemeVars()

import { usePreferredDark } from '@vueuse/core';
import WavesBackground from '~/components/Waves.vue';
const prefersDark = usePreferredDark();

const showOptions = ref(true);

const toggleShowOptions = () => {
  showOptions.value = !showOptions.value;
}

import { useGlobalStore } from '~/stores/global';
const { backendUrl, setBackendUrl } = useGlobalStore();

const prodUrl = import.meta.env.VITE_PROD_URL;

const devUrl = import.meta.env.VITE_DEV_URL;

const setDevEnv = () => {
  console.log(devUrl);
  setBackendUrl(devUrl);
  console.log(backendUrl);
}

const setProdEnv = () => {
  console.log(prodUrl);
  setBackendUrl(prodUrl);
  console.log(backendUrl);
}

</script>

<template>
  <!-- center everything -->
  <div>
    <div
      class="h-100vh flex justify-center items-center"
    >
      <n-card class="login-card">
        <img
          class="logo"
          :src="prefersDark? '/shuwashuwa-dark.png' : '/shuwashuwa-light.png'"
          alt="Shuwashuwa"
        >

        <n-button
          strong
          secondary
          circle
          type="primary"
          @click="toggleShowOptions"
          class="options-button"
        >
          <n-icon>
            <chevron-back-outline v-if="showOptions" />
            <settings-outline v-else />
          </n-icon>
        </n-button>
    
        <form
          class="flex flex-col justify-center items-center"
          v-if="!showOptions"
        >
          <n-input
            placeholder="用户名"
            type="text"
            class="my-2.5 text-center"
          />
          <n-input
            placeholder="密码"
            type="password"
            class="my-2.5 text-center"
          />
          <n-button
            style="width: 100%"
            type="primary"
            class="mt-2.5"
          >
            登录
          </n-button>
        </form>

        <div
          class="flex flex-col justify-center items-center"
          v-else
        >
          <n-radio-group
            name="envselector"
            class="my-2.5 text-center w-full"
          >
            <n-radio-button
              value="production"
            >
              生产环境
            </n-radio-button>
            <n-radio-button
              value="development"
              :checked="backendUrl.value === devUrl"
              @click="setDevEnv"
            >
              测试环境
            </n-radio-button>
            <n-radio-button
              value="custom"
            >
              自定义
            </n-radio-button>
          </n-radio-group>

          <n-input
            placeholder="自定义域名"
            type="text"
            class="my-2.5 text-center input-custom"
          />
        </div>
      </n-card>
    </div>
    <waves-background
      :color="themeVars.primaryColor"
      class="w-100vw"
    />
  </div>
</template>

<style scoped>
.login-card {
  @apply m-auto;
  width: 300px;
  overflow: visible;
}

.login-form {
  @apply flex flex-col justify-center items-center;
}

.logo {
  @apply relative mx-auto flex-none;
  top: -70px; /* 20px padding */
  max-width: 100px;
  margin-bottom: -50px;
}

.options-button {
  @apply relative m-0 flex-none;
  top: -55px;
  margin-bottom: -55px;
}

.input-custom {
  max-width: 242px;
}
</style>