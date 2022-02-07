<script setup lang="ts">

import { NDrawer, NDrawerContent, NButton, NPopconfirm, NIcon, NText, NImage } from 'naive-ui';
import { useThemeVars } from 'naive-ui';
import { usePreferredDark } from '@vueuse/core';

import PasswordCard from './optionpanel/PasswordCard.vue';
import CacheCard from './optionpanel/CacheCard.vue';

import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

import { HomeOutline, PeopleOutline, ListOutline, SettingsOutline, LogOutOutline, StatsChartOutline } from '@vicons/ionicons5';
import { Home, UserMultiple, List, Settings, Logout, ChartRiver } from '@vicons/carbon';
import Activity from '~/pages/activity/index.vue';

const themeVars = useThemeVars();
console.log(themeVars);

/* logout */
const router = useRouter();
const userStore = useUserStore();
const doLogout = async () => {
    userStore.clear();
    await router.push('/login');
}

/* showOptions */
const showOptions = ref(false);
const doShowOptions = () => {
    showOptions.value = true;
}

const isCurrentPage = (name: string) => {
    return router.currentRoute.name === name;
}

</script>

<template>
    <div class="header-container">
        <!-- logo -->
        <div class="header-logo">
            <img src="/shuwashuwa-square.webp" />
            <n-text> Shuwashuwa </n-text>
        </div>

        <!-- navbar -->
        <nav class="header-nav">
            <router-link class="header-btn" to="/" title="主页">
                <n-icon class="icon-btn" size="24">
                    <home />
                </n-icon>
                主页
            </router-link>

            <router-link class="header-btn" to="/activity" title="活动">
                <n-icon class="icon-btn" size="24">
                    <list />
                </n-icon>
                活动
            </router-link>

            <router-link class="header-btn" to="/admin" title="管理员">
                <n-icon class="icon-btn" size="24">
                    <user-multiple />
                </n-icon>
                管理员
            </router-link>

            <router-link class="header-btn" to="/stats" title="数据">
                <n-icon class="icon-btn" size="24">
                    <chart-river />
                </n-icon>
                <n-text class="text-btn">数据</n-text>
            </router-link>

            <!-- options -->
            <div class="header-btn" @click="doShowOptions">
                <n-icon class="icon-btn" size="24">
                    <settings />
                </n-icon>
                <n-text class="text-btn">选项</n-text>
            </div>

            <!-- logout -->
            <n-popconfirm
                @positive-click="doLogout"
                placement="bottom"
                positive-text="退出"
                negative-text="取消"
            >
                <template #trigger>
                    <div class="header-btn">
                        <n-icon class="icon-btn" size="24">
                            <LogOutOutline />
                        </n-icon>
                        退出
                    </div>
                </template>
                确定要退出登录吗？
            </n-popconfirm>
        </nav>

        <n-drawer placement="right" v-model:show="showOptions" :auto-focus="false" width="400">
            <n-drawer-content title="选项">
                <CacheCard class="mt-1 mb-5" />
                <PasswordCard />
            </n-drawer-content>
        </n-drawer>
    </div>
</template>

<style scoped>
.header-container {
    @apply flex justify-between items-center;
    color: v-bind(themeVars.textColor1);
    background-color: v-bind(themeVars.cardColor);
}

.header-logo {
    @apply flex justify-between items-center;
    width: 24px;
    margin: 10px;
}

.header-nav {
    @apply flex justify-center items-center;
    font-size: 16px;
}

.header-btn {
    @apply flex justify-center items-center mx-1;
    padding: 10px;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    align-self: center;
}

.header-btn:hover,
.header-btn:focus {
    border-bottom: 2px solid;
    color: v-bind(themeVars.primaryColor);
}

.icon-btn {
    @apply mr-1.5;
    height: 24px;
    color: inherit;
}

.text-btn {
    @apply ml-1;
    color: inherit;
}
</style>