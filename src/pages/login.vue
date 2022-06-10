<script setup lang="ts">
import { NCard, NButton, NInput, NRadioButton, NRadioGroup, NIcon } from 'naive-ui';

import { SettingsOutline, ChevronBackOutline } from '@vicons/ionicons5';

import { useGlobalStore } from '~/stores/global';


import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { parseError } from '~/composables/error';

import { useHead } from '@vueuse/head';

/* wave background */
import WavesBackground from '~/components/Waves.vue';

import { login } from '~/api/login';

/* primary color */
import { useThemeVars } from 'naive-ui';
const themeVars = useThemeVars()

useHead({
  title: '登录 | 修哇修哇'
})

/* dark mode */
const prefersDark = usePreferredDark();

/* option / login panel */
const showOptions = ref(false);
const toggleShowOptions = () => {
  showOptions.value = !showOptions.value;
}

/* options */
const globalStore = useGlobalStore();
const setProdUrl = () => globalStore.setProdUrl();
const setDevUrl = () => globalStore.setDevUrl();
const setCustomState = () => globalStore.env = 'custom';

/* login */
const username = ref('');
const password = ref('');

const router = useRouter();
const message = useMessage();

const doLogin = () => {
  if (username.value && password.value) {
    login(username.value, password.value)
      .then(() => {
        message.success('登录成功');
        // delay 600ms to make sure the message is shown
        setTimeout(() => {
          // if previous page is login page, redirect to home page
          if (router.currentRoute.value.name === 'login') {
            router.push('/');
          }
          // else redirect to previous page
          else {
            router.back();
          }
        }, 600);
      })
      .catch(error => {
        message.error(parseError(error).message);
      });
  }
}
</script>

<template>
  <!-- center everything -->
  <div>
    <div class="h-100vh flex justify-center items-center">
      <n-card class="login-card">
        <img
          class="logo"
          :src="prefersDark ? '/shuwashuwa-dark.png' : '/shuwashuwa-light.png'"
          alt="Shuwashuwa"
        />

        <n-button
          quaternary
          circle
          type="primary"
          size="small"
          @click="toggleShowOptions"
          class="options-button"
        >
          <n-icon>
            <chevron-back-outline v-if="showOptions" />
            <settings-outline v-else />
          </n-icon>
        </n-button>

        <form class="flex flex-col justify-center items-center" v-if="!showOptions">
          <n-input
            placeholder="用户名"
            type="text"
            class="my-2.5 text-center"
            v-model:value="username"
          />
          <n-input
            placeholder="密码"
            type="password"
            class="my-2.5 text-center"
            v-model:value="password"
            @keypress="e => e.key === 'Enter' && doLogin()"
          />
          <n-button
            style="width: 100%"
            type="primary"
            class="mt-2.5"
            @click="doLogin"
            :disabled="!username || !password"
          >登录</n-button>
        </form>

        <div class="flex flex-col justify-center items-center" v-else>
          <n-radio-group name="envselector" class="my-2.5 text-center w-full" :value="globalStore.env">
            <n-radio-button value="prod" @click="setProdUrl">生产环境</n-radio-button>
            <n-radio-button value="dev" @click="setDevUrl">测试环境</n-radio-button>
            <n-radio-button value="custom" @click="setCustomState">自定义</n-radio-button>
          </n-radio-group>

          <n-input
            placeholder="自定义域名"
            type="text"
            class="my-2.5 text-center input-custom"
            :disabled="globalStore.env !== 'custom'"
            v-model:value="globalStore.backendUrl"
          />
        </div>
      </n-card>
    </div>
    <waves-background :color="themeVars.primaryColor" class="w-100vw" />
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
  @apply relative mx-auto;
  top: -70px; /* 20px padding */
  max-width: 100px;
  margin-bottom: -50px;
  flex-basis: 100%;
}

.options-button {
  @apply absolute top-0 left-0;
  margin: 24px;
}

.input-custom {
  /* align manually */
  max-width: 242px;
}
</style>

<route lang="yaml">
meta:
  layout: login
</route>