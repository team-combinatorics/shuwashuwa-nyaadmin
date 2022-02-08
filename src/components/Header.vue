<script setup lang="tsx">

import { NSpace, NButton, NPopconfirm, NIcon, NText, NLayoutHeader, NMenu } from 'naive-ui';
import { useThemeVars } from 'naive-ui';
import { usePreferredDark } from '@vueuse/core';

import { RouterLink } from 'vue-router';

import PasswordCard from './OptionPanel/PasswordCard.vue';
import CacheCard from './OptionPanel/CacheCard.vue';

import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

import { HomeOutline, PeopleOutline, ListOutline, SettingsOutline, LogOutOutline, StatsChartOutline } from '@vicons/ionicons5';
import { Home, UserMultiple, List, Settings, Logout, ChartRiver } from '@vicons/carbon';
import Activity from '~/pages/activity/index.vue';

import OptionPanel from './OptionPanel/index.vue';

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


const renderIcon = (icon: any) => {
    return () => h(NIcon, { default: () => h(icon) })
}

const renderRouterLink = (to: string, title: string) => {
    return () => h(
        RouterLink,
        { to: to, title: title },
        { default: () => title }
    )
}

// default value is current route
const currentRouteName = router.currentRoute.value.name as string;

const navOptions = [
    {
        label: renderRouterLink('/', '首页'),
        key: 'home',
        icon: renderIcon(HomeOutline),
    },
    {
        label: renderRouterLink('/activity', '活动'),
        key: 'activity',
        icon: renderIcon(ListOutline),
    },
    {
        label: renderRouterLink('/admin', '管理员'),
        key: 'admin',
        icon: renderIcon(PeopleOutline)
    },
    {
        label: renderRouterLink('/service', '维修单'),
        key: 'service',
        icon: renderIcon(HomeOutline)
    },
    {
        label: renderRouterLink('/stats', '统计'),
        key: 'stats',
        icon: renderIcon(StatsChartOutline)
    },
]

// make it an animation
const btnVal = ref(null);
const onBtnUpdate = () => {
    setTimeout(() => {
        btnVal.value = null;
    }, 300);
}

const btnOptions = [

    {  
        label: () => h(NButton, { text: true, onClick: doShowOptions }, { default: () => '选项' }),
        key: 'on_settings',
        icon: renderIcon(SettingsOutline)
    },
    {
        label: () => h(NButton, { text: true, onClick: doShowOptions }, { default: () => '选项' }),
        key: 'on_aaa',
        icon: renderIcon(SettingsOutline),
    }
]

</script>

<template>
    <n-layout-header class="header-container">
        <!-- logo -->
        <router-link title="首页" to="/">
            <div class="header-logo">
                <img src="/shuwashuwa-text-light.png" />
                <n-text>修哇修哇超管控制台</n-text>
            </div>
        </router-link>

        <!-- navbar -->
        <n-menu :options="navOptions" :default-value="currentRouteName" class="header-nav"/>

        <!-- buttons -->
        <div class="header-btn-container">

            <!-- options -->
            <n-button text @click="doShowOptions" class="header-btn">
                <template #icon>
                    <n-icon class="icon-btn">
                        <settings />
                    </n-icon>
                </template>
                选项
            </n-button>

            <!-- logout -->
            <n-popconfirm
                @positive-click="doLogout"
                placement="bottom"
                positive-text="退出"
                negative-text="取消"
            >
                <template #trigger>
                    <n-button text class="header-btn">
                        <template #icon>
                            <n-icon class="icon-btn">
                                <LogOutOutline />
                            </n-icon>
                        </template>
                        退出
                    </n-button>
                </template>
                确定要退出登录吗？
            </n-popconfirm>
        </div>

        <OptionPanel placement="right" v-model:show="showOptions" />
    </n-layout-header>
</template>

<style scoped> /* localized styles */
.header-container {
    @apply flex justify-end items-center;
    /* color: v-bind(themeVars.textColor1);
    background-color: v-bind(themeVars.cardColor); */
    height: 64px;
}

.header-logo {
    @apply flex justify-between items-center;
    cursor: pointer;
}

.header-logo > img {
    margin-right: 12px;
    width: 32px;
    height: 32px;
}

.header-logo > .n-text {
    font-size: 18px;
}

.header-nav {
    @apply flex justify-center items-center;
}

.header-btn-container {
    @apply flex justify-center items-center;
}

.header-btn {
    @apply flex justify-center items-center mx-1;
    padding-left: 32px;
    padding-right: 32px;
    cursor: pointer;
    align-self: center;
}
</style>

<style> /* overriding styles */

.header-nav.n-menu .n-menu-item-content {
    padding-right: 32px;
}

.header-btn .n-button__icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    font-size: 20px;
}
</style>