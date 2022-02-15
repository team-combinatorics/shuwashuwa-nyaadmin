<script setup lang="tsx">

import { NSpace, NButton, NPopconfirm, NIcon, NText, NLayoutHeader, NMenu } from 'naive-ui';
import { useThemeVars } from 'naive-ui';
import { usePreferredDark, useWindowSize } from '@vueuse/core';

import { RouterLink } from 'vue-router';

import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

import { HomeOutline, PeopleOutline, ListOutline, SettingsOutline, LogOutOutline } from '@vicons/ionicons5';
import { ToolKit, ChartRiver } from '@vicons/carbon';

import OptionPanel from './OptionPanel/index.vue';
import About from './About.vue';

const themeVars = useThemeVars();
console.log(themeVars);

const prefersDark = usePreferredDark();

/* make it responsive */
const windowSize = useWindowSize();
const hideText = computed(() => {
    return windowSize.width.value <= 1000;
})
const useMobileLayout = computed(() => {
    return windowSize.width.value <= 480;
})
const drawerWidth = computed(() => {
    // make it possible to close
    return useMobileLayout.value ? windowSize.width.value*0.85 : 400;
})

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
    return () => h(NIcon, {}, { default: () => h(icon) })
}

const renderRouterLink = (to: string, title: string) => {
    return () => h(
        RouterLink,
        { to: to, title: title },
        { default: () => hideText.value?  '' : title }
    )
}

// default value is current route
const currentRouteName = computed(() => {
    console.log(router.currentRoute.value);
    return router.currentRoute.value.name as string
});

const navOptions = [
    {
        label: renderRouterLink('/', '首页'),
        key: 'index',
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
        icon: renderIcon(ToolKit)
    },
    {
        label: renderRouterLink('/stats', '统计'),
        key: 'stats',
        icon: renderIcon(ChartRiver)
    },
]

/* About */
const showAbout = ref(false);
const doShowAbout = () => {
    showAbout.value = true;
}

</script>

<template>
    <n-layout-header class="header-container">
        <!-- logo -->
        <div class="header-logo">
            <img :src="prefersDark ? '/shuwashuwa-text-dark.png': '/shuwashuwa-text-light.png'" 
            @click="doShowAbout"/>
            <n-text>{{ hideText ? '' : '修哇修哇超管控制台' }}</n-text>
        </div>

        <!-- about -->
        <About v-model:show="showAbout"/>

        <!-- navbar -->
        <n-menu :options="navOptions" :value="currentRouteName" class="header-nav"/>

        <!-- buttons -->
        <div class="header-btn-container">

            <n-button text @click="doShowOptions" class="header-btn">
                <template #icon>
                    <n-icon class="icon-btn">
                        <settings-outline />
                    </n-icon>
                </template>
                {{ hideText ? '' : '选项' }}
            </n-button>

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
                                <log-out-outline />
                            </n-icon>
                        </template>
                        {{ hideText ? '' : '退出' }}
                    </n-button>
                </template>
                确定要退出登录吗？
            </n-popconfirm>
        </div>

        <OptionPanel placement="right" :width="drawerWidth" v-model:show="showOptions" />

    </n-layout-header>
</template>

<style scoped> /* localized styles */
.header-container {
    @apply flex justify-around items-center;
    background-color: v-bind(themeVars.modalColor);
    height: 64px;
}

.header-logo {
    @apply flex justify-between items-center;
    flex-shrink: 0;
    min-width: 222px;
}

.header-logo > img {
    cursor: pointer;
    margin-left: 14px;
    margin-right: 14px;
    width: 32px;
    height: 32px;
}

.header-logo > .n-text {
    font-size: 18px;
}

.header-nav {
    @apply flex justify-center items-center;
    flex-shrink: 0;
}

.header-btn-container {
    @apply flex justify-center items-center;
    flex-shrink: 0;
}

.header-btn {
    @apply flex justify-center items-center mx-1;
    padding-left: 20px;
    padding-right: 20px;
    cursor: pointer;
    align-self: center;
}
</style>

<style> /* overriding styles */
.header-nav.n-menu .n-menu-item-content {
    padding-right: 20px;
    padding-left: 20px !important;
}

.header-btn .n-button__icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    font-size: 20px;
}

/* tablets and small windows*/
@media screen and (max-width: 1000px) {
    .header-logo {
        min-width: 60px !important;
    }

    .header-nav .n-menu-item-content__icon,
    .header-btn .n-button__icon {
        margin-right: 0px !important;
    }

    .header-btn-container {
        @apply flex justify-end items-center;
    }
}

/* phones */
@media screen and (max-width: 480px) {
    .header-container {
        /* overflows */
        justify-content: start !important;
        overflow: scroll;
    }
}

</style>